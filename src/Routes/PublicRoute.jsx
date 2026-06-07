import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";
import { Navigate } from "react-router-dom";


const PublicRoute = ({children}) => {
    const {user, loading} = useContext(AuthContext);

    if(loading){
        return <span className="loading loading-spinner loading-xl"></span>
    }

    if(user){
        return <Navigate to="/dashboard"></Navigate>
    } 
    return children;
};

export default PublicRoute;
