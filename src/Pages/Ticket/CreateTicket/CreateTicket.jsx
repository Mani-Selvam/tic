import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "@/Api/TicketApi/ticketAPI";
import { companyAPI, priorityAPI, ticketStatusAPI, userAPI, departmentAPI } from "@/Api/MasterApi/masterAPI";
import "@/Components/MasterDash/master.css";
import "./createticket.css";

const CreateTicket = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        subject: "", description: "", company_id: "", priority_id: "",
        status_id: "", assigned_to: "", department_id: "",
    });
    const [companies, setCompanies] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.allSettled([
            companyAPI.getAll(), priorityAPI.getAll(),
            ticketStatusAPI.getAll(), userAPI.getAll(), departmentAPI.getAll(),
        ]).then(([c, p, s, u, d]) => {
            const unwrap = (r) => r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : (r.value?.data ?? [])) : [];
            setCompanies(unwrap(c)); setPriorities(unwrap(p));
            setStatuses(unwrap(s)); setUsers(unwrap(u)); setDepartments(unwrap(d));
        });
    }, []);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject.trim()) { setError("Subject is required"); return; }
        setSaving(true);
        setError("");
        try {
            await createTicket(form);
            navigate("/ticket/ticket");
        } catch (err) {
            setError(err.message || "Failed to create ticket");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Create Ticket</h1>
                    <p className="page-subtitle">Fill in the details to create a new ticket</p>
                </div>
                <button className="btn-secondary" onClick={() => navigate('/ticket/ticket')}>
                    Back to List
                </button>
            </div>

            <div className="create-card">
                {error && <div className="error-banner" style={{ marginBottom: 20 }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Subject *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={form.subject}
                                onChange={e => set('subject', e.target.value)}
                                placeholder="Enter ticket subject"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Company</label>
                            <select className="form-control" value={form.company_id} onChange={e => set('company_id', e.target.value)}>
                                <option value="">Select Company</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select className="form-control" value={form.priority_id} onChange={e => set('priority_id', e.target.value)}>
                                <option value="">Select Priority</option>
                                {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-control" value={form.status_id} onChange={e => set('status_id', e.target.value)}>
                                <option value="">Select Status</option>
                                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Assign To</label>
                            <select className="form-control" value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)}>
                                <option value="">Select User</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <select className="form-control" value={form.department_id} onChange={e => set('department_id', e.target.value)}>
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            rows={5}
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            placeholder="Describe the issue..."
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/ticket/ticket')}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? "Creating..." : "Create Ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicket;
