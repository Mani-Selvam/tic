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

export const getWorkAnalysis = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query
        ? `${API_ENDPOINTS.WORK_ANALYSIS}?${query}`
        : API_ENDPOINTS.WORK_ANALYSIS;
    return fetch(url, { headers: getAuthHeaders() }).then(handleResponse);
};

export const createWorkAnalysis = (data) => {
    const isFormData = data instanceof FormData;
    const headers = getAuthHeaders();
    if (isFormData) delete headers["Content-Type"];
    return fetch(API_ENDPOINTS.WORK_ANALYSIS, {
        method: "POST",
        headers,
        body: isFormData ? data : JSON.stringify(data),
    }).then(handleResponse);
};

export const updateWorkAnalysis = (id, data) =>
    fetch(`${API_ENDPOINTS.WORK_ANALYSIS}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    }).then(handleResponse);

export const getMaterialApprovedAnalysis = () =>
    fetch(`${API_ENDPOINTS.WORK_ANALYSIS}/approved`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const getWorkerWorkAnalysis = () =>
    fetch(`${API_ENDPOINTS.WORK_ANALYSIS}/worker`, {
        headers: getAuthHeaders(),
    }).then(handleResponse);
