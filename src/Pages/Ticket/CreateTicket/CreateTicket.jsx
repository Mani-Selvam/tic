import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createTicket, updateTicket } from "@/Api/TicketApi/ticketAPI";
import {
    companyAPI,
    priorityAPI,
    ticketStatusAPI,
    userAPI,
    departmentAPI,
} from "@/Api/MasterApi/masterAPI";
import { getCurrentUser } from "@/Components/Login/loginAPI";
import "@/Components/MasterDash/master.css";
import "./createticket.css";

const CreateTicket = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = getCurrentUser();
    const isEdit = location.state?.isEdit;
    const existingTicket = location.state?.ticket;

    const [form, setForm] = useState({
        title: "",
        description: "",
        company_id: "",
        priority_id: "",
        status_id: "",
        assigned_to: "",
        department_id: "",
        location: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.allSettled([
            companyAPI.getAll(),
            priorityAPI.getAll(),
            ticketStatusAPI.getAll(),
            userAPI.getAll(),
            departmentAPI.getAll(),
        ]).then(([c, p, s, u, d]) => {
            const unwrap = (r) =>
                r.status === "fulfilled"
                    ? Array.isArray(r.value)
                        ? r.value
                        : (r.value?.data ?? [])
                    : [];
            setCompanies(unwrap(c));
            setPriorities(unwrap(p));
            setStatuses(unwrap(s));
            setUsers(unwrap(u));
            setDepartments(unwrap(d));
        });

        // If editing, populate form with existing data
        if (isEdit && existingTicket) {
            setForm({
                title: existingTicket.title || "",
                description: existingTicket.description || "",
                company_id:
                    existingTicket.company_id?._id ||
                    existingTicket.company_id ||
                    "",
                priority_id:
                    existingTicket.priority_id?._id ||
                    existingTicket.priority_id ||
                    "",
                status_id:
                    existingTicket.status_id?._id ||
                    existingTicket.status_id ||
                    "",
                assigned_to:
                    Array.isArray(existingTicket.assigned_to) &&
                    existingTicket.assigned_to.length > 0
                        ? existingTicket.assigned_to[0]._id ||
                          existingTicket.assigned_to[0]
                        : "",
                department_id:
                    existingTicket.department_id?._id ||
                    existingTicket.department_id ||
                    "",
                location: existingTicket.location || "",
            });
        }
    }, [isEdit, existingTicket]);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setError("Subject is required");
            return;
        }
        setSaving(true);
        setError("");
        try {
            if (isEdit && existingTicket) {
                // Update existing ticket
                const updateData = {
                    title: form.title,
                    description: form.description,
                    company_id: form.company_id || null,
                    department_id: form.department_id || null,
                    priority_id: form.priority_id || null,
                    status_id: form.status_id || null,
                    assigned_to: form.assigned_to ? [form.assigned_to] : [],
                    location: form.location || null,
                };
                await updateTicket(existingTicket._id, updateData);
            } else {
                // Create new ticket
                const fd = new FormData();
                fd.append("title", form.title);
                fd.append("description", form.description);
                fd.append(
                    "raised_by",
                    currentUser?.id || currentUser?._id || "",
                );
                if (form.company_id) fd.append("company_id", form.company_id);
                if (form.department_id)
                    fd.append("department_id", form.department_id);
                if (form.priority_id)
                    fd.append("priority_id", form.priority_id);
                if (form.status_id) fd.append("status_id", form.status_id);
                if (form.location) fd.append("location", form.location);
                if (form.assigned_to)
                    fd.append(
                        "assigned_to",
                        JSON.stringify([form.assigned_to]),
                    );
                if (imageFile) fd.append("image", imageFile);
                await createTicket(fd);
            }
            navigate("/ticket/ticket");
        } catch (err) {
            setError(err.message || "Failed to save ticket");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        {isEdit ? "Edit Ticket" : "Create Ticket"}
                    </h1>
                    <p className="page-subtitle">
                        {isEdit
                            ? "Update ticket information"
                            : "Fill in the details to create a new ticket"}
                    </p>
                </div>
                <button
                    className="btn-secondary"
                    onClick={() => navigate("/ticket/ticket")}>
                    Back to List
                </button>
            </div>

            <div className="create-card">
                {error && (
                    <div className="error-banner" style={{ marginBottom: 20 }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Raised By</label>
                        <input
                            type="text"
                            className="form-control"
                            value={currentUser?.name || ""}
                            readOnly
                            style={{
                                background: "#f7f8fa",
                                cursor: "not-allowed",
                            }}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Company</label>
                            <select
                                className="form-control"
                                value={form.company_id}
                                onChange={(e) =>
                                    set("company_id", e.target.value)
                                }>
                                <option value="">
                                    Select Company (Optional)
                                </option>
                                {companies.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department *</label>
                            <select
                                className="form-control"
                                value={form.department_id}
                                onChange={(e) =>
                                    set("department_id", e.target.value)
                                }
                                required>
                                <option value="">Select Department</option>
                                {departments.map((d) => (
                                    <option key={d._id} value={d._id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.location}
                            onChange={(e) => set("location", e.target.value)}
                            placeholder="e.g., Building A, Room 101"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            placeholder="Brief summary of issue"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            placeholder="Describe the issue in detail..."
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                className="form-control"
                                value={form.priority_id}
                                onChange={(e) =>
                                    set("priority_id", e.target.value)
                                }>
                                <option value="">-- Select Priority --</option>
                                {priorities.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-control"
                                value={form.status_id}
                                onChange={(e) =>
                                    set("status_id", e.target.value)
                                }>
                                <option value="">Select Status</option>
                                {statuses.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Assign To</label>
                        <select
                            className="form-control"
                            value={form.assigned_to}
                            onChange={(e) => set("assigned_to", e.target.value)}>
                            <option value="">Select Worker</option>
                            {users.map((u) => (
                                <option key={u._id} value={u._id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Attachment (Image)</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) =>
                                setImageFile(e.target.files[0] || null)
                            }
                        />
                    </div>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate("/ticket/ticket")}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}>
                            {saving ? "Saving..." : isEdit ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
