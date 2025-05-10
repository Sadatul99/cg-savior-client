import { FaArrowRight, FaRegBookmark, FaBookmark, FaTrash, FaEdit } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useBookmark from '../../../hooks/useBookmark';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAdmin from '../../../hooks/useAdmin';
import useAxiosPublic from '../../../hooks/useAxiosPublic';

const CourseCard = ({ course, refetch }) => {
  const { _id, course_code, course_title, lab, pre_requisite } = course;
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic()
  // const [bookmark, refetch] = useBookmark();

  // const isBookmarked = bookmark.some(item => item.courseId === _id);

  const handleBookmark = async () => {
    // if (isBookmarked) {
    //   const target = bookmark.find(item => item.courseId === _id);
    //   if (target) {
    //     await axiosSecure.delete(`/bookmarks/${target._id}`);
    //   }
    // } else {
    //   const bookmarkedCourse = {
    //     courseId: _id,
    //     course_code,
    //     email: user.email,
    //   };
    //   await axiosSecure.post('/bookmarks', bookmarkedCourse);
    // }
    // refetch();
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
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition duration-300 ease-in-out flex flex-col justify-between relative">
      {/* Admin Controls */}
      {isAdmin && (
        <div className="absolute top-4 right-12 flex gap-3">
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
            title="Delete Course"
          >
            <FaTrash />
          </button>
          <button className="text-blue-600 hover:text-blue-800" title="Edit Course">
            <FaEdit />
          </button>
        </div>
      )}


      {/* Bookmark Button */}
      {/* <button
        disabled
        onClick={handleBookmark}
        className="absolute top-4 right-4 text-gray-500 hover:text-indigo-600 transition"
        title={isBookmarked ? "Remove Bookmark" : "Add to Bookmarks"}
      >
        {isBookmarked ? <FaBookmark className="text-xl" /> : <FaRegBookmark className="text-xl" />}
      </button> */}

      {/* Course Info */}
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{course_code}</h2>
      <p className="text-lg text-gray-700 mb-2">{course_title}</p>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Pre-requisite:</span>{" "}
        {pre_requisite && pre_requisite !== "N/A" ? pre_requisite : "None"}
      </p>
      <p className={`text-sm font-semibold mb-4 ${lab ? 'text-green-600' : 'text-red-500'}`}>
        {lab ? 'Lab Included' : 'No Lab'}
      </p>

      {/* View Button */}
      <Link
        to={`/dashboard/courses/${course._id}`}
        className="mt-auto inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-300"
      >
        View
        <FaArrowRight className="text-sm" />
      </Link>
    </div>
  );
};

export default CourseCard;
