import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const AIRoutineBuilder = () => {
  // State for courses data
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  
  // AI Preferences State
  const [preferences, setPreferences] = useState({
    // Time preferences
    preferredTimes: {
      morning: true,    // 8:00 AM - 11:20 AM
      afternoon: true,  // 12:30 PM - 4:50 PM
      evening: false,   // 5:00 PM - 6:20 PM
    },
    
    // Day preferences
    freeDays: {
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    },
    
    // Course priorities
    coursePriorities: [],
    maxClassesPerDay: 4,
    avoidLabDays: false,
    avoidConsecutiveClasses: true,
    minBreakBetweenClasses: 30,
    optimizeFor: 'freeDays',
  });
  
  const [generatedSchedules, setGeneratedSchedules] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreferences, setShowPreferences] = useState(true);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [selectedCourseForPriority, setSelectedCourseForPriority] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('required');
  const [availableCourseCodes, setAvailableCourseCodes] = useState([]);
  
  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://usis-cdn.eniamza.com/connect.json');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
        
        // Extract unique course codes
        const uniqueCourseCodes = [...new Set(data.map(course => course.courseCode))];
        setAvailableCourseCodes(uniqueCourseCodes);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Filter available course codes based on search
  const filteredCourseCodes = useMemo(() => {
    if (!courseSearchTerm) return availableCourseCodes;
    return availableCourseCodes.filter(code => 
      code.toLowerCase().includes(courseSearchTerm.toLowerCase())
    );
  }, [availableCourseCodes, courseSearchTerm]);
  
  // Add course priority
  const addCoursePriority = () => {
    if (!selectedCourseForPriority || !priorityLevel) return;
    
    const newPriority = {
      courseCode: selectedCourseForPriority,
      priority: priorityLevel,
    };
    
    setPreferences(prev => ({
      ...prev,
      coursePriorities: [...prev.coursePriorities, newPriority]
    }));
    
    setSelectedCourseForPriority('');
    setCourseSearchTerm('');
  };
  
  // Remove course priority
  const removeCoursePriority = (courseCode) => {
    setPreferences(prev => ({
      ...prev,
      coursePriorities: prev.coursePriorities.filter(cp => cp.courseCode !== courseCode)
    }));
  };
  
  // Helper function to parse time from course schedule
  const getCourseTimeSlots = (course) => {
    const slots = [];
    
    if (course.preRegSchedule) {
      const scheduleLines = course.preRegSchedule.split('\n');
      scheduleLines.forEach(line => {
        const match = line.match(/(\w+)\((\d+:\d+ [AP]M)-(\d+:\d+ [AP]M)-([^)]+)\)/);
        if (match) {
          const day = match[1].toUpperCase();
          const startTime = match[2];
          const endTime = match[3];
          slots.push({ day, startTime, endTime, type: 'class' });
        }
      });
    }
    
    if (course.preRegLabSchedule) {
      const scheduleLines = course.preRegLabSchedule.split('\n');
      scheduleLines.forEach(line => {
        const labMatch = line.match(/(\w+)\((\d+:\d+ [AP]M)-(\d+:\d+ [AP]M)-([^)]+)\)/);
        if (labMatch) {
          const day = labMatch[1].toUpperCase();
          const startTime = labMatch[2];
          const endTime = labMatch[3];
          slots.push({ day, startTime, endTime, type: 'lab' });
        }
      });
    }
    
    return slots;
  };
  
  // Check time conflict between two courses
  const hasTimeConflict = (course1, course2) => {
    const slots1 = getCourseTimeSlots(course1);
    const slots2 = getCourseTimeSlots(course2);
    
    for (const slot1 of slots1) {
      for (const slot2 of slots2) {
        if (slot1.day === slot2.day) {
          // Check if times overlap
          const parseTime = (timeStr) => {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours !== 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
          };
          
          const start1 = parseTime(slot1.startTime);
          const end1 = parseTime(slot1.endTime);
          const start2 = parseTime(slot2.startTime);
          const end2 = parseTime(slot2.endTime);
          
          if (start1 < end2 && start2 < end1) {
            return true;
          }
        }
      }
    }
    
    return false;
  };
  
  // Score a schedule based on preferences
  const scoreSchedule = (schedule) => {
    let score = 0;
    
    // 1. Check for free days preference
    const daysUsed = new Set();
    schedule.forEach(course => {
      const slots = getCourseTimeSlots(course);
      slots.forEach(slot => {
        const dayLower = slot.day.toLowerCase();
        if (!preferences.freeDays[dayLower]) {
          daysUsed.add(dayLower);
        }
      });
    });
    
    const freeDaysCount = 7 - daysUsed.size;
    score += freeDaysCount * 20;
    
    // 2. Check preferred times
    const isPreferredTime = (startTime) => {
      const time = startTime.toLowerCase();
      if (time.includes('am')) {
        return preferences.preferredTimes.morning;
      } else if (time.includes('pm')) {
        const hour = parseInt(time.split(':')[0]);
        return (hour >= 12 && hour <= 4) ? preferences.preferredTimes.afternoon : preferences.preferredTimes.evening;
      }
      return false;
    };
    
    schedule.forEach(course => {
      const slots = getCourseTimeSlots(course);
      slots.forEach(slot => {
        if (isPreferredTime(slot.startTime)) {
          score += 10;
        }
      });
    });
    
    // 3. Check course priorities
    preferences.coursePriorities.forEach(priority => {
      const hasCourse = schedule.some(course => course.courseCode === priority.courseCode);
      if (hasCourse) {
        switch (priority.priority) {
          case 'required': score += 50; break;
          case 'high': score += 30; break;
          case 'medium': score += 15; break;
          case 'low': score += 5; break;
        }
      }
    });
    
    // 4. Check max classes per day
    const classesPerDay = {};
    schedule.forEach(course => {
      const slots = getCourseTimeSlots(course);
      slots.forEach(slot => {
        if (!classesPerDay[slot.day]) classesPerDay[slot.day] = 0;
        classesPerDay[slot.day]++;
      });
    });
    
    Object.values(classesPerDay).forEach(count => {
      if (count > preferences.maxClassesPerDay) {
        score -= (count - preferences.maxClassesPerDay) * 15;
      }
    });
    
    // 5. Penalize labs if user wants to avoid them
    if (preferences.avoidLabDays) {
      schedule.forEach(course => {
        if (course.preRegLabSchedule) {
          score -= 10;
        }
      });
    }
    
    return score;
  };
  
  // Generate optimal schedules
  const generateOptimalSchedules = () => {
    if (!courses || courses.length === 0) {
      alert('No courses available to generate schedule');
      return;
    }
    
    setIsGenerating(true);
    
    // Filter courses with capacity
    const availableCourses = courses.filter(course => course.capacity > 0);
    
    // Group courses by course code
    const coursesByCode = {};
    availableCourses.forEach(course => {
      if (!coursesByCode[course.courseCode]) {
        coursesByCode[course.courseCode] = [];
      }
      coursesByCode[course.courseCode].push(course);
    });
    
    // Get required courses
    const requiredCourseCodes = preferences.coursePriorities
      .filter(cp => cp.priority === 'required')
      .map(cp => cp.courseCode);
    
    const otherCourseCodes = availableCourseCodes.filter(
      code => !requiredCourseCodes.includes(code)
    );
    
    const allCourseCodes = [...requiredCourseCodes, ...otherCourseCodes];
    
    // Generate schedules using backtracking
    const possibleSchedules = [];
    const maxSchedules = 500;
    
    const backtrack = (currentSchedule, startIndex) => {
      if (possibleSchedules.length >= maxSchedules) return;
      
      if (currentSchedule.length >= 5 || startIndex >= allCourseCodes.length) {
        if (currentSchedule.length > 0) {
          possibleSchedules.push([...currentSchedule]);
        }
        return;
      }
      
      const currentCourseCode = allCourseCodes[startIndex];
      const sections = coursesByCode[currentCourseCode] || [];
      
      // Try each section
      for (const section of sections) {
        let hasConflict = false;
        for (const selectedCourse of currentSchedule) {
          if (hasTimeConflict(section, selectedCourse)) {
            hasConflict = true;
            break;
          }
        }
        
        if (!hasConflict) {
          currentSchedule.push(section);
          backtrack(currentSchedule, startIndex + 1);
          currentSchedule.pop();
        }
      }
      
      // Skip this course
      backtrack(currentSchedule, startIndex + 1);
    };
    
    backtrack([], 0);
    
    // Score and sort
    const scoredSchedules = possibleSchedules.map(schedule => ({
      schedule,
      score: scoreSchedule(schedule)
    }));
    
    scoredSchedules.sort((a, b) => b.score - a.score);
    
    // Take top 5
    const topSchedules = scoredSchedules.slice(0, 5).map(item => item.schedule);
    
    setGeneratedSchedules(topSchedules);
    setIsGenerating(false);
    
    if (topSchedules.length === 0) {
      alert('No valid schedules found. Try adjusting preferences.');
    }
  };
  
  // Reset preferences
  const resetPreferences = () => {
    setPreferences({
      preferredTimes: {
        morning: true,
        afternoon: true,
        evening: false,
      },
      freeDays: {
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
      },
      coursePriorities: [],
      maxClassesPerDay: 4,
      avoidLabDays: false,
      avoidConsecutiveClasses: true,
      minBreakBetweenClasses: 30,
      optimizeFor: 'freeDays',
    });
    setGeneratedSchedules([]);
  };
  
  // Get schedule statistics
  const getScheduleStats = (schedule) => {
    const days = new Set();
    let totalClasses = 0;
    let hasLab = false;
    
    schedule.forEach(course => {
      const slots = getCourseTimeSlots(course);
      slots.forEach(slot => {
        days.add(slot.day);
        totalClasses++;
        if (slot.type === 'lab') hasLab = true;
      });
    });
    
    return {
      totalCourses: schedule.length,
      daysUsed: days.size,
      freeDays: 7 - days.size,
      totalClasses,
      hasLab
    };
  };
  
  // Apply a schedule
  const applySchedule = (schedule) => {
    setSelectedCourses(schedule);
    alert(`Selected ${schedule.length} courses! You can now copy these to your registration.`);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold mt-6 text-gray-800">Loading AI Routine Builder</h2>
          <p className="text-gray-600 mt-2">Fetching course data from server...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Failed to Load Courses</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🤖 AI Routine Builder
            </h1>
            <p className="text-gray-600 mt-2">
              Generate the perfect class schedule with artificial intelligence
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link
              to="/pre-registration"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              ← Back
            </Link>
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
            >
              {showPreferences ? 'Hide Settings' : 'Show Settings'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Preferences */}
          <div className="lg:col-span-2">
            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-100">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">How it works</h3>
                  <p className="text-gray-600">
                    Set your preferences below, then click "Generate Schedules". The AI will analyze {courses.length} courses 
                    and find the optimal schedule combinations for you.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Preferences Panel */}
            {showPreferences && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Time Preferences */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="bg-blue-100 p-1 rounded">⏰</span>
                      Preferred Times
                    </h4>
                    <div className="space-y-3">
                      {[
                        { key: 'morning', label: 'Morning (8:00-11:20 AM)' },
                        { key: 'afternoon', label: 'Afternoon (12:30-4:50 PM)' },
                        { key: 'evening', label: 'Evening (5:00-6:20 PM)' }
                      ].map(time => (
                        <label key={time.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={preferences.preferredTimes[time.key]}
                            onChange={(e) => setPreferences(prev => ({
                              ...prev,
                              preferredTimes: { ...prev.preferredTimes, [time.key]: e.target.checked }
                            }))}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span>{time.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Free Days */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="bg-green-100 p-1 rounded">📅</span>
                      Free Days
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(preferences.freeDays).map(([day, isFree]) => (
                        <button
                          key={day}
                          onClick={() => setPreferences(prev => ({
                            ...prev,
                            freeDays: { ...prev.freeDays, [day]: !isFree }
                          }))}
                          className={`p-2 rounded-lg border transition-all ${isFree 
                            ? 'bg-green-500 text-white border-green-600' 
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Course Priorities */}
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="bg-red-100 p-1 rounded">🎯</span>
                      Course Priorities
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Search course code (e.g., CSE110)"
                            value={courseSearchTerm}
                            onChange={(e) => setCourseSearchTerm(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                          />
                          {courseSearchTerm && filteredCourseCodes.length > 0 && (
                            <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                              {filteredCourseCodes.map(code => (
                                <div
                                  key={code}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                                  onClick={() => {
                                    setSelectedCourseForPriority(code);
                                    setCourseSearchTerm('');
                                  }}
                                >
                                  {code}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <select
                          value={priorityLevel}
                          onChange={(e) => setPriorityLevel(e.target.value)}
                          className="p-3 border rounded-lg"
                        >
                          <option value="required">Required</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <button
                          onClick={addCoursePriority}
                          className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          disabled={!selectedCourseForPriority}
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Selected Priorities */}
                      <div className="space-y-2">
                        {preferences.coursePriorities.map((priority, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{priority.courseCode}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                priority.priority === 'required' ? 'bg-red-100 text-red-800' :
                                priority.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                priority.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {priority.priority}
                              </span>
                            </div>
                            <button
                              onClick={() => removeCoursePriority(priority.courseCode)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Other Settings */}
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="bg-purple-100 p-1 rounded">⚙️</span>
                      Other Settings
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-600 mb-2">
                          Max Classes Per Day: <span className="font-bold">{preferences.maxClassesPerDay}</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="6"
                          value={preferences.maxClassesPerDay}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            maxClassesPerDay: parseInt(e.target.value)
                          }))}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-3 p-2">
                          <input
                            type="checkbox"
                            checked={preferences.avoidLabDays}
                            onChange={(e) => setPreferences(prev => ({
                              ...prev,
                              avoidLabDays: e.target.checked
                            }))}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span>Avoid Days with Labs</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="md:col-span-2 flex gap-3">
                    <button
                      onClick={resetPreferences}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={generateOptimalSchedules}
                      disabled={isGenerating}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                          Generating...
                        </span>
                      ) : 'Generate Optimal Schedules'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Generated Schedules */}
            {generatedSchedules.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  ✨ Generated Schedules ({generatedSchedules.length})
                </h3>
                <div className="space-y-6">
                  {generatedSchedules.map((schedule, idx) => {
                    const stats = getScheduleStats(schedule);
                    return (
                      <div key={idx} className="border rounded-xl p-5 hover:border-purple-300 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <h4 className="font-bold text-lg text-gray-800 mb-2">Schedule #{idx + 1}</h4>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {stats.totalCourses} Courses
                              </span>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                {stats.freeDays} Free Days
                              </span>
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                {stats.totalClasses} Classes
                              </span>
                              {stats.hasLab && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                  Includes Lab
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => applySchedule(schedule)}
                            className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            Select This Schedule
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {schedule.map((course, courseIdx) => (
                            <div key={courseIdx} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-bold">{course.courseCode}</span>
                                <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                                  Sec {course.sectionName}
                                </span>
                              </div>
                              {course.preRegSchedule && (
                                <div className="text-xs text-gray-600 space-y-1">
                                  {course.preRegSchedule.split('\n').map((time, i) => (
                                    <div key={i}>{time}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Stats & Selected Courses */}
          <div>
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">📊 Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Total Courses</span>
                  <span className="font-bold text-blue-600">{courses.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Available Sections</span>
                  <span className="font-bold text-green-600">
                    {courses.filter(c => c.capacity > 0).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-600">Unique Courses</span>
                  <span className="font-bold text-purple-600">{availableCourseCodes.length}</span>
                </div>
              </div>
            </div>
            
            {/* Selected Courses Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">✅ Selected Courses</h3>
              {selectedCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No courses selected yet</p>
                  <p className="text-sm mt-1">Generate and select a schedule above</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {selectedCourses.map((course, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">{course.courseCode}</div>
                            <div className="text-sm text-gray-600">Sec {course.sectionName}</div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedCourses(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600">Total Selected:</span>
                      <span className="font-bold">{selectedCourses.length} courses</span>
                    </div>
                    <button
                      onClick={() => {
                        // Copy to clipboard or export
                        const scheduleText = selectedCourses.map(course => 
                          `${course.courseCode} - Section ${course.sectionName}`
                        ).join('\n');
                        navigator.clipboard.writeText(scheduleText);
                        alert('Schedule copied to clipboard!');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Copy Schedule
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Tips Card */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 mt-6 border border-purple-100">
              <h3 className="font-bold text-gray-800 mb-3">💡 Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Mark required courses as "Required" priority</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Select preferred time slots for better results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Choose free days to maximize your free time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>Limit max classes per day to avoid overload</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center">
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">AI is Working...</h3>
            <p className="text-gray-600">Analyzing {courses.length} courses and generating optimal schedules</p>
            <p className="text-sm text-gray-500 mt-4">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRoutineBuilder;