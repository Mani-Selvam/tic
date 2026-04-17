import API_ENDPOINTS from "@/config/apiConfig";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const handleResponse = async (res) => {
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(err.message || "Request failed");
    }
    return res.json();
};

export const getWorkerAssignedTickets = () =>
    fetch(`${API_ENDPOINTS.TICKETS}/assigned`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const getWorkerWorkAnalysis = () =>
    fetch(`${API_ENDPOINTS.WORK_ANALYSIS}/worker`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
