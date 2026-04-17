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

export const createWorkLog = (data) =>
    fetch(API_ENDPOINTS.WORK_LOGS, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const getWorkLogs = () =>
    fetch(API_ENDPOINTS.WORK_LOGS, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const getWorkLogsByTicket = (ticketId) =>
    fetch(`${API_ENDPOINTS.WORK_LOGS}/ticket/${ticketId}`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const getWorkLogsByAnalysis = (analysisId) =>
    fetch(`${API_ENDPOINTS.WORK_LOGS}/analysis/${analysisId}`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
