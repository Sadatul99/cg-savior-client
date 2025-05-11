import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import Swal from 'sweetalert2';

const ClassPage = () => {
  const { code: class_code } = useParams();
  const axiosPublic = useAxiosPublic();
  const [classData, setClassData] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await axiosPublic.get(`/classroom/${class_code}`);
        setClassData(res.data);
      } catch (err) {
        console.error('Error fetching class:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [class_code, axiosPublic]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axiosPublic.get('/classresources');
        const filtered = res.data.filter(resource => resource.class_code === class_code);
        setResources(filtered);
      } catch (err) {
        console.error('Error fetching resources:', err);
      }
    };

    fetchResources();
  }, [class_code, axiosPublic]);

  const handleDeleteResource = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This resource will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axiosPublic.delete(`/classresources/${id}`);
        setResources(prev => prev.filter(resource => resource._id !== id));
        Swal.fire('Deleted!', 'Resource has been deleted.', 'success');
      } catch (err) {
        console.error('Failed to delete resource:', err);
        Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
      }
    }
  };

  const deleteClassWithResources = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This class and all its resources will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete everything!'
    });

    if (result.isConfirmed) {
      try {
        await axiosPublic.delete(`/classroom/delete-with-resources/${class_code}`);
        Swal.fire('Deleted!', 'Class and all resources deleted.', 'success');
        navigate('/dashboard'); // Redirect after deletion
      } catch (err) {
        console.error('Failed to delete class:', err);
        Swal.fire('Error!', 'Something went wrong.', 'error');
      }
    }
  };

  if (loading) return <div className="text-center py-10">Loading class details...</div>;
  if (!classData) return <div className="text-center py-10 text-red-500">Class not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-blue-600">{classData.class_code.toUpperCase()}</h2>
        <button
          onClick={deleteClassWithResources}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete Class
        </button>
      </div>

      <p className="mb-2"><strong>Course:</strong> {classData.course_code}</p>
      <p className="mb-2"><strong>Faculty:</strong> {classData.faculty_initial}</p>
      <p className="mb-2"><strong>Semester:</strong> {classData.semester}</p>
      <p className="mb-2"><strong>Section:</strong> {classData.section}</p>

      {/* Class Resources */}
      <div className="mt-10">
        <div className='flex justify-between'>
          <h3 className="text-2xl font-semibold mb-4">Class Resources</h3>
          <Link
            to={`/dashboard/uploadmaterial/${class_code}`}
            state={{
              class_code: classData.class_code,
              course_code: classData.course_code,
            }}
          >
            <button className='btn'>Upload Materials</button>
          </Link>
        </div>

        {resources.length === 0 ? (
          <p className="text-gray-500">No resources added for this class.</p>
        ) : (
          <ul className="space-y-4">
            {resources.map((resource) => (
              <li
                key={resource._id}
                className="border p-4 rounded-md shadow hover:shadow-md flex justify-between items-start"
              >
                <div>
                  <p className="font-medium text-gray-800">{resource.description}</p>
                  <p className="text-sm text-gray-500">Type: {resource.type}</p>
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Visit Resource
                  </a>
                </div>
                <button
                  onClick={() => handleDeleteResource(resource._id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClassPage;
