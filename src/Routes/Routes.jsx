import {
  createBrowserRouter,
} from "react-router-dom";
import Main from "../Layout/Main";
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
import PreRegistration from "../pages/DashBoard/PreRegistration/PreRegistration";
import Feedback from "../pages/Feedback/Feedback";
import ThemeProvider from "../providers/ThemeProvider";
import PublicRoute from "./PublicRoute";
// import Airoutine from "../pages/DashBoard/Airoutine/Airoutine";
import RoutineBuilder from "../components/RoutineBuilder";

export const router = createBrowserRouter([
  {
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <PublicRoute><Login /></PublicRoute> },
      { path: "our-team", element: <OurTeam /> },
      { path: "login", element: <PublicRoute><Login /></PublicRoute> },
      { path: "signup", element: <SignUp /> }
    ],
  },
  {
    path: "/dashboard",
    element: <PrivateRoute><Dashboard /></PrivateRoute>,
    errorElement: <ErrorPage />,
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
        loader: ({params}) => fetch(`https://cg-savior-server.vercel.app/courses/${params.course_code}`)
       },
      { path: "bookmarks", 
        element: <BookmarkedCourses />
       },
       { path: "addresource",  
         element: <AddResource />
       },
       { path: "feedback",  
        element: <Feedback></Feedback>
      },
      { path: "PreRegistration",  
        element: <PreRegistration />
      },
      

      // Admin-only routes
      { path: "users", 
        element: <AllUsers /> 
      },
      { path: "addcourse", 
        element: <AddCourse />
      },
      { path: "RoutineBuilder", 
        element: <RoutineBuilder />
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
