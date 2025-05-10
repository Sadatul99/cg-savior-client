import React, { useState, useMemo } from 'react';
import useCourses from '../../../hooks/useCourses';
import CourseCard from '../CourseCard/CourseCard';
import SectionTitle from '../../../components/SectionTitle/SectionTitle';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Courses = () => {
  const [courses, refetch] = useCourses();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const filteredCourses = useMemo(() => {
    if (!debouncedQuery) return courses;
    return courses.filter(course =>
      course.course_code.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      course.course_name?.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [debouncedQuery, courses]);

  return (
    <div>
      <SectionTitle
        heading="Our Featured Courses"
        subHeading="Learn and Grow with us"
      />

      <div className="px-4 pt-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search by course code or name..."
          className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="pt-10 px-4 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <CourseCard key={course.course_code} course={course} refetch={refetch} />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">No courses found</p>
        )}
      </div>
    </div>
  );
};

export default Courses;
