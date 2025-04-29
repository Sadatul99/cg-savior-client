import { Link } from "react-router-dom";

const ErrorPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <img 
                src="https://illustrations.popsy.co/gray/error.svg" 
                alt="Page not found" 
                className="w-96 mb-8"
            />
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Oops! Page Not Found</h1>
            <p className="text-gray-600 text-lg mb-6 text-center max-w-md">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link 
                to="/dashboard" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Go back home
            </Link>
        </div>
    );
};

export default ErrorPage;
