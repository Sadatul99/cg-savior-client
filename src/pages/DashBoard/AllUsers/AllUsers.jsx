import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { FaTrashAlt, FaUsers, FaChalkboardTeacher, FaArrowDown } from "react-icons/fa";
import Swal from "sweetalert2";

const AllUsers = () => {
  const axiosSecure = useAxiosSecure();

  const { data: users = [], refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users", {
        headers: {
          authorization: `Bearer ${localStorage.getItem('access-token')}`
        }
      });
      return res.data;
    },
  });

  const confirmAndChangeRole = (user, newRole) => {
    Swal.fire({
      title: `Are you sure?`,
      text: `You want to make ${user.name} a ${newRole === "user" ? "Normal User" : newRole}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, do it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .patch(`/users/role/${user._id}`, { role: newRole })
          .then((res) => {
            if (res.data.modifiedCount > 0) {
              refetch();
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: `${user.name} is now a ${newRole === "user" ? "Normal User" : newRole}!`,
                showConfirmButton: false,
                timer: 1500,
              });
            }
          });
      }
    });
  };

  const handleDeleteUser = (user) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/users/${user._id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            refetch();
            Swal.fire({
              title: "Deleted!",
              text: "User has been removed.",
              icon: "success",
            });
          }
        });
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">All Users</h2>
        <h2 className="text-lg">Total Users: {users.length}</h2>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse bg-white text-gray-800">
          {/* Table Head */}
          <thead className="bg-gray-200 text-gray-900">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id} className="border-b hover:bg-gray-100 transition">
                <td className="p-4 font-medium">{index + 1}</td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>

                <td className="p-4">
                  {user.role === "admin" && (
                    <span className="text-green-600 font-semibold">Admin</span>
                  )}
                  {user.role === "faculty" && (
                    <span className="text-blue-600 font-semibold">Faculty</span>
                  )}
                  {user.role === "user" && (
                    <span className="text-gray-700 font-medium">User</span>
                  )}
                </td>

                <td className="p-4 flex justify-center gap-2 flex-wrap">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => confirmAndChangeRole(user, "admin")}
                      className="p-2 bg-orange-500 hover:bg-orange-600 rounded text-white transition"
                      title="Make Admin"
                    >
                      <FaUsers className="text-lg" />
                    </button>
                  )}

                  {user.role !== "faculty" && (
                    <button
                      onClick={() => confirmAndChangeRole(user, "faculty")}
                      className="p-2 bg-blue-500 hover:bg-blue-600 rounded text-white transition"
                      title="Make Faculty"
                    >
                      <FaChalkboardTeacher className="text-lg" />
                    </button>
                  )}

                  {user.role !== "user" && (
                    <button
                      onClick={() => confirmAndChangeRole(user, "user")}
                      className="p-2 bg-gray-500 hover:bg-gray-600 rounded text-white transition"
                      title="Demote to User"
                    >
                      <FaArrowDown className="text-lg" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded text-white transition"
                    title="Delete User"
                  >
                    <FaTrashAlt className="text-lg" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUsers;
