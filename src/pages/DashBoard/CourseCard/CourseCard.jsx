import { FaArrowRight, FaRegBookmark, FaBookmark, FaTrash, FaEdit } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useBookmark from '../../../hooks/useBookmark';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAdmin from '../../../hooks/useAdmin';
import useAxiosPublic from '../../../hooks/useAxiosPublic';

const CourseCard = ({ course, refetch }) => {
  const { id, course_code, course_title, lab, pre_requisite } = course;
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic()
  const [bookmark] = useBookmark();

  const isBookmarked = bookmark.some(item => item.courseId === _id);

  const handleBookmark = async () => {
    if (isBookmarked) {
      const target = bookmark.find(item => item.courseId === _id);
      if (target) {
        await axiosSecure.delete(`/bookmarks/${target._id}`);
      }
    } else {
      const bookmarkedCourse = {
        courseId: _id,
        course_code,
        email: user.email,
      };
      await axiosSecure.post('/bookmarks', bookmarkedCourse);
    }
    refetch();
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete course: ${course_code}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await axiosPublic.delete(`/courses/${course_code}`);
        refetch();
        Swal.fire('Deleted!', 'Course has been deleted.', 'success');
        // Optionally: trigger a refetch of courses in parent component
      } catch (err) {
        console.error(err);
        Swal.fire('Error!', 'Failed to delete course.', 'error');
      }
    }
  };

  const isAdmin = useAdmin();

  return (
    <div
  className="
    rounded-2xl shadow-lg hover:shadow-2xl
    transition duration-300 p-6 flex flex-col justify-between relative
    border bg-white border-gray-200
    dark:bg-[#1a1a1a]/70 dark:border-gray-700 dark:backdrop-blur-xl
  "
>
  {/* Admin Controls */}
  {isAdmin && (
    <div className="absolute top-4 right-12 flex gap-3">
      <button
        onClick={handleDelete}
        className="text-red-600 dark:text-red-400 hover:opacity-80"
      >
        <FaTrash />
      </button>

      <Link to={`/dashboard/courses/updateCourse/${course_code}`}>
        <button className="text-blue-600 dark:text-blue-400 hover:opacity-80">
          <FaEdit />
        </button>
      </Link>
    </div>
  )}

  {/* Bookmark */}
  <button
    onClick={handleBookmark}
    className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300"
  >
    {isBookmarked ? (
      <FaBookmark className="text-xl text-blue-500 dark:text-blue-300" />
    ) : (
      <FaRegBookmark className="text-xl" />
    )}
  </button>

  {/* Course Info */}
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
    {course_code}
  </h2>

  <p className="text-lg text-gray-700 dark:text-gray-300">
    {course_title}
  </p>

  <p className="text-sm text-gray-600 dark:text-gray-400">
    <span className="font-medium">Pre-requisite:</span>{" "}
    {pre_requisite && pre_requisite !== "N/A" ? pre_requisite : "None"}
  </p>

  <p
    className={`text-sm font-semibold mb-4 
      ${lab ? "text-green-600 dark:text-green-300" : "text-red-500 dark:text-red-300"}
    `}
  >
    {lab ? "Lab Included" : "No Lab"}
  </p>

  <Link
    to={`/dashboard/courses/${course_code}`}
    className="
      mt-auto inline-flex items-center gap-2 
      px-5 py-2 rounded-full 
      bg-blue-600 hover:bg-blue-700 
      dark:bg-blue-500 dark:hover:bg-blue-600
      text-white font-semibold shadow-lg 
      transition duration-300
    "
  >
    View <FaArrowRight className="text-sm" />
  </Link>
</div>

  );
};

export default CourseCard;
