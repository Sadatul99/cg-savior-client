import { Outlet } from "react-router-dom";

const Main = () => {
    return (
        <div>
            <div className="min-h-screen">
                <Outlet></Outlet>
            </div>
        </div>
    );
};

export default Main;
