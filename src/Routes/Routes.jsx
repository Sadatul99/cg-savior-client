import {
  createBrowserRouter,
} from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../pages/Home/Home";
import OurTeam from "../pages/Our Team/OurTeam";
import Login from "../pages/Login/Login";
import SignUp from "../pages/SignUp/SignUp";
import Courses from "../pages/DashBoard/courses/courses";
import Dashboard from "../Layout/Dashboard";
import BookmarkedCourses from "../pages/DashBoard/BookmarkedCourses/BookmarkedCourses";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import AllUsers from "../pages/DashBoard/AllUsers/AllUsers";
import AdminHome from "../pages/DashBoard/AdminHome/AdminHome";
import AddCourse from "../pages/DashBoard/AddCourse/AddCourse";
import AddResource from "../pages/DashBoard/AddResource/AddResource";
import AdminRoute from "./AdminRoute";
import PrivateRoute from "./PrivateRoute";
import CoursePage from "../pages/DashBoard/CoursePage/CoursePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Home /> },
      { path: "our-team", element: <OurTeam /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> }
    ],
  },
  {
    path: "/dashboard",
    element: <PrivateRoute><Dashboard /></PrivateRoute>,
    errorElement: <ErrorPage />,
    children: [
      // Dashboard Home (Admin, Faculty or User home)
      { path: "", element: <AdminHome /> },

      // Common Routes
      { path: "courses", element: <Courses /> },
      { path: "courses/:id", element: <CoursePage /> },
      { path: "bookmarks", element: <BookmarkedCourses /> },

      // Admin-only routes
      { path: "users", element: <AdminRoute><AllUsers /></AdminRoute> },
      { path: "addcourse", element: <AdminRoute><AddCourse /></AdminRoute> },
      { path: "addresource", element: <AdminRoute><AddResource /></AdminRoute> }
    ]
  }
]);
