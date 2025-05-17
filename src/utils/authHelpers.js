import axios from "axios";

// Intercept all requests to check the auth status
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercept responses to handle token refresh
axios.interceptors.response.use(
    (response) => {
        // Check if the response contains a new access token
        const newToken = response.headers["x-new-access-token"];
        if (newToken) {
            localStorage.setItem("token", newToken);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Avoid infinite loops
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        // Handle 401/403 errors - token expired or invalid
        if (
            (error.response &&
                (error.response.status === 401 || error.response.status === 403)) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // Check auth status - this will use the refresh token cookie
                const response = await axios.get("/api/check-auth");

                if (response.data.authenticated && response.data.newAccessToken) {
                    // Update token in local storage
                    localStorage.setItem("token", response.data.newAccessToken);

                    // Update the user object if needed
                    if (response.data.user) {
                        localStorage.setItem("user", JSON.stringify(response.data.user));
                    }

                    // Set the auth header for the original request
                    originalRequest.headers.Authorization = `Bearer ${response.data.newAccessToken}`;

                    // Retry the original request with the new token
                    return axios(originalRequest);
                }
            } catch (error) {
                console.error("Error refreshing token:", error);

                // If refresh failed, redirect to login
                if (window.location.pathname !== "/login") {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                }
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Check if user is authenticated, and try to refresh token if needed
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export const checkAuthentication = async () => {
    try {
        // Access token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
            // No token in localStorage, try to use refresh token
            const response = await axios.get("/api/check-auth");

            if (response.data.authenticated) {
                // Successfully authenticated with refresh token
                if (response.data.newAccessToken) {
                    localStorage.setItem("token", response.data.newAccessToken);
                }

                if (response.data.user) {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }

                return true;
            }

            return false;
        }

        // Token exists, verify it
        await axios.get("/api/protected");
        return true;
    } catch (error) {
        console.error("Authentication check failed:", error);

        // Try refresh flow
        try {
            const response = await axios.get("/api/check-auth");

            return response.data.authenticated === true;
        } catch (refreshError) {
            console.error("Refresh authentication failed:", refreshError);
            return false;
        }
    }
};
