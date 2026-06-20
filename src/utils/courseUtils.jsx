export const extractTimeSlots = (course) => {
  const slots = [];
  const timeSlotsOrder = [
    '08:00 AM-09:20 AM',
    '09:30 AM-10:50 AM',
    '11:00 AM-12:20 PM',
    '12:30 PM-01:50 PM',
    '02:00 PM-03:20 PM',
    '03:30 PM-04:50 PM',
    '05:00 PM-06:20 PM'
  ];

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const time = new Date(`2000-01-01 ${timeStr}`);
    return time.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  const convertFromTimeRange = (startTime, endTime) => {
    const start = startTime.toUpperCase();
    const end = endTime.toUpperCase();

    const directMatch = `${start}-${end}`;
    if (timeSlotsOrder.includes(directMatch)) {
      return [directMatch];
    }

    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const targetStart = parseTime(start);
    const targetEnd = parseTime(end);
    const matchingSlots = [];

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

  // Extract from class schedules
  if (course.sectionSchedule?.classSchedules && course.sectionSchedule.classSchedules.length > 0) {
    course.sectionSchedule.classSchedules.forEach(schedule => {
      const start = formatTime(schedule.startTime);
      const end = formatTime(schedule.endTime);
      const timeSlots = convertFromTimeRange(start, end);
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

  // Extract from lab schedules
  if (course.labSchedules && course.labSchedules.length > 0) {
    course.labSchedules.forEach(schedule => {
      const start = formatTime(schedule.startTime);
      const end = formatTime(schedule.endTime);
      const timeSlots = convertFromTimeRange(start, end);
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

  // Extract from preRegSchedule
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

  // Extract from preRegLabSchedule
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

export const getCourseSections = (courses, courseCode) => {
  return courses
    .filter(course => 
      course.courseCode.toLowerCase() === courseCode.toLowerCase()
    )
    .filter(course => course.capacity > 0 || course.capacity === undefined)
    .sort((a, b) => {
      const sectionA = parseInt(String(a.sectionName).replace(/\D/g, ""), 10);
      const sectionB = parseInt(String(b.sectionName).replace(/\D/g, ""), 10);
      return sectionA - sectionB;
    });
};

export const getUniqueFaculties = (courseSections) => {
  const facultiesSet = new Set();
  courseSections.forEach(course => {
    if (course.faculties) {
      const facultyList = course.faculties.split(',').map(f => f.trim());
      facultyList.forEach(f => facultiesSet.add(f));
    }
  });
  return Array.from(facultiesSet);
};

export const searchCourses = (courses, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }

  const term = searchTerm.trim().toLowerCase();
  const uniqueCourses = new Map();
  
  courses.forEach(course => {
    const code = course.courseCode.toLowerCase();
    const name = course.courseName?.toLowerCase() || '';
    
    if (code.includes(term) || name.includes(term)) {
      if (course.capacity > 0 || course.capacity === undefined) {
        if (!uniqueCourses.has(course.courseCode)) {
          uniqueCourses.set(course.courseCode, {
            courseCode: course.courseCode,
            courseName: course.courseName,
            courseCredit: course.courseCredit,
            sections: []
          });
        }
        uniqueCourses.get(course.courseCode).sections.push(course);
      }
    }
  });

  return Array.from(uniqueCourses.values())
    .sort((a, b) => a.courseCode.localeCompare(b.courseCode));
};

export const getAvailableCourseCodes = (courses) => {
  const codes = new Set();
  courses.forEach(course => {
    if (course.capacity > 0 || course.capacity === undefined) {
      codes.add(course.courseCode);
    }
  });
  return Array.from(codes).sort();
};