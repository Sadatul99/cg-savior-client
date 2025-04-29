import {
    createBrowserRouter,
  } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../pages/Home/Home";
import OurTeam from "../pages/Our Team/OurTeam";
import Login from "../pages/Login/Login";
import SignUp from "../pages/SignUp/SignUp";
import Courses from "../pages/DashBoard/courses/courses";
import Dashboard from "../Layout/Dashboard"
import BookmarkedCourses from "../pages/DashBoard/BookmarkedCourses/BookmarkedCourses";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import AllUsers from "../pages/DashBoard/AllUsers/AllUsers";
import AdminHome from "../pages/DashBoard/AdminHome/AdminHome";
import AddCourse from "../pages/DashBoard/AddCourse/AddCourse";
import AddResource from "../pages/DashBoard/AddResource/AddResource";
import AdminRoute from "./AdminRoute"
import CoursePage from "../pages/DashBoard/CoursePage/CoursePage";

export const router = createBrowserRouter([
    {
      path: "/",
      element: <Main></Main>,
    //   errorElement: <ErrorPage></ErrorPage>,
      children:[
        {
            path: '/',
            element: <Home></Home>
        },
        {
            path: '/our-team',
            element: <OurTeam></OurTeam>
        },
        {
            path: '/login',
            element: <Login></Login>
        },
        {
            path: '/signup',
            element: <SignUp></SignUp>
        },
        // {
        //     path: '/courses',
        //     element: <Courses></Courses>
        // }
      ]
    },
    {
      path: "dashboard",
      element: <Dashboard></Dashboard>,
    //   errorElement: <ErrorPage></ErrorPage>,
      children:[
        {
            path: 'courses',
            element: <Courses></Courses>
        },    
        {
            path: 'courses/:id',
            element: <CoursePage></CoursePage>
        },    
        {
            path: 'bookmarks',
            element: <BookmarkedCourses></BookmarkedCourses>
        },    

        // Admin routes
        {
            path: '/dashboard',
            element: <AdminHome></AdminHome>
        },    
        {
            path: 'users',
            element: <AdminRoute><AllUsers></AllUsers></AdminRoute>
        },    
        {
            path: 'addcourse',
            element: <AdminRoute><AddCourse></AddCourse></AdminRoute>
        },    
        {
            path: 'addresource',
            element: <AdminRoute><AddResource></AddResource></AdminRoute>
        },    
        {
            path: '/dashboard/courses',
            element: <Courses></Courses>
        } 
      ]
    },
  ]);