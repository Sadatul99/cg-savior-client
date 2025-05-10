import React, { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
// import useAxiosSecure from '../../../hooks/useAxiosSecure';
import SectionTitle from '../../../components/SectionTitle/SectionTitle';
import { Link } from 'react-router-dom';
import useAxiosPublic from '../../../hooks/useAxiosPublic';

const ClassCollection = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosPublic.get('/classroom');
        const allClasses = res.data;
        const filtered = allClasses.filter(cls => cls.email === user.email);
        setMyClasses(filtered);
      } catch (err) {
        console.error('Error fetching classrooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [axiosPublic, user.email]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4">
      <SectionTitle heading="My Classrooms" subHeading="Classes you've created" />

      {myClasses.length === 0 ? (
        <p className="text-center text-gray-600">You haven't created any classrooms yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myClasses.map(cls => (
            <Link to={`${cls.class_code}`} key={cls.class_code}>
            <div className="border p-4 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-blue-600">{cls.class_code.toUpperCase()}</h3>
              <p className="text-gray-700 mb-1"><strong>Course:</strong> {cls.course_code}</p>
              <p className="text-gray-700 mb-1"><strong>Faculty:</strong> {cls.faculty_initial}</p>
              <p className="text-gray-700 mb-1"><strong>Semester:</strong> {cls.semester}</p>
              <p className="text-gray-700"><strong>Section:</strong> {cls.section}</p>
            </div>
          </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassCollection;
