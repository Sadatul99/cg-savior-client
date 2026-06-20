import { extractTimeSlots } from './courseUtils';

export const hasTimeConflict = (newCourse, existingCourses) => {
  const newCourseSlots = extractTimeSlots(newCourse);

  for (const existingCourse of existingCourses) {
    const existingCourseSlots = extractTimeSlots(existingCourse);

    for (const newSlot of newCourseSlots) {
      for (const existingSlot of existingCourseSlots) {
        if (newSlot.day === existingSlot.day &&
            newSlot.timeSlot === existingSlot.timeSlot) {
          return {
            conflict: true,
            existingCourse: existingCourse,
            conflictingSlot: existingSlot
          };
        }
      }
    }
  }
  return { conflict: false };
};

export const hasExamConflict = (newCourse, existingCourses) => {
  const newMidDate = newCourse.sectionSchedule?.midExamDate;
  const newMidStart = newCourse.sectionSchedule?.midExamStartTime;
  const newMidEnd = newCourse.sectionSchedule?.midExamEndTime;
  
  const newFinalDate = newCourse.sectionSchedule?.finalExamDate;
  const newFinalStart = newCourse.sectionSchedule?.finalExamStartTime;
  const newFinalEnd = newCourse.sectionSchedule?.finalExamEndTime;

  for (const existingCourse of existingCourses) {
    const existingMidDate = existingCourse.sectionSchedule?.midExamDate;
    const existingMidStart = existingCourse.sectionSchedule?.midExamStartTime;
    const existingMidEnd = existingCourse.sectionSchedule?.midExamEndTime;
    
    const existingFinalDate = existingCourse.sectionSchedule?.finalExamDate;
    const existingFinalStart = existingCourse.sectionSchedule?.finalExamStartTime;
    const existingFinalEnd = existingCourse.sectionSchedule?.finalExamEndTime;

    // Check mid exam conflicts
    if (newMidDate && existingMidDate && 
        newMidDate === existingMidDate &&
        newMidStart && existingMidStart &&
        newMidEnd && existingMidEnd) {
      if (timesOverlap(newMidStart, newMidEnd, existingMidStart, existingMidEnd)) {
        return {
          conflict: true,
          examType: 'MID',
          existingCourse: existingCourse
        };
      }
    }

    // Check final exam conflicts
    if (newFinalDate && existingFinalDate && 
        newFinalDate === existingFinalDate &&
        newFinalStart && existingFinalStart &&
        newFinalEnd && existingFinalEnd) {
      if (timesOverlap(newFinalStart, newFinalEnd, existingFinalStart, existingFinalEnd)) {
        return {
          conflict: true,
          examType: 'FINAL',
          existingCourse: existingCourse
        };
      }
    }
  }
  return { conflict: false };
};

const timesOverlap = (start1, end1, start2, end2) => {
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
};