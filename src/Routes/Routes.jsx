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
import FacultyHome from "../pages/DashBoard/FacultyHome/FacultyHome";
import DashboardHome from "../components/DashboardHome/DashboardHome";
import AddClassroom from "../pages/DashBoard/AddClassroom/AddClassroom";
import ClassCollection from "../pages/DashBoard/ClassCollection/ClassCollection";
import ClassPage from "../pages/DashBoard/ClassPage/ClassPage";
import AddClassMaterial from "../pages/DashBoard/AddClassMaterial/AddClassMaterial";
import UpdateCourse from "../pages/DashBoard/UpdateCourse/UpdateCourse";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    // errorElement: <ErrorPage />,
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
    // errorElement: <ErrorPage />,
    children: [
      // Dashboard Home (Admin, Faculty or User home)
      { 
        path: "", 
        element: <DashboardHome></DashboardHome>
      },
      

      // Common Routes
      { path: "courses", 
        element: <Courses /> 
      },
      { path: "courses/:course_code", 
        element: <CoursePage />
       },
      { path: "courses/updateCourse/:course_code", 
        element: <UpdateCourse></UpdateCourse>,
        loader: ({params}) => fetch(`http://localhost:5000/courses/${params.course_code}`)
       },
      { path: "bookmarks", 
        element: <BookmarkedCourses />
       },
       { path: "addresource",  
         element: <AddResource />
       },

      // Admin-only routes
      { path: "users", 
        element: <AllUsers /> 
      },
      { path: "addcourse", 
        element: <AddCourse />
      },

      // Faculty routes
      { path: "addclassroom",  
        element:  <AddClassroom></AddClassroom>
      },
      { path: "myclasses",  
        element:  <ClassCollection></ClassCollection>
      },
      { path: "myclasses/:code",  
        element:  <ClassPage></ClassPage>
      },
      { path: "uploadmaterial/:code",  
        element:  <AddClassMaterial></AddClassMaterial>
      },
    ]
  }
]);
