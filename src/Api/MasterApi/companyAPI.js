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
        throw new Error(err.message || `Request failed`);
    }
    return res.json();
};

export const getCompanies = () =>
    fetch(API_ENDPOINTS.COMPANIES, { headers: getAuthHeaders() }).then(handleResponse);

export const createCompany = (data) =>
    fetch(API_ENDPOINTS.COMPANIES, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const updateCompany = (id, data) =>
    fetch(`${API_ENDPOINTS.COMPANIES}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const deleteCompany = (id) =>
    fetch(`${API_ENDPOINTS.COMPANIES}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    }).then(handleResponse);
