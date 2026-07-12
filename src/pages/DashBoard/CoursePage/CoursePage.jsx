import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import Resources from '../Resources/Resources';
import ClassroomResources from '../ClassroomResources/ClassroomResources';
import AddResource from '../AddResource/AddResource';

const CoursePage = () => {
  const { course_code } = useParams();
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', course_code],
    queryFn: async () => {
      const res = await axiosPublic.get(`/courses/${course_code}`);
      return res.data;
    },
    enabled: !!course_code, 
  });

  if (isLoading) return <p className="text-center mt-10 text-gray-600">Loading course details...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error.message}</p>;

  const {
    course_title,
    credit,
    pre_requisite,
    soft_pre_requisite,
    lab,
  } = course;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2  rounded-md transition duration-200"
        >
          ← Go Back
        </button>

        <div className=" shadow-md rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-2">{course_code} - {course_title}</h1>
          <p className=" text-lg mb-4">{credit} Credit Hour{credit > 1 ? 's' : ''}</p>
          <p className={`mb-2 text-sm font-semibold ${lab ? 'text-green-600' : 'text-red-500'}`}>
            {lab ? 'Lab Included' : 'No Lab'}
          </p>

          <div className="space-y-1 mb-4">
            <p><span className="font-medium">Pre-requisite:</span> {pre_requisite === "N/A" ? "None" : pre_requisite}</p>
            <p><span className="font-medium">Soft Pre-requisite:</span> {soft_pre_requisite === "N/A" ? "None" : soft_pre_requisite}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddResourceOpen(true)}
            className="btn btn-primary"
          >
            Add resource
          </button>
        </div>
      </div>

      {/* Resources Section */}
      <Resources course_code={course_code} />
      {isAddResourceOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-resource-title"
        >
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-base-100 p-6 shadow-xl">
            <button
              type="button"
              className="btn btn-ghost btn-sm absolute right-3 top-3"
              aria-label="Close add resource form"
              onClick={() => setIsAddResourceOpen(false)}
            >
              ✕
            </button>
            <p className="mb-3 text-center text-sm text-gray-600">Adding a resource for <strong>{course_code}</strong></p>
            <AddResource courseCode={course_code} onSuccess={() => setIsAddResourceOpen(false)} />
          </div>
        </div>
      )}
      {/* <ClassroomResources course_code={course_code} /> */}
    </>
  );
};

export default CoursePage;
