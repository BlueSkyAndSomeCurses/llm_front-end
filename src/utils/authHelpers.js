import axios from "axios";

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

axios.interceptors.response.use((response) => {
    const newToken = response.headers["x-new-access-token"];
    if (newToken) {
        localStorage.setItem("token", newToken);
    }
    return response;
}, async (error) => {
    const originalRequest = error.config;

    if (originalRequest._retry) {
        return Promise.reject(error);
    }

    if ((error.response && (error.response.status === 401 || error.response.status === 403)) && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            const response = await axios.get("/api/check-auth");
            if (response.data.authenticated && response.data.newAccessToken) {
                localStorage.setItem("token", response.data.newAccessToken);

                if (response.data.user) {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }

                originalRequest.headers.Authorization = `Bearer ${response.data.newAccessToken}`;

                return axios(originalRequest);
            }
        } catch (error) {
            console.error("Error refreshing token:", error);

            if (window.location.pathname !== "/login") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
            }
        }
    }

    return Promise.reject(error);
});

export const checkAuthentication = async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            const response = await axios.get("/api/check-auth");

            if (response.data.authenticated) {
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
        await axios.get("/api/protected");
        return true;
    } catch (error) {
        console.error("Authentication check failed:", error);

        try {
            const response = await axios.get("/api/check-auth");

            return response.data.authenticated === true;
        } catch (refreshError) {
            console.error("Refresh authentication failed:", refreshError);
            return false;
        }
    }
};
