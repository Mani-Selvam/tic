import React, { useEffect, useState } from "react";
import "./master.css";

const PlusIcon = () => (
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
);
const ViewIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const EditIcon = () => (
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
);
const DeleteIcon = () => (
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
);

const Modal = ({ title, onClose, children }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h3 className="modal-title">{title}</h3>
                <button className="modal-close" onClick={onClose}>
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
            <div className="modal-body">{children}</div>
        </div>
    </div>
);

const MasterPage = ({
    title,
    api,
    columns,
    formFields,
    rowKey = "_id",
    searchKey = "name",
}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});
    const [files, setFiles] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [viewRecord, setViewRecord] = useState(null);

    const load = () => {
        setLoading(true);
        setError(null);
        api.getAll()
            .then((res) => {
                const arr = Array.isArray(res) ? res : (res?.data ?? []);
                setData(arr);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const hasFileFields = formFields.some((f) => f.type === "file");

    const openAdd = () => {
        const defaults = {};
        formFields.forEach((f) => {
            if (f.type === "file") return;
            defaults[f.name] = f.default ?? "";
        });
        setForm(defaults);
        setFiles({});
        setModal("add");
    };

    const openEdit = (row) => {
        const vals = {};
        formFields.forEach((f) => {
            if (f.type === "file") return;
            vals[f.name] = row[f.name] ?? "";
        });
        setForm({ ...vals, _id: row[rowKey] });
        setFiles({});
        setModal("edit");
    };

    const openView = (row) => {
        setViewRecord(row);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { _id, ...payload } = form;
            let submitData;
            if (hasFileFields) {
                const fd = new FormData();
                Object.entries(payload).forEach(([k, v]) => {
                    if (v !== "" && v != null) fd.append(k, v);
                });
                Object.entries(files).forEach(([k, v]) => {
                    if (v) fd.append(k, v);
                });
                submitData = fd;
            } else {
                submitData = payload;
            }
            if (modal === "add") {
                await api.create(submitData);
            } else {
                await api.update(_id, submitData);
            }
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
            await api.delete(id);
            setDeleteConfirm(null);
            load();
        } catch (err) {
            alert(err.message || "Delete failed");
        }
    };

    const filtered = data.filter((row) => {
        if (!search) return true;
        const val = row[searchKey] ?? "";
        return String(val).toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle">{data.length} records total</p>
                </div>
                <button className="btn-primary" onClick={openAdd}>
                    <PlusIcon /> Add {title.split(" ")[0]}
                </button>
            </div>

            <div className="master-card">
                <div className="card-toolbar">
                    <input
                        type="text"
                        placeholder={`Search ${title.toLowerCase()}...`}
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="table-loading">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="table-empty">
                        No {title.toLowerCase()} found.
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    {columns.map((col) => (
                                        <th key={col.key}>{col.label}</th>
                                    ))}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((row, i) => (
                                    <tr key={row[rowKey] || i}>
                                        <td>{i + 1}</td>
                                        {columns.map((col) => (
                                            <td key={col.key}>
                                                {col.render
                                                    ? col.render(row)
                                                    : (row[col.key] ?? "-")}
                                            </td>
                                        ))}
                                        <td>
                                            <div className="action-btns">
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={() =>
                                                        openView(row)
                                                    }
                                                    title="View">
                                                    <ViewIcon />
                                                </button>
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={() =>
                                                        openEdit(row)
                                                    }
                                                    title="Edit">
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() =>
                                                        setDeleteConfirm(
                                                            row[rowKey],
                                                        )
                                                    }
                                                    title="Delete">
                                                    <DeleteIcon />
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
                <Modal
                    title={
                        modal === "add"
                            ? `Add New ${title.replace(" Master", "").replace(" Directory", "")}`
                            : `Edit ${title.replace(" Master", "").replace(" Directory", "")}`
                    }
                    onClose={() => setModal(null)}>
                    {formFields.map((f) => (
                        <div key={f.name} className="form-group">
                            <label className="form-label">{f.label}</label>
                            {f.type === "select" ? (
                                <select
                                    className="form-control"
                                    value={form[f.name] ?? ""}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            [f.name]: e.target.value,
                                        }))
                                    }>
                                    <option value="">Select {f.label}</option>
                                    {f.options?.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : f.type === "textarea" ? (
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={form[f.name] ?? ""}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            [f.name]: e.target.value,
                                        }))
                                    }
                                    placeholder={f.placeholder || f.label}
                                />
                            ) : f.type === "color" ? (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                    }}>
                                    <input
                                        type="color"
                                        style={{
                                            width: 44,
                                            height: 36,
                                            padding: 2,
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 6,
                                            cursor: "pointer",
                                        }}
                                        value={form[f.name] || "#000000"}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                [f.name]: e.target.value,
                                            }))
                                        }
                                    />
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ flex: 1 }}
                                        value={form[f.name] || "#000000"}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                [f.name]: e.target.value,
                                            }))
                                        }
                                        placeholder="#000000"
                                    />
                                </div>
                            ) : f.type === "file" ? (
                                <input
                                    type="file"
                                    className="form-control"
                                    accept={f.accept || "image/*"}
                                    onChange={(e) =>
                                        setFiles((prev) => ({
                                            ...prev,
                                            [f.name]: e.target.files[0] || null,
                                        }))
                                    }
                                />
                            ) : (
                                <input
                                    type={f.type || "text"}
                                    className="form-control"
                                    value={form[f.name] ?? ""}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            [f.name]: e.target.value,
                                        }))
                                    }
                                    placeholder={f.placeholder || f.label}
                                />
                            )}
                        </div>
                    ))}
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
                </Modal>
            )}

            {viewRecord && (
                <Modal
                    title={`${title.replace(" Master", "").replace(" Directory", "")} Details`}
                    onClose={() => setViewRecord(null)}>
                    <div className="show-grid">
                        {formFields
                            .filter((f) => f.type !== "file")
                            .map((f) => {
                                let value = viewRecord[f.name];
                                if (f.type === "select" && f.options) {
                                    const option = f.options.find(
                                        (opt) => opt.value === value,
                                    );
                                    value = option ? option.label : value;
                                }
                                if (f.type === "color") {
                                    value = (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 4,
                                                    background: value || "#000",
                                                    border: "1px solid #e2e8f0",
                                                }}
                                            />
                                            {value || "#000000"}
                                        </div>
                                    );
                                }
                                return (
                                    <div key={f.name} className="show-field">
                                        <span className="show-label">
                                            {f.label}
                                        </span>
                                        <span className="show-value">
                                            {value || "-"}
                                        </span>
                                    </div>
                                );
                            })}
                        {viewRecord.createdAt && (
                            <div className="show-field">
                                <span className="show-label">Created</span>
                                <span className="show-value">
                                    {new Date(
                                        viewRecord.createdAt,
                                    ).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {viewRecord.updatedAt && (
                            <div className="show-field">
                                <span className="show-label">Updated</span>
                                <span className="show-value">
                                    {new Date(
                                        viewRecord.updatedAt,
                                    ).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {deleteConfirm != null && (
                <Modal
                    title="Confirm Delete"
                    onClose={() => setDeleteConfirm(null)}>
                    <p style={{ marginBottom: 24, color: "#4a5568" }}>
                        Are you sure you want to delete this record? This action
                        cannot be undone.
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
                </Modal>
            )}
        </div>
    );
};

export default MasterPage;
