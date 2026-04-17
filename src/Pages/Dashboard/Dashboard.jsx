import React, { useEffect, useState, useMemo } from "react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { getTickets } from "@/Api/TicketApi/ticketAPI";
import { userAPI, ticketStatusAPI, priorityAPI } from "@/Api/MasterApi/masterAPI";
import { useAuth } from "@/Components/Login/AuthContext";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316","#84cc16"];

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
};

const Avatar = ({ name, size = 34 }) => {
    const colors = ["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#14b8a6"];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return (
        <div style={{
            width: size, height: size, borderRadius: "9px",
            background: colors[idx], color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
        }}>
            {(name || "?")[0].toUpperCase()}
        </div>
    );
};

const StatCard = ({ val, label, icon, cls, trend }) => (
    <div className={`dash-stat ${cls}`}>
        <div className="ds-left">
            <div className="ds-val">{val}</div>
            <div className="ds-lbl">{label}</div>
            {trend && <div className="ds-trend">{trend}</div>}
        </div>
        <div className="ds-icon">{icon}</div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "white", padding: "10px 14px", borderRadius: 10,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: "1px solid #f1f5f9",
            fontSize: 13
        }}>
            <div style={{ color: "#64748b", marginBottom: 4, fontWeight: 600 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontWeight: 700 }}>
                    {p.name}: {p.value}
                </div>
            ))}
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            getTickets(), userAPI.getAll(), ticketStatusAPI.getAll(), priorityAPI.getAll()
        ]).then(([tr, ur, sr, pr]) => {
            const unwrap = r => r.status === "fulfilled"
                ? (Array.isArray(r.value) ? r.value : (r.value?.data ?? []))
                : [];
            setTickets(unwrap(tr));
            setUsers(unwrap(ur));
            setStatuses(unwrap(sr));
            setPriorities(unwrap(pr));
            setLoading(false);
        });
    }, []);

    const statusData = useMemo(() => statuses.map((s, i) => ({
        ...s,
        count: tickets.filter(t => String(t.status_id?._id || t.status_id) === String(s._id)).length,
        color: COLORS[i % COLORS.length],
    })), [tickets, statuses]);

    const priorityData = useMemo(() => priorities.map((p, i) => ({
        name: p.name,
        count: tickets.filter(t => String(t.priority_id?._id || t.priority_id) === String(p._id)).length,
        fill: COLORS[i % COLORS.length],
    })).filter(p => p.count > 0), [tickets, priorities]);

    const trendData = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString("en", { weekday: "short" });
            const dateStr = d.toISOString().split("T")[0];
            const count = tickets.filter(t => {
                const td = t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : null;
                return td === dateStr;
            }).length;
            days.push({ day: label, Tickets: count });
        }
        return days;
    }, [tickets]);

    const totalTickets = tickets.length;
    const totalUsers = users.length;
    const closedTickets = tickets.filter(t => {
        const n = (t.status_id?.name || "").toLowerCase();
        return n === "closed" || n === "resolved" || n === "done";
    }).length;
    const activeTickets = totalTickets - closedTickets;

    const recentTickets = [...tickets].slice(0, 5);
    const recentUsers = [...users].slice(0, 6);
    const totalStatusCount = statusData.reduce((a, s) => a + s.count, 0);

    const priorityColors = { high: "#ef4444", urgent: "#dc2626", medium: "#f59e0b", low: "#22c55e" };
    const getPBg = (name) => {
        const n = (name || "").toLowerCase();
        if (n.includes("high") || n.includes("urgent")) return "#fef2f2";
        if (n.includes("med")) return "#fffbeb";
        return "#f0fdf4";
    };
    const getPColor = (name) => {
        const n = (name || "").toLowerCase();
        if (n.includes("high") || n.includes("urgent")) return "#dc2626";
        if (n.includes("med")) return "#d97706";
        return "#16a34a";
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-greeting">
                <div>
                    <h1 className="dash-title">{greeting()}, {user?.name || "Admin"} 👋</h1>
                    <p className="dash-sub">Here's your ticket system overview for today</p>
                </div>
                <button className="btn-primary" onClick={() => navigate("/ticket/ticket")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Create Ticket
                </button>
            </div>

            <div className="dash-stats">
                <StatCard
                    val={totalTickets}
                    label="Total Tickets"
                    cls="dash-stat-1"
                    trend="All time"
                    icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/></svg>}
                />
                <StatCard
                    val={activeTickets}
                    label="Active Tickets"
                    cls="dash-stat-2"
                    trend="In progress"
                    icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                />
                <StatCard
                    val={closedTickets}
                    label="Closed Tickets"
                    cls="dash-stat-3"
                    trend="Resolved"
                    icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
                />
                <StatCard
                    val={totalUsers}
                    label="Team Members"
                    cls="dash-stat-4"
                    trend="Registered"
                    icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                />
            </div>

            <div className="dash-charts">
                <div className="dash-card">
                    <div className="dash-card-hdr">
                        <div>
                            <div className="dash-card-title">Ticket Activity</div>
                            <div className="dash-card-sub">Tickets created — last 7 days</div>
                        </div>
                    </div>
                    <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="Tickets" stroke="#6366f1" strokeWidth={2.5} fill="url(#ticketGrad)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-hdr">
                        <div>
                            <div className="dash-card-title">Status Overview</div>
                            <div className="dash-card-sub">{totalTickets} total tickets</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
                        <PieChart width={180} height={180}>
                            <Pie
                                data={statusData.filter(s => s.count > 0)}
                                cx={90} cy={90}
                                innerRadius={52} outerRadius={80}
                                paddingAngle={3}
                                dataKey="count"
                            >
                                {statusData.filter(s => s.count > 0).map((s, i) => (
                                    <Cell key={i} fill={s.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v, n) => [v + " tickets", n]} />
                        </PieChart>
                    </div>
                    <div className="chart-legend">
                        {statusData.filter(s => s.count > 0).map(s => (
                            <div key={s._id} className="legend-row">
                                <span className="legend-dot" style={{ background: s.color }} />
                                <span className="legend-name">{s.name}</span>
                                <span className="legend-cnt">{s.count}</span>
                                <span className="legend-pct">{totalStatusCount ? Math.round(s.count / totalStatusCount * 100) : 0}%</span>
                            </div>
                        ))}
                        {statusData.every(s => s.count === 0) && (
                            <div style={{ textAlign: "center", color: "#94a3b8", padding: "12px 0" }}>No ticket data</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="dash-chart-grid-2">
                <div className="dash-card">
                    <div className="dash-card-hdr">
                        <div>
                            <div className="dash-card-title">Priority Breakdown</div>
                            <div className="dash-card-sub">Tickets by priority level</div>
                        </div>
                    </div>
                    {priorityData.length > 0 ? (
                        <div className="chart-wrap">
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={priorityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barSize={36} barCategoryGap="30%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Tickets" radius={[6,6,0,0]}>
                                        {priorityData.map((p, i) => <Cell key={i} fill={p.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="dash-loading">No priority data yet</div>
                    )}
                </div>

                <div className="dash-card">
                    <div className="dash-card-hdr">
                        <div>
                            <div className="dash-card-title">Status Tiles</div>
                            <div className="dash-card-sub">Ticket count per status</div>
                        </div>
                    </div>
                    <div className="status-grid">
                        {statusData.slice(0, 6).map((s, i) => (
                            <div key={s._id} className="status-tile">
                                <div className="st-info">
                                    <div className="st-name">{s.name}</div>
                                    <div className="st-count-num">{s.count}</div>
                                </div>
                                <div className="st-dot" style={{ background: s.color }} />
                            </div>
                        ))}
                        {statusData.length === 0 && (
                            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#94a3b8", padding: 24, fontSize: 14 }}>No statuses configured</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="dash-team">
                <div className="dash-card-hdr">
                    <div>
                        <div className="dash-card-title">Recent Tickets</div>
                        <div className="dash-card-sub">Latest created tickets</div>
                    </div>
                    <button className="btn-link" onClick={() => navigate("/ticket/ticket")}>View all ({totalTickets})</button>
                </div>
                {recentTickets.length === 0 ? (
                    <div className="dash-loading">No tickets yet. <button className="btn-link" onClick={() => navigate("/ticket/ticket")}>Create one</button></div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: "11px 16px", background: "#f8fafc", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#94a3b8", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>ID</th>
                                    <th style={{ padding: "11px 16px", background: "#f8fafc", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#94a3b8", borderBottom: "1px solid #f1f5f9" }}>Title</th>
                                    <th style={{ padding: "11px 16px", background: "#f8fafc", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#94a3b8", borderBottom: "1px solid #f1f5f9" }}>Status</th>
                                    <th style={{ padding: "11px 16px", background: "#f8fafc", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#94a3b8", borderBottom: "1px solid #f1f5f9" }}>Priority</th>
                                    <th style={{ padding: "11px 16px", background: "#f8fafc", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#94a3b8", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTickets.map((t, i) => (
                                    <tr key={t._id || i} style={{ cursor: "pointer", transition: "background 0.15s" }}
                                        onClick={() => navigate("/ticket/show-ticket", { state: { ticket: t } })}
                                        onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                                        onMouseLeave={e => e.currentTarget.style.background = ""}>
                                        <td style={{ padding: "13px 16px", fontWeight: 700, color: "#6366f1", fontSize: 12, borderBottom: "1px solid #f8fafc" }}>
                                            {t.ticket_id || `#${i+1}`}
                                        </td>
                                        <td style={{ padding: "13px 16px", color: "#1e293b", fontWeight: 500, borderBottom: "1px solid #f8fafc", maxWidth: 240 }}>
                                            <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title || "-"}</div>
                                        </td>
                                        <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc" }}>
                                            {t.status_id?.name ? (
                                                <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#eff6ff", color: "#2563eb" }}>
                                                    {t.status_id.name}
                                                </span>
                                            ) : <span style={{ color: "#94a3b8" }}>—</span>}
                                        </td>
                                        <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc" }}>
                                            {t.priority_id?.name ? (
                                                <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: getPBg(t.priority_id.name), color: getPColor(t.priority_id.name) }}>
                                                    {t.priority_id.name}
                                                </span>
                                            ) : <span style={{ color: "#94a3b8" }}>—</span>}
                                        </td>
                                        <td style={{ padding: "13px 16px", color: "#64748b", fontSize: 12, borderBottom: "1px solid #f8fafc", whiteSpace: "nowrap" }}>
                                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={{ height: 20 }} />

            <div className="dash-team">
                <div className="dash-card-hdr">
                    <div>
                        <div className="dash-card-title">Team Members</div>
                        <div className="dash-card-sub">{totalUsers} registered users</div>
                    </div>
                    <button className="btn-link" onClick={() => navigate("/master/user")}>Manage users</button>
                </div>
                {recentUsers.length === 0 ? (
                    <div className="dash-loading">No users found</div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                            <thead>
                                <tr>
                                    {["#","Photo","Name","Email","Designation","Mobile","Status"].map(h => (
                                        <th key={h} style={{ padding: "11px 16px", background: "#f8fafc", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#94a3b8", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map((u, i) => (
                                    <tr key={u._id} style={{ transition: "background 0.15s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                                        onMouseLeave={e => e.currentTarget.style.background = ""}>
                                        <td style={{ padding: "13px 16px", color: "#94a3b8", fontSize: 12, borderBottom: "1px solid #f8fafc" }}>{String(i+1).padStart(2,"0")}</td>
                                        <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc" }}><Avatar name={u.name} /></td>
                                        <td style={{ padding: "13px 16px", fontWeight: 600, color: "#1e293b", borderBottom: "1px solid #f8fafc" }}>{u.name}</td>
                                        <td style={{ padding: "13px 16px", color: "#64748b", fontSize: 13, borderBottom: "1px solid #f8fafc" }}>{u.email}</td>
                                        <td style={{ padding: "13px 16px", color: "#374151", borderBottom: "1px solid #f8fafc" }}>{u.designationId?.name || "-"}</td>
                                        <td style={{ padding: "13px 16px", color: "#374151", borderBottom: "1px solid #f8fafc" }}>{u.mobile || "-"}</td>
                                        <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc" }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: u.status === "Active" ? "#f0fdf4" : "#f8fafc", color: u.status === "Active" ? "#15803d" : "#64748b" }}>
                                                {u.status || "Active"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
