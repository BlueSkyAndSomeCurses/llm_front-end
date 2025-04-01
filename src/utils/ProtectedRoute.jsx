import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        // User is not authenticated, redirect to login
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render the protected component
    return children;
};

export default ProtectedRoute;
