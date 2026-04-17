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

export const getTicketStatuses = () =>
    fetch(API_ENDPOINTS.TICKET_STATUSES, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
