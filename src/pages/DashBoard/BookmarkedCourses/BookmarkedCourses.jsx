import useBookmark from "../../../hooks/useBookmark";
import useCourses from "../../../hooks/useCourses";
import CourseCard from "../CourseCard/CourseCard";


const BookmarkedCourses = () => {
    const [bookmark] = useBookmark();
    const [courses] = useCourses();

    // find courses that are bookmarked
    const bookmarkedIds = new Set(bookmark.map(b => b.courseId));
    const bookmarkedCourses = courses.filter(course => bookmarkedIds.has(course._id));


    return (
        <div className="my-10">
            <h2 className="text-4xl text-center mb-8">
                Bookmarked Courses: {bookmarkedCourses.length}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedCourses.map(course => (
                    <CourseCard key={course._id} course={course} />
                ))}
            </div>
        </div>
    );
};

export default BookmarkedCourses;
