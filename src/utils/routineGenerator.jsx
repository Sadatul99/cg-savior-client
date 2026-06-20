import { extractTimeSlots, getUniqueFaculties } from './courseUtils';
import { hasTimeConflict, hasExamConflict } from './conflictUtils';

// AI: Find best sections for each course with individual faculty preferences
const findBestSections = (courses, courseCodes, numberOfDays, courseFacultyPreferences) => {
  // Get all sections for each course
  const courseOptions = {};
  courseCodes.forEach(code => {
    const sections = courses.filter(c => 
      c.courseCode === code && 
      (c.capacity > 0 || c.capacity === undefined)
    );
    if (sections.length > 0) {
      courseOptions[code] = sections;
    }
  });

  // If a course has a faculty preference, prioritize sections with that faculty
  if (courseFacultyPreferences) {
    Object.keys(courseOptions).forEach(code => {
      const preferredFaculty = courseFacultyPreferences[code];
      if (preferredFaculty) {
        const withFaculty = courseOptions[code].filter(c => 
          c.faculties && c.faculties.split(',').some(f => f.trim() === preferredFaculty)
        );
        if (withFaculty.length > 0) {
          courseOptions[code] = withFaculty;
        }
      }
    });
  }

  // Try to find a combination that works
  const combinations = generateCombinations(courseOptions);
  
  // Score each combination
  const scoredCombinations = combinations.map(combo => {
    const score = scoreCombination(combo, numberOfDays, courseFacultyPreferences);
    return { combination: combo, score };
  });

  // Sort by score (highest first)
  scoredCombinations.sort((a, b) => b.score - a.score);

  // Find the first combination with no conflicts
  for (const scored of scoredCombinations) {
    const conflictCheck = checkCombinationConflicts(scored.combination);
    if (!conflictCheck.hasConflict) {
      return {
        sections: scored.combination,
        selectedDays: conflictCheck.selectedDays,
        dayDistribution: conflictCheck.dayDistribution
      };
    }
  }

  // If no perfect combination, return the best one with conflicts
  return scoredCombinations[0] ? {
    sections: scoredCombinations[0].combination,
    selectedDays: [],
    dayDistribution: [],
    hasConflicts: true
  } : null;
};

// Generate all possible combinations of sections
const generateCombinations = (courseOptions) => {
  const courseCodes = Object.keys(courseOptions);
  if (courseCodes.length === 0) return [];

  let combinations = [[]];
  
  courseCodes.forEach(code => {
    const newCombinations = [];
    const sections = courseOptions[code];
    
    combinations.forEach(combo => {
      sections.forEach(section => {
        newCombinations.push([...combo, section]);
      });
    });
    
    combinations = newCombinations;
  });

  return combinations;
};

// Score a combination based on various factors
const scoreCombination = (combination, numberOfDays, courseFacultyPreferences) => {
  let score = 0;
  
  // Factor 1: Number of days used (prefer fewer days if possible)
  const usedDays = new Set();
  combination.forEach(course => {
    const slots = extractTimeSlots(course);
    slots.forEach(slot => usedDays.add(slot.day));
  });
  
  // If days used <= numberOfDays, bonus
  if (usedDays.size <= numberOfDays) {
    score += 10;
  } else {
    // Penalty for exceeding days
    score -= (usedDays.size - numberOfDays) * 5;
  }

  // Factor 2: Check faculty preferences for each course
  combination.forEach(course => {
    const preferredFaculty = courseFacultyPreferences ? courseFacultyPreferences[course.courseCode] : '';
    if (preferredFaculty) {
      // Check if the selected section has the preferred faculty
      if (course.faculties && course.faculties.split(',').some(f => f.trim() === preferredFaculty)) {
        score += 5; // Big bonus for matching preferred faculty
      } else {
        score -= 3; // Penalty for not matching preferred faculty
      }
    } else {
      // If no preference, prefer sections with any faculty
      if (course.faculties && course.faculties !== 'TBA') {
        score += 1;
      }
    }
  });

  // Factor 3: Prefer sections with higher capacity (more seats available)
  combination.forEach(course => {
    const available = course.capacity - course.consumedSeat;
    if (available > 10) score += 1;
    else if (available > 5) score += 0.5;
  });

  // Factor 4: Prefer sections with labs (lab courses are important)
  combination.forEach(course => {
    if (course.labSchedules && course.labSchedules.length > 0) {
      score += 1;
    }
  });

  return score;
};

