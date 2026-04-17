import React, { useEffect, useState } from "react";
import { userAPI, companyAPI, designationAPI } from "@/Api/MasterApi/masterAPI";
import "@/Components/MasterDash/master.css";

const USERS_URL = "/api/users";

const StatusBadge = ({ s }) => (
    <span
        className={`badge ${s === "Active" ? "badge-active" : "badge-inactive"}`}>
        {s || "Active"}
    </span>
);

const Avatar = ({ name }) => {
    const bg = [
        "#667eea",
        "#48bb78",
        "#ed8936",
        "#e53e3e",
        "#9f7aea",
        "#38b2ac",
    ];
    const idx = name ? name.charCodeAt(0) % bg.length : 0;
    return (
        <div
            style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: bg[idx],
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
            }}>
            {(name || "?")[0].toUpperCase()}
        </div>
    );
};

const EMPTY = {
    name: "",
    email: "",
    mobile: "",
    password: "",
    status: "Active",
    companyId: "",
    designationId: "",
};

const UserMaster = () => {
    const [data, setData] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [error, setError] = useState(null);
    const [viewRecord, setViewRecord] = useState(null);

    const load = () => {
        setLoading(true);
        setError(null);
        Promise.allSettled([
            userAPI.getAll(),
            companyAPI.getAll(),
            designationAPI.getAll(),
        ]).then(([u, c, d]) => {
            if (u.status === "fulfilled")
                setData(
                    Array.isArray(u.value) ? u.value : (u.value?.data ?? []),
                );
            else setError(u.reason?.message);
            setCompanies(
                c.status === "fulfilled"
                    ? Array.isArray(c.value)
                        ? c.value
                        : []
                    : [],
            );
            setDesignations(
                d.status === "fulfilled"
                    ? Array.isArray(d.value)
                        ? d.value
                        : []
                    : [],
            );
            setLoading(false);
        });
    };

    useEffect(() => {
        load();
    }, []);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const openAdd = () => {
        setForm(EMPTY);
        setModal("add");
    };
    const openEdit = (row) => {
        setForm({
            _id: row._id,
            name: row.name || "",
            email: row.email || "",
            mobile: row.mobile || "",
            password: "",
            status: row.status || "Active",
            companyId: row.companyId?._id || row.companyId || "",
            designationId: row.designationId?._id || row.designationId || "",
        });
        setModal("edit");
    };
    const openView = (row) => {
        setViewRecord(row);
    };

    const handleSave = async () => {
        if (!form.name?.trim() || !form.email?.trim() || !form.mobile?.trim()) {
            alert("Name, email and mobile are required.");
            return;
        }
        if (modal === "add" && !form.password?.trim()) {
            alert("Password is required for new users.");
            return;
        }
        setSaving(true);
        try {
            const { _id, ...payload } = form;
            if (!payload.password) delete payload.password;
            if (!payload.companyId) delete payload.companyId;
            if (!payload.designationId) delete payload.designationId;
            if (modal === "add") await userAPI.create(payload);
            else await userAPI.update(_id, payload);
            setModal(null);
            load();
        } catch (err) {
            alert(err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await userAPI.delete(id);
            setDeleteConfirm(null);
            load();
        } catch (err) {
            alert(err.message || "Delete failed");
        }
    };

    const filtered = data.filter(
        (r) =>
            !search ||
            r.name?.toLowerCase().includes(search.toLowerCase()) ||
            r.email?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Master</h1>
                    <p className="page-subtitle">{data.length} records total</p>
                </div>
                <button className="btn-primary" onClick={openAdd}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add User
                </button>
            </div>

            <div className="master-card">
                <div className="card-toolbar">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {error && <div className="error-banner">{error}</div>}
                {loading ? (
                    <div className="table-loading">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="table-empty">No users found.</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Photo</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Company</th>
                                    <th>Designation</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((row, i) => (
                                    <tr key={row._id}>
                                        <td>{i + 1}</td>
                                        <td>
                                            <Avatar name={row.name} />
                                        </td>
                                        <td style={{ fontWeight: 600 }}>
                                            {row.name}
                                        </td>
                                        <td style={{ color: "#718096" }}>
                                            {row.email}
                                        </td>
                                        <td>{row.mobile || "-"}</td>
                                        <td>{row.companyId?.name || "-"}</td>
                                        <td>
                                            {row.designationId?.name || "-"}
                                        </td>
                                        <td>
                                            <StatusBadge s={row.status} />
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={() =>
                                                        openView(row)
                                                    }
                                                    title="View">
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="3"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={() =>
                                                        openEdit(row)
                                                    }
                                                    title="Edit">
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() =>
                                                        setDeleteConfirm(
                                                            row._id,
                                                        )
                                                    }
                                                    title="Delete">
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                        <path d="M10 11v6M14 11v6" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modal && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div
                        className="modal-box"
                        style={{ maxWidth: 520 }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {modal === "add" ? "Add New User" : "Edit User"}
                            </h3>
                            <button
                                className="modal-close"
                                onClick={() => setModal(null)}>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "0 16px",
                                }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.name}
                                        onChange={(e) =>
                                            set("name", e.target.value)
                                        }
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Mobile *
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        value={form.mobile}
                                        onChange={(e) =>
                                            set("mobile", e.target.value)
                                        }
                                        placeholder="Mobile number"
                                    />
                                </div>
                                <div
                                    className="form-group"
                                    style={{ gridColumn: "1/-1" }}>
                                    <label className="form-label">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={form.email}
                                        onChange={(e) =>
                                            set("email", e.target.value)
                                        }
                                        placeholder="Email address"
                                    />
                                </div>
                                <div
                                    className="form-group"
                                    style={{ gridColumn: "1/-1" }}>
                                    <label className="form-label">
                                        Password{" "}
                                        {modal === "edit" && (
                                            <span
                                                style={{
                                                    color: "#718096",
                                                    fontWeight: 400,
                                                }}>
                                                (leave blank to keep)
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={form.password}
                                        onChange={(e) =>
                                            set("password", e.target.value)
                                        }
                                        placeholder={
                                            modal === "add"
                                                ? "Required"
                                                : "New password (optional)"
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Company
                                    </label>
                                    <select
                                        className="form-control"
                                        value={form.companyId}
                                        onChange={(e) =>
                                            set("companyId", e.target.value)
                                        }>
                                        <option value="">Select Company</option>
                                        {companies.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Designation
                                    </label>
                                    <select
                                        className="form-control"
                                        value={form.designationId}
                                        onChange={(e) =>
                                            set("designationId", e.target.value)
                                        }>
                                        <option value="">
                                            Select Designation
                                        </option>
                                        {designations.map((d) => (
                                            <option key={d._id} value={d._id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-control"
                                        value={form.status}
                                        onChange={(e) =>
                                            set("status", e.target.value)
                                        }>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setModal(null)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleSave}
                                    disabled={saving}>
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewRecord && (
                <div
                    className="modal-overlay"
                    onClick={() => setViewRecord(null)}>
                    <div
                        className="modal-box"
                        style={{ maxWidth: 520 }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">User Details</h3>
                            <button
                                className="modal-close"
                                onClick={() => setViewRecord(null)}>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="show-grid">
                                <div className="show-field">
                                    <span className="show-label">
                                        Full Name
                                    </span>
                                    <span className="show-value">
                                        {viewRecord.name || "-"}
                                    </span>
                                </div>
                                <div className="show-field">
                                    <span className="show-label">Email</span>
                                    <span className="show-value">
                                        {viewRecord.email || "-"}
                                    </span>
                                </div>
                                <div className="show-field">
                                    <span className="show-label">Mobile</span>
                                    <span className="show-value">
                                        {viewRecord.mobile || "-"}
                                    </span>
                                </div>
                                <div className="show-field">
                                    <span className="show-label">Company</span>
                                    <span className="show-value">
                                        {viewRecord.companyId?.name || "-"}
                                    </span>
                                </div>
                                <div className="show-field">
                                    <span className="show-label">
                                        Designation
                                    </span>
                                    <span className="show-value">
                                        {viewRecord.designationId?.name || "-"}
                                    </span>
                                </div>
                                <div className="show-field">
                                    <span className="show-label">Status</span>
                                    <span className="show-value">
                                        <StatusBadge s={viewRecord.status} />
                                    </span>
                                </div>
                                {viewRecord.createdAt && (
                                    <div className="show-field">
                                        <span className="show-label">
                                            Created
                                        </span>
                                        <span className="show-value">
                                            {new Date(
                                                viewRecord.createdAt,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {viewRecord.updatedAt && (
                                    <div className="show-field">
                                        <span className="show-label">
                                            Updated
                                        </span>
                                        <span className="show-value">
                                            {new Date(
                                                viewRecord.updatedAt,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div
                    className="modal-overlay"
                    onClick={() => setDeleteConfirm(null)}>
                    <div
                        className="modal-box"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Confirm Delete</h3>
                            <button
                                className="modal-close"
                                onClick={() => setDeleteConfirm(null)}>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: "#4a5568", marginBottom: 24 }}>
                                Are you sure you want to delete this user?
                            </p>
                            <div className="modal-footer">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setDeleteConfirm(null)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={() => handleDelete(deleteConfirm)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMaster;
