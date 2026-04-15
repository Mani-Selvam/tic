import API_ENDPOINTS from "@/config/apiConfig";

const API_BASE_URL = `${API_ENDPOINTS.BASE_URL}/api`;

export const loginUser = async (mobile, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile, password }),
        });

        if (!response.ok) {
            let errorData;
            try { errorData = await response.json(); }
            catch (e) { errorData = { message: `HTTP Error ${response.status}` }; }
            throw new Error(errorData.message || `Login failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || "An error occurred during login");
    }
};

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export const getAuthToken = () => localStorage.getItem("token");

export const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => !!localStorage.getItem("token");
