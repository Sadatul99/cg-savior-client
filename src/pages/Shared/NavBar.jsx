import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import AnimatedLogo from "../../components/AnimatedLogo/AnimatedLogo";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";

const NavBar = () => {
  const { user, logOut } = useContext(AuthContext);

  const handleLogOut = () => {
    logOut().catch(error => console.log(error));
  };

  const navLinks = (
    <>
      <li><Link to="/" className="hover:text-blue-500">Home</Link></li>
      <li><Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link></li>
      <li><Link to="/our-team" className="hover:text-blue-500">Our Team</Link></li>
      <li><Link to="/courses" className="hover:text-blue-500">Courses</Link></li>
    </>
  );

  return (
    <div className="navbar fixed z-10 max-w-screen p-5 text-white shadow-md backdrop-blur-md bg-black/30">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-3 shadow bg-black/80 rounded-lg w-48">
            {navLinks}
          </ul>
        </div>

        <AnimatedLogo />
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-4 space-x-6 text-lg">
          {navLinks}
        </ul>
      </div>

      <div className="navbar-end flex gap-3">
      <ThemeToggle />
        {user ? (
          <button onClick={handleLogOut} className="btn btn-ghost">LogOut</button>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition">Login</Link>
            <Link to="/signup" className="px-4 py-2 rounded-lg border border-white hover:bg-gray-700 transition">Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
