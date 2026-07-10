import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import Main from "../Layout/Main";
import Login from "../pages/Login/Login";
import Courses from "../pages/DashBoard/courses/courses";
import Dashboard from "../Layout/Dashboard";
import BookmarkedCourses from "../pages/DashBoard/BookmarkedCourses/BookmarkedCourses";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import AllUsers from "../pages/DashBoard/AllUsers/AllUsers";
import AddCourse from "../pages/DashBoard/AddCourse/AddCourse";
import AddResource from "../pages/DashBoard/AddResource/AddResource";
import PrivateRoute from "./PrivateRoute";
import CoursePage from "../pages/DashBoard/CoursePage/CoursePage";
import DashboardHome from "../components/DashboardHome/DashboardHome";
import AddClassroom from "../pages/DashBoard/AddClassroom/AddClassroom";
import ClassCollection from "../pages/DashBoard/ClassCollection/ClassCollection";
import ClassPage from "../pages/DashBoard/ClassPage/ClassPage";
import AddClassMaterial from "../pages/DashBoard/AddClassMaterial/AddClassMaterial";
import UpdateCourse from "../pages/DashBoard/UpdateCourse/UpdateCourse";
import PreRegistration from "../pages/DashBoard/PreRegistration/PreRegistration";
import Feedback from "../pages/Feedback/Feedback";
import PublicRoute from "./PublicRoute";
// import Airoutine from "../pages/DashBoard/Airoutine/Airoutine";
import RoutineBuilder from "../components/RoutineBuilder";
import AcademicDates from "../pages/DashBoard/AcademicDates/AcademicDates";

export const router = createBrowserRouter([
  {
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <PublicRoute><Login /></PublicRoute> },
      { path: "our-team", element: <Navigate to="/" replace /> },
      { path: "login", element: <PublicRoute><Login /></PublicRoute> },
      { path: "signup", element: <Navigate to="/" replace /> }
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
        loader: ({params}) => fetch(`https://cg-savior-server.onrender.com/courses/${params.course_code}`)
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
      { path: "RoutineBuilder", 
        element: <RoutineBuilder />
      },
      { path: "AcademicDates", 
        element: <AcademicDates />
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
