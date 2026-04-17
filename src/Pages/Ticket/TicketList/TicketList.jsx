import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    getTickets,
    deleteTicket,
    createTicket,
    updateTicket,
} from "@/Api/TicketApi/ticketAPI";
import {
    companyAPI,
    priorityAPI,
    ticketStatusAPI,
    userAPI,
    departmentAPI,
} from "@/Api/MasterApi/masterAPI";
import { getCurrentUser } from "@/Components/Login/loginAPI";
import "@/Components/MasterDash/master.css";
import "./ticketlist.css";

/* ─────────────────────────────────────────────
   MULTI-SELECT DROPDOWN  (card grid layout)
───────────────────────────────────────────── */
const MultiSelect = ({ options, selected, onChange, placeholder = "Select agents..." }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggle = (id) => {
        onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    };

    const selectedNames = options.filter(o => selected.includes(o._id)).map(o => o.name);

    return (
        <div className="ms-root" ref={ref}>
            <div
                className={`ms-control ${open ? "ms-open" : ""}`}
                onClick={() => setOpen(v => !v)}
            >
                <span className={`ms-value ${!selectedNames.length ? "ms-placeholder" : ""}`}>
                    {selectedNames.length ? selectedNames.join(", ") : placeholder}
                </span>
                <svg
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{
                        flexShrink: 0, color: "#94a3b8",
                        transition: "transform 0.2s",
                        transform: open ? "rotate(180deg)" : "none"
                    }}>
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </div>

            {open && (
                <div className="ms-dropdown">
                    {options.length === 0 && (
                        <div className="ms-empty">No users available</div>
                    )}
                    <div className="ms-grid">
                        {options.map(o => {
                            const isChecked = selected.includes(o._id);
                            return (
                                <div
                                    key={o._id}
                                    className={`ms-card ${isChecked ? "ms-card-selected" : ""}`}
                                    onClick={() => toggle(o._id)}
                                >
                                    <div className="ms-card-check">
                                        <div className={`ms-checkbox ${isChecked ? "ms-checked" : ""}`}>
                                            {isChecked && (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                    <path d="M20 6L9 17l-5-5"/>
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ms-card-avatar">
                                        {(o.name || "?")[0].toUpperCase()}
                                    </div>
                                    <div className="ms-card-name">{o.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   ICON COMPONENTS
───────────────────────────────────────────── */
const ViewIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);
const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);
const ApproveIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 6L9 17l-5-5"/>
    </svg>
);
const DeleteIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
    </svg>
);
const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

/* ─────────────────────────────────────────────
   DEFAULT / RESET VALUES
───────────────────────────────────────────── */
const EMPTY_CREATE = {
    title: "", description: "", company_id: "",
    department_id: "", priority_id: "", status_id: "",
    location: "", assigned_to: "",
};

const EMPTY_APPROVAL = {
    approval_status: "Approved",
    assigned_to: [],
    remarks: "",
    approved_at: "",
};

const nowISO = () => new Date().toISOString().slice(0, 16);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const TicketList = () => {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    /* master data */
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [statuses, setStatuses] = useState([]);

    /* ticket list */
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ priority: "", status: "" });

    /* create form */
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState(EMPTY_CREATE);
    const [imageFile, setImageFile] = useState(null);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    /* approval modal */
    const [approvalTicket, setApprovalTicket] = useState(null);
    const [approvalForm, setApprovalForm] = useState(EMPTY_APPROVAL);
    const [approvalError, setApprovalError] = useState("");
    const [approving, setApproving] = useState(false);

    /* delete confirm */
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    /* ── Load tickets + master data ── */
    const load = useCallback(() => {
        setLoading(true);
        Promise.allSettled([
            getTickets(),
            companyAPI.getAll(),
            priorityAPI.getAll(),
            ticketStatusAPI.getAll(),
            userAPI.getAll(),
            departmentAPI.getAll(),
        ]).then(([t, c, p, s, u, d]) => {
            const unwrap = (r) =>
                r.status === "fulfilled"
                    ? Array.isArray(r.value) ? r.value : (r.value?.data ?? [])
                    : [];
            if (t.status === "rejected")
                setError(t.reason?.message || "Failed to load tickets");
            else setError(null);
            setTickets(unwrap(t));
            setCompanies(unwrap(c));
            setPriorities(unwrap(p));
            setStatuses(unwrap(s));
            setUsers(unwrap(u));
            setDepartments(unwrap(d));
            setLoading(false);
        });
    }, []);

    useEffect(() => { load(); }, [load]);

    /* ── Create form helpers ── */
    const resetCreate = () => {
        setCreateForm({ ...EMPTY_CREATE });
        setImageFile(null);
        setCreateError("");
    };

    const openCreate = () => {
        resetCreate();          /* always fresh when opened */
        setShowCreate(true);
    };

    const closeCreate = () => {
        resetCreate();
        setShowCreate(false);
    };

    const sf = (k, v) => setCreateForm(f => ({ ...f, [k]: v }));

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!createForm.title.trim()) { setCreateError("Title is required"); return; }
        if (!createForm.department_id) { setCreateError("Department is required"); return; }
        setCreating(true);
        setCreateError("");
        try {
            const fd = new FormData();
            fd.append("title", createForm.title);
            fd.append("description", createForm.description);
            fd.append("raised_by", currentUser?.id || currentUser?._id || "");
            if (createForm.company_id) fd.append("company_id", createForm.company_id);
            fd.append("department_id", createForm.department_id);
            if (createForm.priority_id) fd.append("priority_id", createForm.priority_id);
            if (createForm.status_id) fd.append("status_id", createForm.status_id);
            if (createForm.location) fd.append("location", createForm.location);
            if (createForm.assigned_to) fd.append("assigned_to", JSON.stringify([createForm.assigned_to]));
            if (imageFile) fd.append("image", imageFile);
            await createTicket(fd);
            resetCreate();          /* clear fields after success */
            setShowCreate(false);
            load();                 /* refresh ticket list only */
        } catch (err) {
            setCreateError(err.message || "Failed to create ticket");
        } finally {
            setCreating(false);
        }
    };

    /* ── Approval modal helpers ── */
    const openApproval = (ticket) => {
        const existingAssigned = Array.isArray(ticket.assigned_to)
            ? ticket.assigned_to.map(u => u?._id || u).filter(Boolean)
            : [];
        /* fresh form prefilled from ticket data */
        setApprovalForm({
            approval_status: ticket.approval_status || "Approved",
            assigned_to: existingAssigned,
            remarks: ticket.remarks || "",
            approved_at: ticket.approved_at
                ? new Date(ticket.approved_at).toISOString().slice(0, 16)
                : nowISO(),
        });
        setApprovalError("");
        setApprovalTicket(ticket);
    };

    const closeApproval = () => {
        setApprovalTicket(null);
        setApprovalForm({ ...EMPTY_APPROVAL });   /* always reset on close */
        setApprovalError("");
    };

    const af = (k, v) => setApprovalForm(f => ({ ...f, [k]: v }));

    const handleApprovalSave = async () => {
        if (approvalForm.approval_status === "Approved" && approvalForm.assigned_to.length === 0) {
            setApprovalError("Please select at least one user.");
            return;
        }
        setApproving(true);
        setApprovalError("");
        try {
            await updateTicket(approvalTicket._id, {
                approval_status: approvalForm.approval_status,
                assigned_to: approvalForm.assigned_to,
                approver_id: currentUser?.id || currentUser?._id,
                approved_at: approvalForm.approved_at
                    ? new Date(approvalForm.approved_at).toISOString()
                    : null,
                remarks: approvalForm.remarks || null,
            });
            closeApproval();    /* reset form fields */
            load();             /* refresh ticket list only */
        } catch (err) {
            setApprovalError(err.message || "Save failed");
        } finally {
            setApproving(false);
        }
    };

    /* ── Delete ── */
    const handleDelete = async (id) => {
        try {
            await deleteTicket(id);
            setDeleteConfirm(null);
            load();
        } catch (err) {
            alert(err.message || "Delete failed");
        }
    };

    /* ── Filtering ── */
    const filtered = tickets.filter((t) => {
        const s = !search ||
            (t.title || "").toLowerCase().includes(search.toLowerCase()) ||
            (t.ticket_id || "").toLowerCase().includes(search.toLowerCase()) ||
            (t.location || "").toLowerCase().includes(search.toLowerCase());
        const p = !filters.priority ||
            String(t.priority_id?._id || t.priority_id || "") === filters.priority;
        const st = !filters.status ||
            String(t.status_id?._id || t.status_id || "") === filters.status;
        return s && p && st;
    });

    const pBadge = (t) => {
        const v = (t.priority_id?.name || "").toLowerCase();
        if (v === "high" || v === "urgent") return "badge-priority-high";
        if (v === "medium") return "badge-priority-med";
        return "badge-priority-low";
    };

    const approvalStyle = (s) => {
        if (s === "Approved") return { background: "#f0fdf4", color: "#15803d" };
        if (s === "Not Approved") return { background: "#fef2f2", color: "#dc2626" };
        return { background: "#fffbeb", color: "#d97706" };
    };

    /* ═══════════════════════════════════════
       RENDER
    ═══════════════════════════════════════ */
    return (
        <div className="master-page">

            {/* ── PAGE HEADER ── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Ticket List</h1>
                    <p className="page-subtitle">{tickets.length} tickets total</p>
                </div>
                <button
                    className={`btn-primary ${showCreate ? "btn-active" : ""}`}
                    onClick={showCreate ? closeCreate : openCreate}
                >
                    {showCreate ? (
                        <><CloseIcon />Cancel</>
                    ) : (
                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Create Ticket</>
                    )}
                </button>
            </div>

            {/* ── INLINE CREATE FORM ── */}
            {showCreate && (
                <div className="create-panel">
                    <div className="create-panel-hdr">
                        <h3>New Ticket</h3>
                    </div>
                    {createError && (
                        <div className="error-banner" style={{ margin: "12px 24px 0" }}>
                            {createError}
                        </div>
                    )}
                    <form onSubmit={handleCreate} noValidate>
                        <div className="cp-grid">
                            <div className="form-group" style={{ gridColumn: "1/-1" }}>
                                <label className="form-label">Raised By</label>
                                <input
                                    type="text" className="form-control"
                                    value={currentUser?.name || ""}
                                    readOnly
                                    style={{ background: "#f7f8fa", cursor: "not-allowed" }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Company</label>
                                <select className="form-control" value={createForm.company_id} onChange={e => sf("company_id", e.target.value)}>
                                    <option value="">Select Company</option>
                                    {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Department *</label>
                                <select className="form-control" value={createForm.department_id} onChange={e => sf("department_id", e.target.value)} required>
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: "1/-1" }}>
                                <label className="form-label">Location</label>
                                <input type="text" className="form-control" value={createForm.location} onChange={e => sf("location", e.target.value)} placeholder="Building / Room" />
                            </div>
                            <div className="form-group" style={{ gridColumn: "1/-1" }}>
                                <label className="form-label">Title *</label>
                                <input type="text" className="form-control" value={createForm.title} onChange={e => sf("title", e.target.value)} placeholder="Brief summary of the issue" required />
                            </div>
                            <div className="form-group" style={{ gridColumn: "1/-1" }}>
                                <label className="form-label">Description *</label>
                                <textarea className="form-control" rows={3} value={createForm.description} onChange={e => sf("description", e.target.value)} placeholder="Describe the issue..." required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select className="form-control" value={createForm.priority_id} onChange={e => sf("priority_id", e.target.value)}>
                                    <option value="">Select Priority</option>
                                    {priorities.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-control" value={createForm.status_id} onChange={e => sf("status_id", e.target.value)}>
                                    <option value="">Select Status</option>
                                    {statuses.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Assign To</label>
                                <select className="form-control" value={createForm.assigned_to} onChange={e => sf("assigned_to", e.target.value)}>
                                    <option value="">Unassigned</option>
                                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Attachment</label>
                                <input type="file" className="form-control" accept="image/*" onChange={e => setImageFile(e.target.files[0] || null)} />
                            </div>
                        </div>
                        <div className="cp-footer">
                            <button type="button" className="btn-secondary" onClick={closeCreate}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={creating}>
                                {creating ? "Creating..." : "Create Ticket"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── TICKET TABLE ── */}
            <div className="master-card">
                <div className="ticket-toolbar">
                    <input
                        type="text"
                        placeholder="Search by title, ID or location..."
                        className="search-input"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select className="filter-select" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
                        <option value="">All Priorities</option>
                        {priorities.map(p => <option key={p._id} value={String(p._id)}>{p.name}</option>)}
                    </select>
                    <select className="filter-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                        <option value="">All Statuses</option>
                        {statuses.map(s => <option key={s._id} value={String(s._id)}>{s.name}</option>)}
                    </select>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="table-loading">Loading tickets...</div>
                ) : filtered.length === 0 ? (
                    <div className="table-empty">No tickets found.</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>
                                    <th>Title</th>
                                    <th>Department</th>
                                    <th>Company</th>
                                    <th>Location</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Approval</th>
                                    <th>Raised By</th>
                                    <th>Assigned To</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((ticket, i) => (
                                    <tr key={ticket._id || i}>
                                        <td style={{ fontWeight: 700, color: "#6366f1", fontSize: 12 }}>
                                            {ticket.ticket_id || "-"}
                                        </td>
                                        <td>
                                            <div className="ticket-subject">{ticket.title || "-"}</div>
                                            {ticket.description && (
                                                <div className="ticket-desc">
                                                    {String(ticket.description).slice(0, 50)}{ticket.description?.length > 50 ? "…" : ""}
                                                </div>
                                            )}
                                        </td>
                                        <td>{ticket.department_id?.name || "-"}</td>
                                        <td>{ticket.company_id?.name || "-"}</td>
                                        <td style={{ color: "#718096", fontSize: 12 }}>{ticket.location || "-"}</td>
                                        <td>
                                            {ticket.priority_id?.name
                                                ? <span className={`ticket-badge ${pBadge(ticket)}`}>{ticket.priority_id.name}</span>
                                                : <span style={{ color: "#a0aec0", fontSize: 12 }}>—</span>}
                                        </td>
                                        <td>
                                            {ticket.status_id?.name
                                                ? <span className="ticket-badge badge-status">{ticket.status_id.name}</span>
                                                : <span style={{ color: "#a0aec0", fontSize: 12 }}>—</span>}
                                        </td>
                                        <td>
                                            <span className="ticket-badge" style={{ ...approvalStyle(ticket.approval_status), fontSize: 11 }}>
                                                {ticket.approval_status || "Pending"}
                                            </span>
                                        </td>
                                        <td>{ticket.raised_by?.name || "-"}</td>
                                        <td>
                                            {Array.isArray(ticket.assigned_to) && ticket.assigned_to.length > 0
                                                ? ticket.assigned_to.map(u => u?.name).filter(Boolean).join(", ")
                                                : <span style={{ color: "#a0aec0" }}>Unassigned</span>}
                                        </td>
                                        <td style={{ color: "#718096", fontSize: 12, whiteSpace: "nowrap" }}>
                                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "-"}
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                {/* View */}
                                                <button
                                                    className="action-btn view-btn"
                                                    title="View"
                                                    onClick={() => navigate("/ticket/show-ticket", { state: { ticket } })}>
                                                    <ViewIcon />
                                                </button>
                                                {/* Edit */}
                                                <button
                                                    className="action-btn edit-btn"
                                                    title="Edit"
                                                    onClick={() => navigate("/ticket/create-ticket", { state: { ticket, isEdit: true } })}>
                                                    <EditIcon />
                                                </button>
                                                {/* Approve */}
                                                <button
                                                    className="action-btn approve-btn"
                                                    title="Approve / Assign"
                                                    onClick={() => openApproval(ticket)}>
                                                    <ApproveIcon />
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    className="action-btn delete-btn"
                                                    title="Delete"
                                                    onClick={() => setDeleteConfirm(ticket._id)}>
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

            {/* ══════════════════════════════════════
                TICKET APPROVAL MODAL
            ══════════════════════════════════════ */}
            {approvalTicket && (
                <div className="modal-overlay" onClick={closeApproval}>
                    <div className="modal-box approval-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                Ticket Approval —{" "}
                                <span style={{ color: "#6366f1", fontSize: 15 }}>
                                    {approvalTicket.ticket_id || `#${approvalTicket._id?.slice(-6)}`}
                                </span>
                            </h3>
                            <button className="modal-close" onClick={closeApproval}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body">

                            {/* Ticket ID + Approver */}
                            <div className="approval-grid">
                                <div className="form-group">
                                    <label className="form-label">Ticket ID *</label>
                                    <input
                                        type="text" className="form-control"
                                        value={approvalTicket.ticket_id || approvalTicket._id}
                                        readOnly
                                    />
                                    <div className="form-hint">Selected from ticket list</div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Approver * (You)</label>
                                    <input
                                        type="text" className="form-control"
                                        value={currentUser?.name || "Admin User"}
                                        readOnly
                                    />
                                    <div className="form-hint">Auto-set to logged-in user</div>
                                </div>
                            </div>

                            {/* Approval Status toggle */}
                            <div className="form-group">
                                <label className="form-label">Approval Status *</label>
                                <div className="approval-toggle">
                                    <button
                                        type="button"
                                        className={`approval-toggle-btn ${approvalForm.approval_status === "Approved" ? "toggle-approved" : ""}`}
                                        onClick={() => af("approval_status", "Approved")}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M20 6L9 17l-5-5"/>
                                        </svg>
                                        Approved
                                    </button>
                                    <button
                                        type="button"
                                        className={`approval-toggle-btn ${approvalForm.approval_status === "Not Approved" ? "toggle-rejected" : ""}`}
                                        onClick={() => af("approval_status", "Not Approved")}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"/>
                                            <line x1="6" y1="6" x2="18" y2="18"/>
                                        </svg>
                                        Not Approved
                                    </button>
                                </div>
                            </div>

                            {/* Assign To multi-select */}
                            <div className="form-group">
                                <label className="form-label">Assign To (Select Agents)</label>
                                <MultiSelect
                                    options={users}
                                    selected={approvalForm.assigned_to}
                                    onChange={val => af("assigned_to", val)}
                                    placeholder="Select agents..."
                                />
                                {approvalError && (
                                    <div className="form-error">{approvalError}</div>
                                )}
                            </div>

                            {/* Remarks */}
                            <div className="form-group">
                                <label className="form-label">Remarks</label>
                                <textarea
                                    className="form-control" rows={3}
                                    value={approvalForm.remarks}
                                    onChange={e => af("remarks", e.target.value)}
                                    placeholder="Enter approval notes..."
                                />
                            </div>

                            {/* Approved At */}
                            <div className="form-group">
                                <label className="form-label">Approved At</label>
                                <input
                                    type="datetime-local" className="form-control"
                                    value={approvalForm.approved_at}
                                    onChange={e => af("approved_at", e.target.value)}
                                />
                            </div>

                            {/* Save */}
                            <button
                                className="btn-primary"
                                style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: 4 }}
                                onClick={handleApprovalSave}
                                disabled={approving}>
                                {approving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE CONFIRM ── */}
            {deleteConfirm !== null && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Confirm Delete</h3>
                            <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: "#64748b", marginBottom: 24 }}>
                                Are you sure you want to delete this ticket? This cannot be undone.
                            </p>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketList;
