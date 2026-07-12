import { useEffect, useMemo, useState } from 'react';
import { HiDotsVertical } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useCourses from '../../../hooks/useCourses';
import useAdmin from '../../../hooks/useAdmin';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import SectionTitle from '../../../components/SectionTitle/SectionTitle';

const COURSES_PER_PAGE = 20;

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const Courses = () => {
  const [courses, refetch] = useCourses();
  const [isAdmin] = useAdmin();
  const axiosPublic = useAxiosPublic();
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedQuery = useDebounce(query, 300);

  const filteredCourses = useMemo(() => {
    if (!debouncedQuery) return courses;

    const normalizedQuery = debouncedQuery.toLowerCase();
    return courses.filter((course) =>
      course.course_code.toLowerCase().includes(normalizedQuery) ||
      course.course_name?.toLowerCase().includes(normalizedQuery)
    );
  }, [debouncedQuery, courses]);

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    return filteredCourses.slice(startIndex, startIndex + COURSES_PER_PAGE);
  }, [currentPage, filteredCourses]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = async (courseCode) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete course: ${courseCode}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    try {
      await axiosPublic.delete(`/courses/${courseCode}`);
      await refetch();
      Swal.fire('Deleted!', 'Course has been deleted.', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error!', 'Failed to delete course.', 'error');
    }
  };

  return (
    <div>
      <SectionTitle heading="Our Featured Courses" subHeading="Learn and Grow with us" />

      <div className="px-4 pt-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search by course code or name..."
          className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8">
        {paginatedCourses.length > 0 ? (
          <div className="space-y-3">
            {paginatedCourses.map((course) => (
              <div
                key={course._id || course.course_code}
                className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-4 py-3 shadow-sm"
              >
                <Link
                  to={`/dashboard/courses/${course.course_code}`}
                  className="min-w-0 flex-1 text-lg font-semibold hover:underline"
                >
                  <span>{course.course_code}</span>
                  {course.course_title && <span> - {course.course_title}</span>}
                </Link>

                <Link
                  to={`/dashboard/courses/${course.course_code}`}
                  className="btn btn-ghost btn-sm hidden sm:inline-flex"
                >
                  Open -&gt;
                </Link>

                <div className="dropdown dropdown-end">
                  <button
                    type="button"
                    tabIndex={0}
                    aria-label={`Course actions for ${course.course_code}`}
                    className="btn btn-ghost btn-square btn-sm"
                  >
                    <HiDotsVertical className="text-xl" />
                  </button>
                  <ul tabIndex={0} className="dropdown-content menu z-10 mt-1 w-32 rounded-box bg-base-100 p-2 shadow">
                    {isAdmin ? (
                      <>
                        <li>
                          <Link to={`/dashboard/courses/updateCourse/${course.course_code}`}>Edit</Link>
                        </li>
                        <li>
                          <button type="button" onClick={() => handleDelete(course.course_code)}>Delete</button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li><button type="button" disabled>Edit</button></li>
                        <li><button type="button" disabled>Delete</button></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-gray-500">No courses found</p>
        )}

        {totalPages > 1 && (
          <div className="join mt-8 flex justify-center">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <input
                key={page}
                className="join-item btn btn-square"
                type="radio"
                name="course-pages"
                aria-label={page}
                checked={currentPage === page}
                onChange={() => setCurrentPage(page)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
