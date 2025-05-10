
import useAdmin from "../../hooks/useAdmin";
import useFaculty from "../../hooks/useFaculty";
import AdminHome from "../../pages/DashBoard/AdminHome/AdminHome";
import FacultyHome from "../../pages/DashBoard/FacultyHome/FacultyHome";
import UserHome from "../../pages/DashBoard/UserHome/UserHome";

const DashboardHome = () => {
    const [isAdmin, isAdminLoading] = useAdmin();
    const [isFaculty, isFacultyLoading] = useFaculty();
  
    if (isAdminLoading || isFacultyLoading) {
      return <div>Loading...</div>;
    }
  
    if (isAdmin) {
      return <AdminHome />;
    }
  
    if (isFaculty) {
      return <FacultyHome />;
    }
  
    return <UserHome />;
  };
  
  export default DashboardHome;
