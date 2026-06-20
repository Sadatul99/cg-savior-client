import { extractTimeSlots } from './courseUtils';

export const getAllTimeSlots = () => [
  '08:00 AM-09:20 AM',
  '09:30 AM-10:50 AM',
  '11:00 AM-12:20 PM',
  '12:30 PM-01:50 PM',
  '02:00 PM-03:20 PM',
  '03:30 PM-04:50 PM',
  '05:00 PM-06:20 PM'
];

export const getDays = () => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const formatScheduleForDisplay = (course) => {
  const slots = extractTimeSlots(course);
  const classSlots = slots.filter(s => s.type === 'class');
  const labSlots = slots.filter(s => s.type === 'lab');
  
  return {
    classSlots,
    labSlots,
    hasClass: classSlots.length > 0,
    hasLab: labSlots.length > 0
  };
};

export const getRoutineDisplayText = (slot) => {
  if (!slot) return null;
  const courseCode = slot.course.courseCode;
  const section = slot.course.sectionName.replace('(Closed)', '').trim();
  const faculty = slot.course.faculties || 'TBA';
  const room = slot.room || 'TBA';
  return `${courseCode}-${section}-${faculty}-${room}`;
};

export const getAllCoursesInTimeSlot = (selectedCourses, day, timeSlot) => {
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