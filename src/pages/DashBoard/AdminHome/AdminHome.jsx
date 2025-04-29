import { FaUsers, FaChalkboardTeacher, FaCalendarAlt } from "react-icons/fa";

const AdminHome = () => {
  return (
    <div className="p-6">
      {/* Page Heading */}
      <h2 className="text-3xl font-bold mb-8">Welcome, Admin!</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Users */}
        <div className="p-6 bg-white rounded-lg shadow flex items-center gap-4 hover:shadow-lg transition">
          <div className="p-4 bg-blue-500 text-white rounded-full">
            <FaUsers className="text-2xl" />
          </div>
          <div>
            <p className="text-gray-600">Total Users</p>
            <h3 className="text-2xl font-bold">120</h3>
          </div>
        </div>

        {/* Total Faculties */}
        <div className="p-6 bg-white rounded-lg shadow flex items-center gap-4 hover:shadow-lg transition">
          <div className="p-4 bg-green-500 text-white rounded-full">
            <FaChalkboardTeacher className="text-2xl" />
          </div>
          <div>
            <p className="text-gray-600">Total Faculties</p>
            <h3 className="text-2xl font-bold">18</h3>
          </div>
        </div>

        {/* Total Events */}
        <div className="p-6 bg-white rounded-lg shadow flex items-center gap-4 hover:shadow-lg transition">
          <div className="p-4 bg-orange-500 text-white rounded-full">
            <FaCalendarAlt className="text-2xl" />
          </div>
          <div>
            <p className="text-gray-600">Total Events</p>
            <h3 className="text-2xl font-bold">32</h3>
          </div>
        </div>
      </div>

      {/* Optional Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Recent Activities</h3>
        <ul className="space-y-2">
          <li className="text-gray-700">✅ John Doe created a new event.</li>
          <li className="text-gray-700">✅ Jane Smith promoted to Faculty.</li>
          <li className="text-gray-700">❌ Deleted user: Mark Wilson.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminHome;
