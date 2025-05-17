import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { checkAuthentication } from "../utils/authHelpers";
import "../styles/loading.scss";

function ProtectedRoute({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const authenticated = await checkAuthentication();
                setIsAuthenticated(authenticated);
            } catch (error) {
                console.error("Error verifying authentication:", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, []);

    if (isLoading) {
        // Return loading state
        return <div className="loading-container">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login page
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render children
    return children;
}

export default ProtectedRoute;
