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

const crudApi = (endpoint) => ({
    getAll: () => fetch(endpoint, { headers: getAuthHeaders() }).then(handleResponse),
    create: (data) => fetch(endpoint, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    update: (id, data) => fetch(`${endpoint}/${id}`, { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id) => fetch(`${endpoint}/${id}`, { method: "DELETE", headers: getAuthHeaders() }).then(handleResponse),
    getById: (id) => fetch(`${endpoint}/${id}`, { headers: getAuthHeaders() }).then(handleResponse),
});

export const departmentAPI = crudApi(API_ENDPOINTS.DEPARTMENTS);
export const priorityAPI = crudApi(API_ENDPOINTS.PRIORITIES);
export const ticketStatusAPI = crudApi(API_ENDPOINTS.TICKET_STATUSES);
export const designationAPI = crudApi(API_ENDPOINTS.DESIGNATIONS);
export const companyAPI = crudApi(API_ENDPOINTS.COMPANIES);

const USERS_URL = `${API_ENDPOINTS.BASE_URL}/api/users`;
export const userAPI = {
    ...crudApi(USERS_URL),
    getAll: () => fetch(USERS_URL, { headers: getAuthHeaders() }).then(handleResponse),
};
