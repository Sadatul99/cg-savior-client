const PreRegistration = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [availableCourse, setAvailableCourse] = useState(null);
  const [selectedCourseInfo, setSelectedCourseInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [days] = useState(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [routineKey, setRoutineKey] = useState(0);
  const availableCoursesRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://usis-cdn.eniamza.com/connect.json');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
        initializeTimeSlots();
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const initializeTimeSlots = () => {
    const slots = [
      '08:00 AM-09:20 AM',
      '09:30 AM-10:50 AM', 
      '11:00 AM-12:20 PM',
      '12:30 PM-01:50 PM',
      '02:00 PM-03:20 PM',
      '03:30 PM-04:50 PM',
      '05:00 PM-06:20 PM'
    ];
    setTimeSlots(slots);
  };

  // Save scroll position
  const saveScrollPosition = () => {
    if (availableCoursesRef.current && !isScrollingRef.current) {
      scrollPositionRef.current = availableCoursesRef.current.scrollTop;
    }
  };

  // Restore scroll position
  const restoreScrollPosition = () => {
    setTimeout(() => {
      if (availableCoursesRef.current && scrollPositionRef.current !== undefined) {
        availableCoursesRef.current.scrollTop = scrollPositionRef.current;
      }
    }, 10);
  };

  // Handle scroll events
  const handleScroll = () => {
    if (availableCoursesRef.current && !isScrollingRef.current) {
      isScrollingRef.current = true;
      scrollPositionRef.current = availableCoursesRef.current.scrollTop;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    }
  };

  const handleSearch = (courseCode) => {
    setSearchTerm(courseCode);
    if (courseCode.trim() === '') {
      setFilteredCourses([]);
      setAvailableCourse(null);
      return;
    }
    
    // Keep courses in their original order
    const filtered = courses.filter(course => 
      course.courseCode.toLowerCase().includes(courseCode.toLowerCase())
    );
    
    setFilteredCourses(filtered);
    
    if (filtered.length > 0) {
      setAvailableCourse(filtered[0]);
    } else {
      setAvailableCourse(null);
    }
  };

  const handleAvailableCourseClick = (course) => {
    // Just set the available course without affecting the list
    setAvailableCourse(course);
  };

  const hasTimeConflict = (newCourse, existingCourses) => {
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

  const extractTimeSlots = (course) => {
    const slots = [];
    
    // Extract class schedules from classSchedules array
    if (course.sectionSchedule?.classSchedules && course.sectionSchedule.classSchedules.length > 0) {
      course.sectionSchedule.classSchedules.forEach(schedule => {
        const timeSlots = convertToTimeSlots(schedule.startTime, schedule.endTime);
        timeSlots.forEach(timeSlot => {
          slots.push({
            day: schedule.day.toUpperCase(),
            timeSlot: timeSlot,
            type: 'class',
            course: course,
            room: course.roomName || course.roomNumber || 'Class Room'
          });
        });
      });
    }
    
    // Extract lab schedules from labSchedules array
    if (course.labSchedules && course.labSchedules.length > 0) {
      course.labSchedules.forEach(schedule => {
        const timeSlots = convertToTimeSlots(schedule.startTime, schedule.endTime);
        timeSlots.forEach(timeSlot => {
          slots.push({
            day: schedule.day.toUpperCase(),
            timeSlot: timeSlot,
            type: 'lab',
            course: course,
            room: course.labRoomName || 'Lab Room'
          });
        });
      });
    }
    
    // Extract from preRegSchedule string for classes
    if (course.preRegSchedule && course.preRegSchedule.trim() !== '') {
      const scheduleLines = course.preRegSchedule.split('\n');
      scheduleLines.forEach(line => {
        const match = line.match(/(\w+)\((\d+:\d+ [AP]M)-(\d+:\d+ [AP]M)-([^)]+)\)/);
        if (match) {
          const day = match[1].toUpperCase();
          const startTime = match[2];
          const endTime = match[3];
          const room = match[4];
          const timeSlots = convertFromTimeRange(startTime, endTime);
          timeSlots.forEach(timeSlot => {
            slots.push({
              day: day,
              timeSlot: timeSlot,
              type: 'class',
              course: course,
              room: room
            });
          });
        }
      });
    }

    // Extract lab from preRegLabSchedule
    if (course.preRegLabSchedule && course.preRegLabSchedule.trim() !== '') {
      const scheduleLines = course.preRegLabSchedule.split('\n');
      scheduleLines.forEach(line => {
        const labMatch = line.match(/(\w+)\((\d+:\d+ [AP]M)-(\d+:\d+ [AP]M)-([^)]+)\)/);
        if (labMatch) {
          const day = labMatch[1].toUpperCase();
          const startTime = labMatch[2];
          const endTime = labMatch[3];
          const room = labMatch[4];
          const timeSlots = convertFromTimeRange(startTime, endTime);
          timeSlots.forEach(timeSlot => {
            slots.push({
              day: day,
              timeSlot: timeSlot,
              type: 'lab',
              course: course,
              room: room
            });
          });
        }
      });
    }
    
    return slots;
  };

  const convertToTimeSlots = (startTime, endTime) => {
    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      const time = new Date(`2000-01-01 ${timeStr}`);
      return time.toLocaleString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }).toUpperCase();
    };

    const start = formatTime(startTime);
    const end = formatTime(endTime);
    
    if (!start || !end) return [];
    
    return convertFromTimeRange(start, end);
  };

  const convertFromTimeRange = (startTime, endTime) => {
    const timeSlotsOrder = [
      '08:00 AM-09:20 AM',
      '09:30 AM-10:50 AM',
      '11:00 AM-12:20 PM',
      '12:30 PM-01:50 PM',
      '02:00 PM-03:20 PM',
      '03:30 PM-04:50 PM',
      '05:00 PM-06:20 PM'
    ];

    const start = startTime.toUpperCase();
    const end = endTime.toUpperCase();
    
    // Check if it's a standard time slot
    const directMatch = `${start}-${end}`;
    if (timeSlotsOrder.includes(directMatch)) {
      return [directMatch];
    }
    
    // Handle sessions that span multiple time slots (like labs)
    const matchingSlots = [];
    
    // Parse times for comparison
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const targetStart = parseTime(start);
    const targetEnd = parseTime(end);

    // Find all slots that fall within the time range
    for (let i = 0; i < timeSlotsOrder.length; i++) {
      const slot = timeSlotsOrder[i];
      const [slotStart, slotEnd] = slot.split('-');
      
      const slotStartMinutes = parseTime(slotStart);
      const slotEndMinutes = parseTime(slotEnd);
      
      // Check if this slot overlaps with our target time range
      if (slotStartMinutes < targetEnd && slotEndMinutes > targetStart) {
        matchingSlots.push(slot);
      }
    }
    
    return matchingSlots;
  };

  const moveToSelected = () => {
    if (availableCourse) {
      // Check if same course code already exists
      const sameCourseExists = selectedCourses.some(
        course => course.courseCode === availableCourse.courseCode
      );
      
      if (sameCourseExists) {
        alert(`You have already selected a section for ${availableCourse.courseCode}. Please remove the existing section first.`);
        return;
      }
      
      // Check for time conflicts with detailed error message
      const conflictCheck = hasTimeConflict(availableCourse, selectedCourses);
      if (conflictCheck.conflict) {
        const conflictingCourse = conflictCheck.existingCourse;
        const conflictingSlot = conflictCheck.conflictingSlot;
        
        const conflictMessage = `Time conflict detected!\n\n` +
          `You are trying to add: ${availableCourse.courseCode} (Section ${availableCourse.sectionName})\n` +
          `But it conflicts with: ${conflictingCourse.courseCode} (Section ${conflictingCourse.sectionName})\n\n` +
          `Conflict Details:\n` +
          `- Day: ${conflictingSlot.day}\n` +
          `- Time: ${conflictingSlot.timeSlot}\n` +
          `- Type: ${conflictingSlot.type.toUpperCase()}\n` +
          `- Room: ${conflictingSlot.room}`;
        
        alert(conflictMessage);
        return;
      }
      
      // Save scroll position before making changes
      saveScrollPosition();
      
      // Add course to selected regardless of seat availability
      if (!selectedCourses.find(course => course.sectionId === availableCourse.sectionId)) {
        const updatedSelected = [...selectedCourses, availableCourse];
        setSelectedCourses(updatedSelected);
        setSelectedCourseInfo(availableCourse);
        setRoutineKey(prev => prev + 1);
      }
      
      // Remove from filtered courses
      const updatedFiltered = filteredCourses.filter(
        course => course.sectionId !== availableCourse.sectionId
      );
      setFilteredCourses(updatedFiltered);
      
      // Set new available course
      if (updatedFiltered.length > 0) {
        setAvailableCourse(updatedFiltered[0]);
      } else {
        setAvailableCourse(null);
      }

      // Restore scroll position
      restoreScrollPosition();
    }
  };

  const moveToAvailable = () => {
    if (selectedCourseInfo) {
      // Save scroll position before making changes
      saveScrollPosition();
      
      // Remove the specific selected course
      const updatedSelected = selectedCourses.filter(
        course => course.sectionId !== selectedCourseInfo.sectionId
      );
      setSelectedCourses(updatedSelected);
      setRoutineKey(prev => prev + 1);
      
      // Add back to filtered list if it matches the search term
      if (selectedCourseInfo.courseCode.toLowerCase().includes(searchTerm.toLowerCase())) {
        const updatedFiltered = [...filteredCourses, selectedCourseInfo];
        // Keep courses in their original order - no sorting
        setFilteredCourses(updatedFiltered);
        setAvailableCourse(selectedCourseInfo);
      }
      
      // Update selected course info to the next available course in selected list
      if (updatedSelected.length > 0) {
        setSelectedCourseInfo(updatedSelected[0]);
      } else {
        setSelectedCourseInfo(null);
      }

      // Restore scroll position
      restoreScrollPosition();
    }
  };

  const removeSelectedCourse = (courseToRemove) => {
    // Save scroll position before making changes
    saveScrollPosition();
    
    const updatedSelected = selectedCourses.filter(course => course.sectionId !== courseToRemove.sectionId);
    setSelectedCourses(updatedSelected);
    setRoutineKey(prev => prev + 1);
    
    if (selectedCourseInfo?.sectionId === courseToRemove.sectionId) {
      if (updatedSelected.length > 0) {
        setSelectedCourseInfo(updatedSelected[0]);
      } else {
        setSelectedCourseInfo(null);
      }
    }
    
    if (courseToRemove.courseCode.toLowerCase().includes(searchTerm.toLowerCase())) {
      const updatedFiltered = [...filteredCourses, courseToRemove];
      // Keep courses in their original order - no sorting
      setFilteredCourses(updatedFiltered);
    }

    // Restore scroll position
    restoreScrollPosition();
  };

  const getCourseInTimeSlot = (day, timeSlot) => {
    const allSlots = [];
    
    // Collect all time slots from all selected courses
    selectedCourses.forEach(course => {
      const courseSlots = extractTimeSlots(course);
      courseSlots.forEach(slot => {
        if (slot.day === day.toUpperCase() && slot.timeSlot === timeSlot) {
          allSlots.push(slot);
        }
      });
    });
    
    // Return the first slot found
    return allSlots.length > 0 ? allSlots[0] : null;
  };

  const getAllCoursesInTimeSlot = (day, timeSlot) => {
    const allSlots = [];
    
    // Collect all time slots from all selected courses
    selectedCourses.forEach(course => {
      const courseSlots = extractTimeSlots(course);
      courseSlots.forEach(slot => {
        if (slot.day === day.toUpperCase() && slot.timeSlot === timeSlot) {
          allSlots.push(slot);
        }
      });
    });
    
    return allSlots;
  };

  const getRoutineDisplayText = (slot) => {
    if (!slot) return null;
    
    const courseCode = slot.course.courseCode;
    const section = slot.course.sectionName.replace('(Closed)', '').trim();
    const faculty = slot.course.faculties || 'TBA';
    const room = slot.room || 'TBA';
    
    return `${courseCode}-${section}-${faculty}-${room}`;
  };

  const formatTimeForDisplay = (scheduleString) => {
    if (!scheduleString) return [];
    return scheduleString.split('\n').map(line => line.trim()).filter(line => line);
  };

  const CourseButton = ({ course, isSelected = false, onClick, onRemove, showRemove = false }) => {
    const isClosed = course.capacity === 0;
    
    return (
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => onClick(course)}
          className={`
            flex-1 text-left p-3 rounded border transition-colors
            ${isSelected 
              ? 'bg-blue-500 text-white border-blue-600' 
              : isClosed
              ? 'bg-yellow-100 text-gray-700 border-yellow-300 hover:bg-yellow-200'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          {course.courseCode}. sec-{course.sectionName}
          {isClosed && ' (Closed)'}
        </button>
        {showRemove && (
          <button
            onClick={() => onRemove(course)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            ×
          </button>
        )}
      </div>
    );
  };

  // CORRECTLY PLACED useMemo hook - AFTER CourseButton definition
  const courseList = useMemo(() => {
    return filteredCourses.map((course) => (
      <CourseButton
        key={course.sectionId}
        course={course}
        isSelected={availableCourse?.sectionId === course.sectionId}
        onClick={handleAvailableCourseClick}
      />
    ));
  }, [filteredCourses, availableCourse]);

  // CORRECTLY PLACED getExamSchedule FUNCTION
  const getExamSchedule = () => {
    const exams = [];
    
    // Collect all exams from selected courses
    selectedCourses.forEach(course => {
      const courseCode = course.courseCode;
      const sectionSchedule = course.sectionSchedule;
      
      // Add Mid Exam
      if (sectionSchedule?.midExamDate && sectionSchedule?.midExamStartTime && sectionSchedule?.midExamEndTime) {
        const midDate = new Date(sectionSchedule.midExamDate);
        const dayName = midDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        const formattedDate = midDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }).replace(/\//g, '-');
        
        const formatTime = (timeStr) => {
          if (!timeStr) return '';
          const time = new Date(`2000-01-01 ${timeStr}`);
          return time.toLocaleString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          });
        };
        
        const midStartTime = formatTime(sectionSchedule.midExamStartTime);
        const midEndTime = formatTime(sectionSchedule.midExamEndTime);
        
        exams.push({
          day: `${dayName} (${formattedDate})`,
          time: `${midStartTime} - ${midEndTime}`,
          exam: 'MID',
          course: courseCode,
          rawDate: sectionSchedule.midExamDate // Add raw date for sorting
        });
      }
      
      // Add Final Exam
      if (sectionSchedule?.finalExamDate && sectionSchedule?.finalExamStartTime && sectionSchedule?.finalExamEndTime) {
        const finalDate = new Date(sectionSchedule.finalExamDate);
        const dayName = finalDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        const formattedDate = finalDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }).replace(/\//g, '-');
        
        const formatTime = (timeStr) => {
          if (!timeStr) return '';
          const time = new Date(`2000-01-01 ${timeStr}`);
          return time.toLocaleString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          });
        };
        
        const finalStartTime = formatTime(sectionSchedule.finalExamStartTime);
        const finalEndTime = formatTime(sectionSchedule.finalExamEndTime);
        
        exams.push({
          day: `${dayName} (${formattedDate})`,
          time: `${finalStartTime} - ${finalEndTime}`,
          exam: 'FINAL',
          course: courseCode,
          rawDate: sectionSchedule.finalExamDate // Add raw date for sorting
        });
      }
    });
    
    // Sort exams by date - FIXED VERSION
    return exams.sort((a, b) => {
      // Use the raw date instead of trying to extract from formatted string
      const dateA = new Date(a.rawDate);
      const dateB = new Date(b.rawDate);
      return dateA - dateB;
    }).map(exam => {
      // Remove the rawDate property before returning
      const { rawDate, ...examWithoutRawDate } = exam;
      return examWithoutRawDate;
    });
  };

  const CourseInfoCard = ({ title, course, isSelected = false }) => {
    if (!course) {
      return (
        <div className={`border-2 rounded-lg p-4 ${isSelected ? 'border-blue-500 ' : 'border-gray-300'} h-96 flex items-center justify-center`}>
          <p className="text-gray-500 text-center">No course selected</p>
        </div>
      );
    }

    const remainingSeats = course.capacity - course.consumedSeat;
    const isClosed = course.capacity === 0;
    const isOverbooked = remainingSeats < 0;

    const classTimes = formatTimeForDisplay(course.preRegSchedule);
    const labTimes = formatTimeForDisplay(course.preRegLabSchedule);

    return (
      <div className={`border-2 rounded-lg p-4 ${isSelected ? 'border-blue-500 ' : 'border-gray-300'} h-96 overflow-y-auto`}>
        <h3 className="font-bold text-lg mb-4 text-center">{title}</h3>
        <div className="space-y-3">
          {/* Course Name */}
          <div className="flex items-start">
            <span className="font-medium w-32">Course Name :</span>
            <span className="font-semibold flex-1">{course.courseCode}</span>
          </div>
          
          {/* Faculty */}
          <div className="flex items-start">
            <span className="font-medium w-32">Faculty :</span>
            <span className="flex-1">{course.faculties || 'TBA'}</span>
          </div>
          
          {/* Section */}
          <div className="flex items-start">
            <span className="font-medium w-32">Section :</span>
            <span className="flex-1">{course.sectionName.replace('(Closed)', '').trim()}</span>
          </div>
          
          {/* Time */}
          <div className="flex items-start">
            <span className="font-medium w-32">Time :</span>
            <div className="flex-1">
              {classTimes.map((time, index) => (
                <div key={index} className="text-sm">{time}</div>
              ))}
              {labTimes.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">Lab : </span>
                  {labTimes.map((time, index) => (
                    <div key={index} className="text-sm">{time}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Exam Day */}
          <div className="flex items-start">
            <span className="font-medium w-32">Exam Day :</span>
            <span className="flex-1 text-sm">{course.sectionSchedule?.finalExamDetail || 'Not scheduled'}</span>
          </div>
          
          {/* Total Seat */}
          <div className="flex items-start">
            <span className="font-medium w-32">Total Seat :</span>
            <span className="flex-1">{course.capacity}</span>
          </div>
          
          {/* Seat Booked */}
          <div className="flex items-start">
            <span className="font-medium w-32">Seat Booked :</span>
            <span className="flex-1">{course.consumedSeat}</span>
          </div>
          
          {/* Remaining */}
          <div className="flex items-start">
            <span className="font-medium w-32">Remaining :</span>
            <span className={`flex-1 font-semibold
              ${isOverbooked ? 'text-red-600' : ''}
              ${remainingSeats === 0 ? 'text-orange-600' : ''}
              ${remainingSeats > 0 ? 'text-green-600' : ''}
            `}>
              {remainingSeats}
            </span>
          </div>
          
          {isClosed && (
            <div className="text-yellow-600 text-sm font-medium text-center mt-2 p-2 bg-yellow-50 rounded">
              Section Closed - Can still be selected
            </div>
          )}
        </div>
      </div>
    );
  };

  const downloadRoutineAsPDF = () => {
    const printWindow = window.open('', '_blank');
    const examSchedule = getExamSchedule();
    
    const routineContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Class Routine & Exam Schedule</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px; }
          .routine-table, .exam-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .routine-table th, .routine-table td, .exam-table th, .exam-table td { border: 1px solid #000; padding: 8px; text-align: center; }
          .routine-table th, .exam-table th { background-color: #f0f0f0; }
          .class-cell { background-color: #dbeafe; }
          .lab-cell { background-color: #fef3c7; }
          .course-info { font-size: 10px; }
          .mid-exam { background-color: #dbeafe; }
          .final-exam { background-color: #dcfce7; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Class Routine & Exam Schedule</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <!-- Class Routine Section -->
        <div class="section">
          <div class="section-title">Class Routine</div>
          <table class="routine-table">
            <thead>
              <tr>
                <th>Time/Day</th>
                ${days.map(day => `<th>${day}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${timeSlots.map(timeSlot => `
                <tr>
                  <td><strong>${timeSlot}</strong></td>
                  ${days.map(day => {
                    const slots = getAllCoursesInTimeSlot(day, timeSlot);
                    const displayText = slots.length > 0 ? getRoutineDisplayText(slots[0]) : null;
                    const type = slots.length > 0 ? slots[0].type : null;
                    return `
                      <td class="${slots.length > 0 ? (type === 'lab' ? 'lab-cell' : 'class-cell') : ''}">
                        ${displayText ? `
                          <div class="course-info">
                            <strong>${displayText}</strong><br/>
                            ${type === 'lab' ? 'LAB' : 'CLASS'}
                          </div>
                        ` : '-'}
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Exam Schedule Section -->
        ${examSchedule.length > 0 ? `
        <div class="section">
          <div class="section-title">Exam Schedule</div>
          <table class="exam-table">
            <thead>
              <tr>
                <th>DAY</th>
                <th>TIME</th>
                <th>EXAM</th>
                <th>COURSE</th>
              </tr>
            </thead>
            <tbody>
              ${examSchedule.map(exam => `
                <tr class="${exam.exam === 'MID' ? 'mid-exam' : 'final-exam'}">
                  <td>${exam.day}</td>
                  <td>${exam.time}</td>
                  <td><strong>${exam.exam}</strong></td>
                  <td><strong>${exam.course}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Schedule
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(routineContent);
    printWindow.document.close();
  };

  // Social Sharing Functions
  const shareOnWhatsApp = () => {
    const routineText = generateRoutineText();
    const encodedText = encodeURIComponent(routineText);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const shareOnMessenger = () => {
    const routineText = generateRoutineText();
    const encodedText = encodeURIComponent(routineText);
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(window.location.href)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.href)}&quote=${encodedText}`, '_blank');
  };

  const shareViaEmail = () => {
    const routineText = generateRoutineText();
    const subject = 'My Class Routine';
    const body = routineText;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const shareViaTelegram = () => {
    const routineText = generateRoutineText();
    const encodedText = encodeURIComponent(routineText);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`, '_blank');
  };

  const generateRoutineText = () => {
    let text = `📚 My Class Routine\n\n`;
    
    selectedCourses.forEach(course => {
      text += `📖 ${course.courseCode} - Section ${course.sectionName}\n`;
      
      // Add class times
      if (course.preRegSchedule) {
        const classTimes = formatTimeForDisplay(course.preRegSchedule);
        classTimes.forEach(time => {
          text += `🕒 ${time}\n`;
        });
      }
      
      // Add lab times
      if (course.preRegLabSchedule) {
        const labTimes = formatTimeForDisplay(course.preRegLabSchedule);
        labTimes.forEach(time => {
          text += `🔬 Lab: ${time}\n`;
        });
      }
      
      text += '\n';
    });
    
    // Add exam schedule
    const exams = getExamSchedule();
    if (exams.length > 0) {
      text += `📝 Exam Schedule:\n`;
      exams.forEach(exam => {
        text += `📅 ${exam.day} - ${exam.time} - ${exam.exam} - ${exam.course}\n`;
      });
    }
    
    text += `\nGenerated via PrePre Registration`;
    return text;
  };

  if (loading) {
    return (
      <div className="min-h-screen  p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 ">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  p-4 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading courses: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6">
      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Section 1: Info for Available */}
          <div className="lg:col-span-3">
            <CourseInfoCard 
              title="Info for Available" 
              course={availableCourse} 
            />
          </div>

          {/* Section 2: Available Courses + Buttons + Selected Courses */}
          <div className="lg:col-span-6">
            <div className="flex gap-4 items-start">
              
              {/* Available Courses */}
              <div className="flex-1">
                <div className=" rounded-lg shadow-sm border-2 border-gray-300 h-96 flex flex-col">
                  <div className="p-3 border-b border-gray-200">
                    <h2 className="font-bold text-lg ">Available Courses</h2>
                  </div>
                  
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Search course (e.g., MAT110)"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Courses List */}
                  <div 
                    ref={availableCoursesRef}
                    className="flex-1 overflow-y-auto"
                    onScroll={handleScroll}
                  >
                    <div className="p-3">
                      {filteredCourses.length === 0 ? (
                        <p className=" text-center py-8">
                          {searchTerm ? 'No courses found' : 'Search for a course'}
                        </p>
                      ) : (
                        courseList
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <button
                  onClick={moveToSelected}
                  disabled={!availableCourse}
                  className="w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded text-xl font-bold transition-colors"
                  title="Add to Selected"
                >
                  &gt;
                </button>
                <button
                  onClick={moveToAvailable}
                  disabled={!selectedCourseInfo}
                  className="w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded text-xl font-bold transition-colors"
                  title="Remove from Selected"
                >
                  &lt;
                </button>
              </div>

              {/* Selected Courses */}
              <div className="flex-1">
                <div className=" rounded-lg shadow-sm border-2 border-gray-300 h-96 flex flex-col">
                  <div className="p-3 border-b border-gray-200">
                    <h2 className="font-bold text-lg ">Selected Courses</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedCourses.length} course(s) selected
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-3">
                      {selectedCourses.length === 0 ? (
                        <p className=" text-center py-8">No courses selected</p>
                      ) : (
                        selectedCourses.map((course) => (
                          <CourseButton
                            key={course.sectionId}
                            course={course}
                            isSelected={selectedCourseInfo?.sectionId === course.sectionId}
                            onClick={setSelectedCourseInfo}
                            onRemove={removeSelectedCourse}
                            showRemove={true}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Info for Selected */}
          <div className="lg:col-span-3">
            <CourseInfoCard 
              title="Info for Selected" 
              course={selectedCourseInfo} 
              isSelected={true}
            />
          </div>
        </div>

        {/* Routine Section */}
        <div key={routineKey} className="mt-8">
          <div className="rounded-lg shadow-sm border-2 border-gray-300 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Class Routine</h2>
              <div className="flex gap-2">
                {/* Social Sharing Buttons */}
                <button
                  onClick={shareOnWhatsApp}
                  className="bg-green-500 hover:bg-green-600  px-4 py-2 rounded transition-colors flex items-center gap-2"
                  title="Share on WhatsApp"
                >
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={shareOnMessenger}
                  className="bg-blue-600 hover:bg-blue-700  px-4 py-2 rounded transition-colors flex items-center gap-2"
                  title="Share on Messenger"
                >
                  <span>Messenger</span>
                </button>
                <button
                  onClick={shareViaEmail}
                  className="bg-gray-600 hover:bg-gray-700  px-4 py-2 rounded transition-colors flex items-center gap-2"
                  title="Share via Email"
                >
                  <span>Email</span>
                </button>
                <button
                  onClick={shareViaTelegram}
                  className="bg-blue-400 hover:bg-blue-500 px-4 py-2 rounded transition-colors flex items-center gap-2"
                  title="Share on Telegram"
                >
                  <span>Telegram</span>
                </button>
                <button
                  onClick={downloadRoutineAsPDF}
                  className="bg-green-600 hover:bg-green-700  px-4 py-2 rounded transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="">
                    <th className="border border-gray-300 p-2 text-left">Time/Day</th>
                    {days.map(day => (
                      <th key={day} className="border border-gray-300 p-2 text-center">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot}>
                      <td className="border border-gray-300 p-2 font-medium">{timeSlot}</td>
                      {days.map(day => {
                        const slots = getAllCoursesInTimeSlot(day, timeSlot);
                        const displayText = slots.length > 0 ? getRoutineDisplayText(slots[0]) : null;
                        const type = slots.length > 0 ? slots[0].type : null;
                        return (
                          <td key={day} className="border border-gray-300 p-2 text-center">
                            {displayText ? (
                              <div className={`text-xs ${type === 'lab' ? 'bg-yellow-100' : 'bg-blue-100'} p-1 rounded`}>
                                <div className="font-semibold">{displayText}</div>
                                <div className="text-gray-600">
                                  {type === 'lab' ? 'LAB' : 'CLASS'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Exam Schedule Section */}
        <div className="mt-8">
          <div className=" rounded-lg shadow-sm border-2 border-gray-300 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Exam Schedule</h2>
            
            {selectedCourses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="">
                      <th className="border border-gray-300 p-2 text-left">DAY</th>
                      <th className="border border-gray-300 p-2 text-left">TIME</th>
                      <th className="border border-gray-300 p-2 text-left">EXAM</th>
                      <th className="border border-gray-300 p-2 text-left">COURSE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getExamSchedule().map((exam, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-medium">{exam.day}</td>
                        <td className="border border-gray-300 p-2">{exam.time}</td>
                        <td className="border border-gray-300 p-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            exam.exam === 'MID' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {exam.exam}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-2 font-semibold">{exam.course}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No courses selected. Add courses to see exam schedule.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default PreRegistration;