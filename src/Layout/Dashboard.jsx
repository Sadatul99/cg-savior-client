import {  FaHome, FaSearch , FaUsers, FaPlusCircle} from "react-icons/fa";
import { NavLink, Outlet } from "react-router-dom";
import AnimatedLogo from "../components/AnimatedLogo/AnimatedLogo";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import useAdmin from "../hooks/useAdmin";


const Dashboard = () => {

    const [isAdmin] = useAdmin();

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="w-64 backdrop-blur-lg bg-black/30 border-r border-gray-700 flex flex-col">
                <div className="flex my-8 ml-10">
                    <AnimatedLogo />
                    <ThemeToggle />
                </div>



                <ul className="menu flex-1 px-4 space-y-1">
                    {
                        isAdmin ? <>
                            <li>
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 p-3 rounded-lg transition ${isActive
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-gray-800 hover:text-blue-400"
                                        }`
                                    }
                                >
                                    <FaHome></FaHome>
                                    Admin Home
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/dashboard/addcourse"
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 p-3 rounded-lg transition ${isActive
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-gray-800 hover:text-blue-400"
                                        }`
                                    }
                                >
                                    
                                    ➕ Add Course
                                </NavLink>
                            </li>
                            {/* <li>
                                <NavLink
                                    to="/dashboard/courses"
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 p-3 rounded-lg transition ${isActive
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-gray-800 hover:text-blue-400"
                                        }`
                                    }
                                >
                                    📚 Manage Courses
                                </NavLink>
                            </li> */}
                            <li>
                                <NavLink
                                    to="/dashboard/addresource"
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 p-3 rounded-lg transition ${isActive
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-gray-800 hover:text-blue-400"
                                        }`
                                    }
                                >
                                 <FaPlusCircle />  Add Resources
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to="/dashboard/bookmarks"
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 p-3 rounded-lg transition ${isActive
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-gray-800 hover:text-blue-400"
                                        }`
                                    }
                                >
                                    📌 Bookmarked Courses
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/dashboard/users"
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 p-3 rounded-lg transition ${isActive
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-gray-800 hover:text-blue-400"
                                        }`
                                    }
                                >
                                <FaUsers></FaUsers>
                                All Users
                                </NavLink>
                            </li>
                        </>
                            :
                            <>
                            </>
                    }

                    <div className="divider before:bg-gray-700 after:bg-gray-700"></div>

                    <li>
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg transition ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-800 hover:text-blue-400"
                                }`
                            }
                        >
                            <FaHome /> Home
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/dashboard/courses"
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg transition ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-800 hover:text-blue-400"
                                }`
                            }
                        >
                            <FaSearch /> Courses
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/dashboard/contact"
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg transition ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-800 hover:text-blue-400"
                                }`
                            }
                        >
                            ✉️ Contact Us
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/dashboard/contact"
                            className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg transition ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-800 hover:text-blue-400"
                                }`
                            }
                        >
                            🗓️ Academic dates
                        </NavLink>
                    </li>
                </ul>

                <div className="text-center text-xs p-4 text-gray-500">
                    © {new Date().getFullYear()} CG Savior
                </div>
            </div>

            {/* Main Content */}

            <div className="flex-1 p-8 overflow-y-auto">
                {/* <NavBar></NavBar> */}
                <Outlet />
            </div>


        </div>
    );
};

export default Dashboard;
