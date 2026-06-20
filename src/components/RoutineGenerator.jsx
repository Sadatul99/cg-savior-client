import React, { useState } from 'react';
import { getAllTimeSlots, getDays, getAllCoursesInTimeSlot, getRoutineDisplayText } from '../utils/scheduleUtils';

const RoutineGenerator = ({ routine, selectedCourses, numberOfDays, courseFacultyPreferences }) => {
  const [showExamSchedule, setShowExamSchedule] = useState(true);
  const timeSlots = getAllTimeSlots();
  const days = getDays();

  // Filter days based on the routine's selected days
  const activeDays = routine?.selectedDays || days;
  const filteredDays = days.filter(day => activeDays.includes(day.toUpperCase()));

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

        exams.push({
          day: `${dayName} (${formattedDate})`,
          time: `${formatTime(sectionSchedule.midExamStartTime)} - ${formatTime(sectionSchedule.midExamEndTime)}`,
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

        exams.push({
          day: `${dayName} (${formattedDate})`,
          time: `${formatTime(sectionSchedule.finalExamStartTime)} - ${formatTime(sectionSchedule.finalExamEndTime)}`,
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

  const downloadRoutineAsHTML = () => {
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
          .no-class { color: #999; }
          .summary { margin: 10px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
          .day-distribution { display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0; }
          .day-card { flex: 1; min-width: 100px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
          .day-card h4 { margin: 0 0 5px 0; color: #333; }
          .day-card ul { margin: 0; padding-left: 20px; }
          .section-info { font-size: 11px; color: #666; }
          .faculty-preference { font-size: 11px; color: #4a5568; background: #ebf8ff; padding: 2px 8px; border-radius: 3px; }
          @media print {
            body { margin: 0; font-size: 10px; }
            .routine-table, .exam-table { font-size: 8px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎓 AI Generated Class Routine & Exam Schedule</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p><strong>Number of Days:</strong> ${numberOfDays || 4} days per week</p>
          <div class="summary">
            <strong>Total Courses: ${selectedCourses.length}</strong>
            <br/>
            <strong>Total Credits: ${selectedCourses.reduce((sum, c) => sum + (c.courseCredit || 0), 0)}</strong>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Selected Sections & Faculty Preferences</div>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0;">
            ${selectedCourses.map(c => {
              const preferredFaculty = courseFacultyPreferences ? courseFacultyPreferences[c.courseCode] || '' : '';
              return `
                <div style="padding: 8px 12px; background: #e8f4fd; border-radius: 5px; border: 1px solid #b8d4e8;">
                  <strong>${c.courseCode}</strong> - Section ${c.sectionName}
                  <span class="section-info">(${c.faculties || 'TBA'})</span>
                  ${preferredFaculty ? `<span class="faculty-preference">⭐ Preferred: ${preferredFaculty}</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Day Distribution</div>
          <div class="day-distribution">
            ${(routine?.dayDistribution || []).map(dist => `
              <div class="day-card">
                <h4>${dist.day}</h4>
                <ul>${dist.courses.map(c => `<li>${c}</li>`).join('')}</ul>
              </div>
            `).join('')}
          </div>
        </div>
       
        <div class="section">
          <div class="section-title">Class Routine</div>
          <div style="overflow-x: auto;">
            <table class="routine-table">
              <thead>
                <tr><th>Time/Day</th>${filteredDays.map(day => `<th>${day.substring(0, 3)}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${timeSlots.map(timeSlot => `
                  <tr>
                    <td><strong>${timeSlot}</strong></td>
                    ${filteredDays.map(day => {
                      const slots = getAllCoursesInTimeSlot(selectedCourses, day, timeSlot);
                      const displayText = slots.length > 0 ? getRoutineDisplayText(slots[0]) : null;
                      const type = slots.length > 0 ? slots[0].type : null;
                      return `<td class="${slots.length > 0 ? (type === 'lab' ? 'lab-cell' : 'class-cell') : 'no-class'}">${displayText ? `<div class="course-info"><strong>${displayText}</strong><br/>${type === 'lab' ? 'LAB' : 'CLASS'}</div>` : '-'}</td>`;
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
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ Print</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(routineContent);
    printWindow.document.close();
  };

  return (
    <div className="border rounded-lg p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold">📋 Generated Routine</h2>
          <p className="text-sm text-gray-600">
            {selectedCourses.length} courses • {selectedCourses.reduce((sum, c) => sum + (c.courseCredit || 0), 0)} credits
            {numberOfDays && ` • ${numberOfDays} days/week`}
          </p>
        </div>
        <button
          onClick={downloadRoutineAsHTML}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors text-sm md:text-base"
        >
          📥 Download PDF
        </button>
      </div>

      {/* Selected Sections Summary with Faculty Preferences */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold mb-2">AI Selected Sections & Faculty Preferences</h3>
        <div className="flex flex-wrap gap-2">
          {selectedCourses.map(c => {
            const preferredFaculty = courseFacultyPreferences ? courseFacultyPreferences[c.courseCode] || '' : '';
            return (
              <div key={c.sectionId} className="px-3 py-1 bg-white rounded border border-blue-300 text-sm">
                <strong>{c.courseCode}</strong> - Sec {c.sectionName}
                <span className="text-xs text-gray-500 ml-1">({c.faculties || 'TBA'})</span>
                {preferredFaculty && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded ml-1">
                    ⭐ {preferredFaculty}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Distribution Summary */}
      {routine?.dayDistribution && routine.dayDistribution.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Day Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {routine.dayDistribution.map(dist => (
              <div key={dist.day} className="bg-white p-2 rounded border">
                <div className="font-medium text-sm">{dist.day}</div>
                <div className="text-xs text-gray-600">
                  {dist.courses.length} course{dist.courses.length !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {dist.courses.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-left text-xs md:text-sm">Time/Day</th>
                {filteredDays.map(day => (
                  <th key={day} className="border border-gray-300 p-2 text-center text-xs md:text-sm">
                    <span className="hidden md:inline">{day}</span>
                    <span className="md:hidden">{day.substring(0, 3)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot) => {
                const hasAnyClass = filteredDays.some(day => 
                  getAllCoursesInTimeSlot(selectedCourses, day, timeSlot).length > 0
                );
                
                return (
                  <tr key={timeSlot} className={!hasAnyClass ? 'opacity-50' : ''}>
                    <td className="border border-gray-300 p-2 font-medium text-xs md:text-sm">{timeSlot}</td>
                    {filteredDays.map(day => {
                      const slots = getAllCoursesInTimeSlot(selectedCourses, day, timeSlot);
                      const displayText = slots.length > 0 ? getRoutineDisplayText(slots[0]) : null;
                      const type = slots.length > 0 ? slots[0].type : null;
                      return (
                        <td key={day} className="border border-gray-300 p-1 md:p-2 text-center">
                          {displayText ? (
                            <div className={`text-xs p-1 rounded ${type === 'lab' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                              <div className="font-semibold text-xs md:text-sm">{displayText}</div>
                              <div className="opacity-60 text-xs">
                                {type === 'lab' ? '🧪 LAB' : '📚 CLASS'}
                              </div>
                            </div>
                          ) : (
                            <span className="opacity-40 text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exam Schedule */}
      <div className="mt-6">
        <button
          onClick={() => setShowExamSchedule(!showExamSchedule)}
          className="text-lg font-semibold mb-3 hover:text-blue-600 flex items-center gap-2"
        >
          {showExamSchedule ? '▼' : '▶'} Exam Schedule
        </button>
        
        {showExamSchedule && (
          selectedCourses.length > 0 ? (
            <div className="overflow-x-auto">
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
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          exam.exam === 'MID'
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
          ) : (
            <p className="text-gray-500 text-sm">No exams scheduled</p>
          )
        )}
      </div>
    </div>
  );
};

export default RoutineGenerator;