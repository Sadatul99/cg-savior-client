import { FaHome, FaSearch, FaUsers, FaPlusCircle, FaSignOutAlt, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { BsLightningFill } from "react-icons/bs";
import { NavLink, Outlet, Link } from "react-router-dom";
import AnimatedLogo from "../components/AnimatedLogo/AnimatedLogo";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import useAdmin from "../hooks/useAdmin";
import useFaculty from "../hooks/useFaculty";
import { useContext, useState } from "react";
import { AuthContext } from "../providers/AuthProvider";


const Dashboard = () => {
  const [isAdmin, adminLoading] = useAdmin();
  const [isFaculty, facultyLoading] = useFaculty();
  const { user, logOut } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogOut = () => {
    logOut().catch(error => console.log(error));
  };

  if (adminLoading || facultyLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Checking access...
      </div>
    );
  }

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-lg transition ${isActive ? "bg-blue-600 text-white" : "hover:bg-gray-800 hover:text-blue-400"
    }`;

  const renderSidebarLinks = () => {
    if (isAdmin) {
      return (
        <>
          <li>
            <NavLink to="/dashboard" className={navClass}>
              <FaHome /> Admin Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/addcourse" className={navClass}>
              <FaPlusCircle /> Add Course
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/users" className={navClass}>
              <FaUsers /> All Users
            </NavLink>
          </li>
          
        </>
      );
    } else if (isFaculty) {
      return (
        <>
          <li>
            <NavLink to="/dashboard" className={navClass}>
              <FaHome /> Faculty Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/addclassroom" className={navClass}>
              <FaPlusCircle /> Create Classroom
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/myclasses" className={navClass}>
              📘 My Classrooms
            </NavLink>
          </li>
        </>
      );
    } else {
      return (
        <>
          <li>
            <NavLink to="/dashboard" className={navClass}>
              <FaHome /> User Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/bookmarks" className={navClass}>
              📌 My Bookmarks
            </NavLink>
          </li>
        </>
      );
    }
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />

      {/* Page Content */}
      <div className="drawer-content flex flex-col">
        <nav className="navbar w-full bg-base-300 border-b border-base-300 z-20 px-4">

          {/* Drawer Button (Mobile Only) */}
          <label htmlFor="drawer-toggle" className="btn btn-square btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2"
              fill="none"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>

          {/* LEFT SIDE — LOGO */}
          <div className="flex items-center">
            <AnimatedLogo />
          </div>

          {/* RIGHT SIDE — THEME + PROFILE */}
          <div className="ml-auto flex items-center gap-4 relative">
            
            <ThemeToggle />
            {/* Profile Avatar + Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center"
                >
                  <img
                    src={
                      user.photoURL
                        ? user.photoURL.replace(/=s\d+-c/, "=s400-c")
                        : "/default-avatar.png"
                    }
                    alt="User"
                    className="w-full h-full object-cover object-center block"
                    referrerPolicy="no-referrer"
                  />
                </button>

                {profileOpen && (
                  <ul className="absolute right-0 mt-2 w-40 bg-base-200 shadow-lg rounded-lg py-2 z-50">
                    <li className="px-4 py-2 hover:bg-gray-700/50 cursor-pointer">
                      {user.displayName || "User"}
                    </li>
                    <li
                      onClick={handleLogOut}
                      className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700/50 cursor-pointer text-red-400"
                    >
                      <FaSignOutAlt /> Logout
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-outline gap-2">
                  <FaSignInAlt /> Login
                </Link>
                <Link to="/signup" className="btn btn-sm btn-primary gap-2">
                  <FaUserPlus /> Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-30">
        <label htmlFor="drawer-toggle" className="drawer-overlay"></label>
        <div className="w-64 bg-base-300 min-h-full p-4">
          <ul className="menu w-full grow">
            {renderSidebarLinks()}

            <div className="divider"></div>

            <li>
              <NavLink to="/" className={navClass}>
                <FaHome /> Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/courses" className={navClass}>
                <FaSearch /> Courses
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/addresource" className={navClass}>
                <FaPlusCircle /> Add Resources
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/PreRegistration" className={navClass}>
                🪑 Seat Status
              </NavLink>
            </li>
            <li>
            <NavLink to="/dashboard/RoutineBuilder" className={navClass}>
              <BsLightningFill/> AI Routine Builder
            </NavLink>
          </li>
            <li>
              <NavLink to="/dashboard/feedback" className={navClass}>
                ✉️ Feedback
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/dates" className={navClass}>
                🗓️ Academic Dates
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
