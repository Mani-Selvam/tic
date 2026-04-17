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
        const err = await res
            .json()
            .catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(err.message || `Request failed`);
    }
    return res.json();
};

export const getTickets = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query
        ? `${API_ENDPOINTS.TICKETS}?${query}`
        : API_ENDPOINTS.TICKETS;
    return fetch(url, { headers: getAuthHeaders() }).then(handleResponse);
};

export const getTicketById = (id) =>
    fetch(`${API_ENDPOINTS.TICKETS}/${id}`, { headers: getAuthHeaders() }).then(
        handleResponse,
    );

export const createTicket = (data) => {
    const isFormData = data instanceof FormData;
    const headers = getAuthHeaders();
    if (isFormData) delete headers["Content-Type"];
    return fetch(API_ENDPOINTS.TICKETS, {
        method: "POST",
        headers,
        body: isFormData ? data : JSON.stringify(data),
    }).then(handleResponse);
};

export const updateTicket = (id, data) =>
    fetch(`${API_ENDPOINTS.TICKETS}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const deleteTicket = (id) =>
    fetch(`${API_ENDPOINTS.TICKETS}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const getWorkLogs = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query
        ? `${API_ENDPOINTS.WORK_LOGS}?${query}`
        : API_ENDPOINTS.WORK_LOGS;
    return fetch(url, { headers: getAuthHeaders() }).then(handleResponse);
};

export const getWorkAnalysis = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query
        ? `${API_ENDPOINTS.WORK_ANALYSIS}?${query}`
        : API_ENDPOINTS.WORK_ANALYSIS;
    return fetch(url, { headers: getAuthHeaders() }).then(handleResponse);
};

export const getMaterialApprovedWorkAnalysis = () => {
    return fetch(`${API_ENDPOINTS.WORK_ANALYSIS}/approved`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
};