// Check for conflicts in a combination
const checkCombinationConflicts = (combination) => {
  const conflicts = [];
  const usedDays = new Set();
  const dayDistribution = {};

  for (let i = 0; i < combination.length; i++) {
    const slots = extractTimeSlots(combination[i]);
    slots.forEach(slot => {
      usedDays.add(slot.day);
      if (!dayDistribution[slot.day]) {
        dayDistribution[slot.day] = [];
      }
      if (!dayDistribution[slot.day].includes(combination[i].courseCode)) {
        dayDistribution[slot.day].push(combination[i].courseCode);
      }
    });

    for (let j = i + 1; j < combination.length; j++) {
      const timeConflict = hasTimeConflict(combination[i], [combination[j]]);
      if (timeConflict.conflict) {
        conflicts.push({
          course1: combination[i].courseCode,
          course2: combination[j].courseCode,
          type: 'time'
        });
      }

      const examConflict = hasExamConflict(combination[i], [combination[j]]);
      if (examConflict.conflict) {
        conflicts.push({
          course1: combination[i].courseCode,
          course2: combination[j].courseCode,
          type: 'exam',
          examType: examConflict.examType
        });
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    selectedDays: Array.from(usedDays),
    dayDistribution: Object.keys(dayDistribution).map(day => ({
      day,
      courses: dayDistribution[day]
    }))
  };
};

// Main AI Routine Generator - Updated to accept course-specific faculty preferences
export const generateRoutine = (allCourses, selectedCourseCodes, numberOfDays, courseFacultyPreferences) => {
  if (!selectedCourseCodes || selectedCourseCodes.length === 0) {
    return { routine: null, error: 'No courses selected' };
  }

  if (selectedCourseCodes.length < 2) {
    return { routine: null, error: 'Please select at least 2 courses' };
  }

  if (selectedCourseCodes.length > 6) {
    return { routine: null, error: 'Maximum 6 courses allowed' };
  }

  const daysCount = Math.min(Math.max(numberOfDays || 4, 2), 6);

  // Let AI find the best sections with individual faculty preferences
  const result = findBestSections(allCourses, selectedCourseCodes, daysCount, courseFacultyPreferences);

  if (!result) {
    return { routine: null, error: 'No valid combination found' };
  }

  const { sections, selectedDays, dayDistribution, hasConflicts } = result;

  // Check for conflicts in the selected sections
  const conflictCheck = checkCombinationConflicts(sections);
  
  if (conflictCheck.hasConflict) {
    return { 
      routine: null, 
      error: 'Conflicts detected', 
      conflicts: conflictCheck.conflicts 
    };
  }

  // Create the routine
  const routine = {
    courses: sections,
    totalCredits: sections.reduce((sum, c) => sum + (c.courseCredit || 0), 0),
    numberOfDays: daysCount,
    selectedDays: selectedDays || [],
    dayDistribution: dayDistribution || [],
    courseFacultyPreferences: courseFacultyPreferences || {},
    schedule: sections.map(course => ({
      courseCode: course.courseCode,
      section: course.sectionName,
      faculty: course.faculties || 'TBA',
      preferredFaculty: courseFacultyPreferences ? courseFacultyPreferences[course.courseCode] : '',
      timeSlots: extractTimeSlots(course)
    }))
  };

  return { routine, error: null, conflicts: [] };
};

// Helper function to get available days for a course
export const getAvailableDaysForCourse = (course) => {
  const slots = extractTimeSlots(course);
  const days = new Set();
  slots.forEach(slot => days.add(slot.day));
  return Array.from(days);
};

// Helper function to get available days for multiple courses
export const getAvailableDaysForCourses = (courses) => {
  const days = new Set();
  courses.forEach(course => {
    const courseDays = getAvailableDaysForCourse(course);
    courseDays.forEach(day => days.add(day));
  });
  return Array.from(days);
};