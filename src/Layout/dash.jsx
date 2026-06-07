import { FaHome, FaSearch, FaUsers, FaPlusCircle } from "react-icons/fa";
import { NavLink, Outlet } from "react-router-dom";
import AnimatedLogo from "../components/AnimatedLogo/AnimatedLogo";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import useAdmin from "../hooks/useAdmin";
import useFaculty from "../hooks/useFaculty";

const Dashboard = () => {
    const [isAdmin, adminLoading] = useAdmin();
    const [isFaculty, facultyLoading] = useFaculty();


    if (adminLoading || facultyLoading) {
        return (
            <div className="flex items-center justify-center h-screen text-white">
                Checking access...
            </div>
        );
    }
    // const isAdmin = false
    // const isFaculty = true

    const navClass = ({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-lg transition ${isActive
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-800 hover:text-blue-400"
        }`;

    const renderSidebarLinks = () => {
        if (isAdmin) {
            return (
                <>
                    <li>
                        <NavLink to="/dashboard" className={navClass}>
                            <FaHome />
                            Admin Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dashboard/addcourse" className={navClass}>
                            ➕ Add Course
                        </NavLink>
                    </li>

                    {/* <li>
            <NavLink to="/dashboard/bookmarks" className={navClass}>
              📌 Bookmarked Courses
            </NavLink>
          </li> */}
                    <li>
                        <NavLink to="/dashboard/users" className={navClass}>
                            <FaUsers />
                            All Users
                        </NavLink>
                    </li>
                </>
            );
        } else if (isFaculty) {
            return (
                <>
                    <li>
                        <NavLink to="/dashboard" className={navClass}>
                            <FaHome />
                            Faculty Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dashboard/addclassroom" className={navClass}>
                            ➕ Create classroom
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dashboard/myclasses" className={navClass}>
                            📘 My Classrooms
                        </NavLink>
                    </li>
                    {/* <li>
            <NavLink to="/dashboard/uploadmaterial" className={navClass}>
              📤 Upload Materials
            </NavLink>
          </li> */}
                </>
            );
        } else {
            return (
                <>
                    <li>
                        <NavLink to="/dashboard" className={navClass}>
                            <FaHome />
                            User Home
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
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                {/* Navbar */}
                <nav className="navbar w-full bg-base-300">
                    <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                        {/* Sidebar toggle icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
                    </label>
                    {/* Navbar logo */}
                    <div className="flex my-8 ml-10">
                        <AnimatedLogo />
                        <ThemeToggle />
                    </div>
                </nav>
                {/* Page content here */}
                <Outlet />
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
                    {/* Sidebar content here */}
                    <ul className="menu w-full grow">
                        {/* List item */}
                        {renderSidebarLinks()}

                        <div className="divider before:bg-gray-700 after:bg-gray-700"></div>

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
                                🪑 seat status
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/contact" className={navClass}>
                                ✉️ Contact Us
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