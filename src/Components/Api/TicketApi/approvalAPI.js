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

export const createApproval = (data) =>
    fetch(`${API_ENDPOINTS.BASE_URL}/api/approvals`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const getApprovals = () =>
    fetch(`${API_ENDPOINTS.BASE_URL}/api/approvals`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
