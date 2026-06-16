import React, { useState, useEffect, useRef, useMemo } from 'react';

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

  const saveScrollPosition = () => {
    if (availableCoursesRef.current && !isScrollingRef.current) {
      scrollPositionRef.current = availableCoursesRef.current.scrollTop;
    }
  };

  const restoreScrollPosition = () => {
    setTimeout(() => {
      if (availableCoursesRef.current && scrollPositionRef.current !== undefined) {
        availableCoursesRef.current.scrollTop = scrollPositionRef.current;
      }
    }, 10);
  };

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

    if (courseCode.trim() === "") {
      setFilteredCourses([]);
      setAvailableCourse(null);
      return;
    }

    const filtered = courses
      .filter((course) =>
        course.courseCode
          .toLowerCase()
          .includes(courseCode.toLowerCase())
      )
      .sort((a, b) => {
        const sectionA = parseInt(
          String(a.sectionName).replace(/\D/g, ""),
          10
        );

        const sectionB = parseInt(
          String(b.sectionName).replace(/\D/g, ""),
          10
        );

        return sectionA - sectionB;
      });

    setFilteredCourses(filtered);

    if (filtered.length > 0) {
      setAvailableCourse(filtered[0]);
    } else {
      setAvailableCourse(null);
    }
  };

  const handleAvailableCourseClick = (course) => {
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

    const directMatch = `${start}-${end}`;
    if (timeSlotsOrder.includes(directMatch)) {
      return [directMatch];
    }

    const matchingSlots = [];

    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const targetStart = parseTime(start);
    const targetEnd = parseTime(end);

    for (let i = 0; i < timeSlotsOrder.length; i++) {
      const slot = timeSlotsOrder[i];
      const [slotStart, slotEnd] = slot.split('-');

      const slotStartMinutes = parseTime(slotStart);
      const slotEndMinutes = parseTime(slotEnd);

      if (slotStartMinutes < targetEnd && slotEndMinutes > targetStart) {
        matchingSlots.push(slot);
      }
    }

    return matchingSlots;
  };

  const moveToSelected = () => {
    if (availableCourse) {
      const sameCourseExists = selectedCourses.some(
        course => course.courseCode === availableCourse.courseCode
      );

      if (sameCourseExists) {
        alert(`You have already selected a section for ${availableCourse.courseCode}. Please remove the existing section first.`);
        return;
      }

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

      saveScrollPosition();

      if (!selectedCourses.find(course => course.sectionId === availableCourse.sectionId)) {
        const updatedSelected = [...selectedCourses, availableCourse];
        setSelectedCourses(updatedSelected);
        setSelectedCourseInfo(availableCourse);
        setRoutineKey(prev => prev + 1);
      }

      const updatedFiltered = filteredCourses.filter(
        course => course.sectionId !== availableCourse.sectionId
      );
      setFilteredCourses(updatedFiltered);

      if (updatedFiltered.length > 0) {
        setAvailableCourse(updatedFiltered[0]);
      } else {
        setAvailableCourse(null);
      }

      restoreScrollPosition();
    }
  };

  const moveToAvailable = () => {
    if (selectedCourseInfo) {
      saveScrollPosition();

      const updatedSelected = selectedCourses.filter(
        course => course.sectionId !== selectedCourseInfo.sectionId
      );
      setSelectedCourses(updatedSelected);
      setRoutineKey(prev => prev + 1);

      if (selectedCourseInfo.courseCode.toLowerCase().includes(searchTerm.toLowerCase())) {
        const updatedFiltered = [...filteredCourses, selectedCourseInfo];
        setFilteredCourses(updatedFiltered);
        setAvailableCourse(selectedCourseInfo);
      }

      if (updatedSelected.length > 0) {
        setSelectedCourseInfo(updatedSelected[0]);
      } else {
        setSelectedCourseInfo(null);
      }

      restoreScrollPosition();
    }
  };

  const removeSelectedCourse = (courseToRemove) => {
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
      setFilteredCourses(updatedFiltered);
    }

    restoreScrollPosition();
  };

  const getCourseInTimeSlot = (day, timeSlot) => {
    const allSlots = [];

    selectedCourses.forEach(course => {
      const courseSlots = extractTimeSlots(course);
      courseSlots.forEach(slot => {
        if (slot.day === day.toUpperCase() && slot.timeSlot === timeSlot) {
          allSlots.push(slot);
        }
      });
    });

    return allSlots.length > 0 ? allSlots[0] : null;
  };

  const getAllCoursesInTimeSlot = (day, timeSlot) => {
    const allSlots = [];

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

  const CourseButton = ({
    course,
    isSelected = false,
    onClick,
    onRemove,

  }) => {
    const isClosed = course.capacity === 0;

    return (
      <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2">
        <button
          onClick={() => onClick(course)}
          className={`
          flex-1
          text-left
          rounded-md
          border
          transition-colors
          duration-200

          px-2 py-1.5
          sm:px-3 sm:py-2
          lg:px-4 lg:py-3

          text-[11px]
          sm:text-xs
          lg:text-base

          truncate

          ${isSelected
              ? "bg-blue-500 text-white border-blue-600"
              : isClosed
                ? "bg-yellow-100 border-yellow-300 text-black hover:bg-yellow-200"
                : "border-gray-300 hover:bg-gray-100 hover:text-black"
            }
        `}
        >
          <span className="truncate block">
            {course.courseCode}. sec-{course.sectionName}
            {isClosed && " (Closed)"}
          </span>
        </button>


      </div>
    );
  };

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

  const getExamSchedule = () => {
    const exams = [];

    selectedCourses.forEach(course => {
      const courseCode = course.courseCode;
      const sectionSchedule = course.sectionSchedule;

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
          rawDate: sectionSchedule.midExamDate
        });
      }

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
          rawDate: sectionSchedule.finalExamDate
        });
      }
    });

    return exams.sort((a, b) => {
      const dateA = new Date(a.rawDate);
      const dateB = new Date(b.rawDate);
      return dateA - dateB;
    }).map(exam => {
      const { rawDate, ...examWithoutRawDate } = exam;
      return examWithoutRawDate;
    });
  };

  const CourseInfoCard = ({ title, course, isSelected = false }) => {
    const remainingSeats = course
      ? course.capacity - course.consumedSeat
      : "";

    const classTimes = course
      ? formatTimeForDisplay(course.preRegSchedule)
      : [];

    const labTimes = course
      ? formatTimeForDisplay(course.preRegLabSchedule)
      : [];

    return (
      <div
        className={`border-2 rounded-lg p-4 ${isSelected ? "border-blue-500" : "border-gray-300"
          }`}
      >
        <h3 className="text-center font-bold text-2xl mb-8">
          {title}
        </h3>

        <div className="space-y-2 text-xs lg:text-sm">
          <div>
            <span className="font-semibold">Course Code : </span>
            {course && <span>{course.courseCode}</span>}
          </div>

          <div>
            <span className="font-semibold">Course Title : </span>
            {course && <span>{course.courseTitle}</span>}
          </div>

          <div>
            <span className="font-semibold">Faculty : </span>
            {course && <span>{course.faculties || "TBA"}</span>}
          </div>

          <div>
            <span className="font-semibold">Section : </span>
            {course && (
              <span>
                {course.sectionName.replace("(Closed)", "").trim()}
              </span>
            )}
          </div>

          <div>
            <span className="font-semibold">Time : </span>

            {course &&
              classTimes.map((time, i) => (
                <div key={i}>{time}</div>
              ))}

            {course && (
              <div className="mt-2">
                <span className="font-semibold">Lab : </span>

                {labTimes.length > 0 ? (
                  <>
                    {labTimes.map((time, i) => (
                      <div key={i}>{time}</div>
                    ))}
                  </>
                ) : (
                  <span>N/A</span>
                )}
              </div>
            )}
          </div>

          <div>
            <span className="font-semibold">Exam Day : </span>
            {course && (
              <span>
                {course.sectionSchedule?.finalExamDetail}
              </span>
            )}
          </div>

          <div>
            <span className="font-semibold">Total Seat : </span>
            {course && <span>{course.capacity}</span>}
          </div>

          <div>
            <span className="font-semibold">Seat Booked : </span>
            {course && <span>{course.consumedSeat}</span>}
          </div>

          <div>
            <span className="font-semibold">Remaining : </span>
            {course && <span>{remainingSeats}</span>}
          </div>
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px; }
          .routine-table, .exam-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          .routine-table th, .routine-table td, .exam-table th, .exam-table td { border: 1px solid #000; padding: 6px; text-align: center; }
          .routine-table th, .exam-table th { background-color: #f0f0f0; }
          .class-cell { background-color: #dbeafe; }
          .lab-cell { background-color: #fef3c7; }
          .course-info { font-size: 10px; }
          .mid-exam { background-color: #dbeafe; }
          .final-exam { background-color: #dcfce7; }
          @media print {
            body { margin: 0; font-size: 10px; }
            .routine-table, .exam-table { font-size: 8px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Class Routine & Exam Schedule</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Class Routine</div>
          <div style="overflow-x: auto;">
            <table class="routine-table">
              <thead>
                <tr><th>Time/Day</th>${days.map(day => `<th>${day.substring(0, 3)}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${timeSlots.map(timeSlot => `
                  <tr>
                    <td><strong>${timeSlot}</strong></td>
                    ${days.map(day => {
      const slots = getAllCoursesInTimeSlot(day, timeSlot);
      const displayText = slots.length > 0 ? getRoutineDisplayText(slots[0]) : null;
      const type = slots.length > 0 ? slots[0].type : null;
      return `<td class="${slots.length > 0 ? (type === 'lab' ? 'lab-cell' : 'class-cell') : ''}">${displayText ? `<div class="course-info"><strong>${displayText}</strong><br/>${type === 'lab' ? 'LAB' : 'CLASS'}</div>` : '-'}</td>`;
    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
        ${examSchedule.length > 0 ? `
        <div class="section">
          <div class="section-title">Exam Schedule</div>
          <table class="exam-table">
            <thead><tr><th>DAY</th><th>TIME</th><th>EXAM</th><th>COURSE</th></tr></thead>
            <tbody>
              ${examSchedule.map(exam => `<tr class="${exam.exam === 'MID' ? 'mid-exam' : 'final-exam'}"><td>${exam.day}</td><td>${exam.time}</td><td><strong>${exam.exam}</strong></td><td><strong>${exam.course}</strong></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        <div style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(routineContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading courses: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <>
          {/* =======================================================
                      MOBILE + TABLET
  ======================================================= */}

          <div className="lg:hidden space-y-5 text-sm">

            {/* Search */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Search Course Code"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
              />

              <input
                type="text"
                placeholder="Search Course Code"
                className="w-full rounded-md border border-gray-400 px-3 py-2 text-sm"
              />
            </div>

            {/* Titles */}
            <div className="grid grid-cols-[1fr_48px_1fr] gap-2 text-center font-bold">
              <div>Available Courses</div>
              <div />
              <div>Selected Courses</div>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-[1fr_48px_1fr] gap-2">

              {/* Available */}
              <div
                ref={availableCoursesRef}
                onScroll={handleScroll}
                className="border-2 border-cyan-500 h-64 overflow-y-auto"
              >
                <div className="p-1">
                  {filteredCourses.length === 0 ? (
                    <p className="text-center py-5">
                      {searchTerm
                        ? "No courses found"
                        : "Search for a course"}
                    </p>
                  ) : (
                    courseList
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col justify-center items-center gap-3">

                <button
                  onClick={moveToSelected}
                  disabled={!availableCourse}
                  className="w-10 h-10 bg-green-400 hover:bg-green-500 disabled:bg-gray-300 font-bold"
                >
                  &gt;
                </button>

                <button
                  onClick={moveToAvailable}
                  disabled={!selectedCourseInfo}
                  className="w-10 h-10 bg-green-400 hover:bg-green-500 disabled:bg-gray-300 font-bold"
                >
                  &lt;
                </button>

                {/* Uncomment if you have move all */}
                {/* <button className="w-10 h-10 bg-green-400 font-bold">&lt;&lt;</button> */}

              </div>

              {/* Selected */}
              <div className="border-2 border-cyan-500 h-64 overflow-y-auto">
                <div className="p-1">

                  {selectedCourses.length === 0 ? (
                    <p className="text-center py-5">
                      No courses selected
                    </p>
                  ) : (
                    selectedCourses.map((course) => (
                      <CourseButton
                        key={course.sectionId}
                        course={course}
                        isSelected={
                          selectedCourseInfo?.sectionId ===
                          course.sectionId
                        }
                        onClick={setSelectedCourseInfo}
                        onRemove={removeSelectedCourse}

                      />
                    ))
                  )}

                </div>
              </div>

            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4">

              <CourseInfoCard
                title="Info for Available"
                course={availableCourse}
              />

              <CourseInfoCard
                title="Info for Selected"
                course={selectedCourseInfo}
                isSelected
              />

            </div>

          </div>

          {/* DESKTOP */}

          <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-start">


            {/* Section 1: Info for Available */}
            <div className="lg:col-span-3">
              <CourseInfoCard
                title="Info for Available"
                course={availableCourse}
              />
            </div>

            {/* Section 2: Available Courses + Buttons + Selected Courses */}
            <div className="lg:col-span-6">
              <div className="flex gap-5 items-start">

                {/* ================= Available Courses ================= */}
                <div className="flex-1 min-w-0">
                  <div className="rounded-lg border-2 border-gray-300 h-[470px] flex flex-col overflow-hidden">

                    {/* Fixed Header */}
                    <div className="h-[110px] border-b border-gray-300 flex flex-col justify-between p-4">
                      <h2 className="font-bold text-2xl text-center">
                        Available Courses
                      </h2>

                      <input
                        type="text"
                        placeholder="Search Course Code, eg - CSE110"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* List */}
                    <div
                      ref={availableCoursesRef}
                      onScroll={handleScroll}
                      className="flex-1 overflow-y-auto p-3"
                    >
                      {filteredCourses.length === 0 ? (
                        <p className="text-center py-10">
                          {searchTerm
                            ? "No courses found"
                            : "Search for a course"}
                        </p>
                      ) : (
                        courseList
                      )}
                    </div>
                  </div>
                </div>

                {/* ================= Buttons ================= */}
                <div className="w-[60px] h-[470px] flex flex-col justify-center items-center gap-4">

                  <button
                    onClick={moveToSelected}
                    disabled={!availableCourse}
                    className="w-12 h-12 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-xl font-bold transition-colors"
                  >
                    &gt;
                  </button>

                  <button
                    onClick={moveToAvailable}
                    disabled={!selectedCourseInfo}
                    className="w-12 h-12 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-xl font-bold transition-colors"
                  >
                    &lt;
                  </button>

                  {/* Uncomment if you have Move All */}
                  {/*
      <button className="w-12 h-12 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold">
        &lt;&lt;
      </button>
      */}

                </div>

                {/* ================= Selected Courses ================= */}
                <div className="flex-1 min-w-0">
                  <div className="rounded-lg border-2 border-gray-300 h-[470px] flex flex-col overflow-hidden">

                    {/* Fixed Header - SAME HEIGHT */}
                    <div className="h-[110px] border-b border-gray-300 flex flex-col justify-between p-4">

                      <div>
                        <h2 className="font-bold text-2xl text-center">
                          Selected Courses
                        </h2>

                        <p className="text-sm text-gray-500 text-center mt-2">
                          {selectedCourses.length} course(s) selected
                        </p>
                      </div>

                      {/* Invisible spacer so header height matches Available */}
                      <div className="h-[42px]" />
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-3">

                      {selectedCourses.length === 0 ? (
                        <p className="text-center py-10">
                          No courses selected
                        </p>
                      ) : (
                        selectedCourses.map((course) => (
                          <CourseButton
                            key={course.sectionId}
                            course={course}
                            isSelected={
                              selectedCourseInfo?.sectionId ===
                              course.sectionId
                            }
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

            {/* Section 3: Info for Selected */}
            <div className="lg:col-span-3">
              <CourseInfoCard
                title="Info for Selected"
                course={selectedCourseInfo}
                isSelected={true}
              />
            </div>

          </div>
        </>

        {/* Routine Section */}
        <div key={routineKey} className="mt-8">
          <div className="rounded-lg shadow-sm border-2 border-gray-300 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-xl font-bold">Class Routine</h2>
              <button
                onClick={downloadRoutineAsPDF}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors text-sm md:text-base"
              >
                Download PDF
              </button>
            </div>

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 text-left text-xs md:text-sm">Time/Day</th>
                      {days.map(day => (
                        <th key={day} className="border border-gray-300 p-2 text-center text-xs md:text-sm">
                          <span className="hidden md:inline">{day}</span>
                          <span className="md:hidden">{day.substring(0, 3)}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((timeSlot) => (
                      <tr key={timeSlot}>
                        <td className="border border-gray-300 p-2 font-medium text-xs md:text-sm">{timeSlot}</td>
                        {days.map(day => {
                          const slots = getAllCoursesInTimeSlot(day, timeSlot);
                          const displayText = slots.length > 0 ? getRoutineDisplayText(slots[0]) : null;
                          const type = slots.length > 0 ? slots[0].type : null;
                          return (
                            <td key={day} className="border border-gray-300 p-1 md:p-2 text-center">
                              {displayText ? (
                                <div className={`text-xs p-1 rounded ${type === 'lab' ? 'bg-yellow-100 text-black' : 'bg-blue-100 text-black'}`}>
                                  <div className="font-semibold text-xs md:text-sm">{displayText}</div>
                                  <div className="opacity-60 text-xs">
                                    {type === 'lab' ? 'LAB' : 'CLASS'}
                                  </div>
                                </div>
                              ) : (
                                <span className="opacity-40 text-xs">-</span>
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
        </div>

        {/* Exam Schedule Section */}
        <div className="mt-8 mb-8">
          <div className="rounded-lg shadow-sm border-2 border-gray-300 p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4">Exam Schedule</h2>

            {selectedCourses.length > 0 ? (
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 text-left text-xs md:text-sm">DAY</th>
                        <th className="border border-gray-300 p-2 text-left text-xs md:text-sm">TIME</th>
                        <th className="border border-gray-300 p-2 text-left text-xs md:text-sm">EXAM</th>
                        <th className="border border-gray-300 p-2 text-left text-xs md:text-sm">COURSE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getExamSchedule().map((exam, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-medium text-xs md:text-sm">{exam.day}</td>
                          <td className="border border-gray-300 p-2 text-xs md:text-sm">{exam.time}</td>
                          <td className="border border-gray-300 p-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${exam.exam === 'MID'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                              }`}>
                              {exam.exam}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2 font-semibold text-xs md:text-sm">{exam.course}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 opacity-60 text-sm md:text-base">
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