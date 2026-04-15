import React, { useEffect, useState, useMemo } from "react";
import { getTickets } from "@/Api/TicketApi/ticketAPI";
import { userAPI, ticketStatusAPI } from "@/Api/MasterApi/masterAPI";
import { useAuth } from "@/Components/Login/AuthContext";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const STATUS_PALETTE = ["#f6ad55","#48bb78","#4299e1","#9f7aea","#fc8181","#38b2ac","#ed8936","#e53e3e","#667eea","#f687b3"];

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
};

const Avatar = ({ name, size = 32 }) => {
    const bg = ["#667eea","#48bb78","#ed8936","#e53e3e","#9f7aea","#38b2ac","#f6ad55","#fc8181"];
    const idx = name ? name.charCodeAt(0) % bg.length : 0;
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: bg[idx], color: "white",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:700, fontSize: size * 0.38, flexShrink:0,
        }}>
            {(name || "?")[0].toUpperCase()}
        </div>
    );
};

const DonutChart = ({ segments, total }) => {
    const cx = 70, cy = 70, r = 55, ir = 35;
    let angle = -90;
    const paths = segments.filter(s => s.count > 0).map(s => {
        const pct = s.count / (total || 1);
        const startA = angle;
        angle += pct * 360;
        const endA = angle;
        const toRad = a => a * Math.PI / 180;
        const x1 = cx + r * Math.cos(toRad(startA)), y1 = cy + r * Math.sin(toRad(startA));
        const x2 = cx + r * Math.cos(toRad(endA)), y2 = cy + r * Math.sin(toRad(endA));
        const ix1 = cx + ir * Math.cos(toRad(endA)), iy1 = cy + ir * Math.sin(toRad(endA));
        const ix2 = cx + ir * Math.cos(toRad(startA)), iy2 = cy + ir * Math.sin(toRad(startA));
        const largeArc = pct > 0.5 ? 1 : 0;
        const d = `M${x1} ${y1} A${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L${ix1} ${iy1} A${ir} ${ir} 0 ${largeArc} 0 ${ix2} ${iy2}Z`;
        return { ...s, d };
    });
    return (
        <svg width="140" height="140" viewBox="0 0 140 140">
            {paths.length === 0
                ? <circle cx={cx} cy={cy} r={r} fill="#e2e8f0" />
                : paths.map((p, i) => <path key={i} d={p.d} fill={p.color} />)
            }
            <circle cx={cx} cy={cy} r={ir} fill="white" />
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="#2d3748">{total}</text>
            <text x={cx} y={cy + 13} textAnchor="middle" fontSize="10" fill="#718096">Total</text>
        </svg>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([getTickets(), userAPI.getAll(), ticketStatusAPI.getAll()])
            .then(([tr, ur, sr]) => {
                const unwrap = r => r.status === "fulfilled" ? (Array.isArray(r.value) ? r.value : (r.value?.data ?? [])) : [];
                setTickets(unwrap(tr));
                setUsers(unwrap(ur));
                setStatuses(unwrap(sr));
                setLoading(false);
            });
    }, []);

    const statusCounts = useMemo(() => {
        return statuses.map((s, i) => ({
            ...s,
            count: tickets.filter(t => String(t.status_id?._id || t.status_id) === String(s._id)).length,
            color: STATUS_PALETTE[i % STATUS_PALETTE.length],
        }));
    }, [tickets, statuses]);

    const totalTickets = tickets.length;
    const totalUsers = users.length;
    const activeTickets = tickets.filter(t => {
        const n = (t.status_id?.name || "").toLowerCase();
        return n !== "closed" && n !== "rejected" && n !== "done" && n !== "resolved";
    }).length;

    const recentUsers = [...users].slice(0, 6);

    return (
        <div className="dash-page">
            <div className="dash-greeting">
                <div>
                    <h1 className="dash-title">{greeting()}, {user?.name || "Admin"}</h1>
                    <p className="dash-sub">Here's what's happening today</p>
                </div>
                <button className="btn-primary" onClick={() => navigate("/ticket/ticket")}>
                    View All Tickets
                </button>
            </div>

            <div className="dash-stats">
                <div className="dash-stat dash-stat-1">
                    <div className="ds-left">
                        <div className="ds-val">{loading ? "—" : totalTickets}</div>
                        <div className="ds-lbl">Total Tickets</div>
                    </div>
                    <div className="ds-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/></svg>
                    </div>
                </div>
                <div className="dash-stat dash-stat-2">
                    <div className="ds-left">
                        <div className="ds-val">{loading ? "—" : totalUsers}</div>
                        <div className="ds-lbl">Total Users</div>
                    </div>
                    <div className="ds-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                </div>
                <div className="dash-stat dash-stat-3">
                    <div className="ds-left">
                        <div className="ds-val">{loading ? "—" : activeTickets}</div>
                        <div className="ds-lbl">Active Tickets</div>
                    </div>
                    <div className="ds-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                </div>
            </div>

            <div className="dash-mid">
                <div className="dash-statuses">
                    <div className="dash-card-hdr">
                        <h2 className="dash-card-title">Ticket Statuses</h2>
                    </div>
                    {loading ? (
                        <div className="dash-loading">Loading…</div>
                    ) : statuses.length === 0 ? (
                        <div className="dash-loading">No statuses configured.</div>
                    ) : (
                        <div className="status-grid">
                            {statusCounts.map(s => (
                                <div key={s._id} className="status-tile" style={{ borderBottomColor: s.color }}>
                                    <div className="st-name">{s.name}</div>
                                    <div className="st-count" style={{ background: s.color }}>
                                        {s.count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dash-chart-box">
                    <div className="dash-card-hdr">
                        <h2 className="dash-card-title">Ticket Status Overview</h2>
                    </div>
                    <div className="chart-inner">
                        <DonutChart segments={statusCounts} total={totalTickets} />
                        <div className="chart-legend">
                            {statusCounts.map(s => (
                                <div key={s._id} className="legend-row">
                                    <span className="legend-dot" style={{ background: s.color }} />
                                    <span className="legend-name">{s.name}</span>
                                    <span className="legend-cnt">{s.count} Tickets</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="dash-team">
                <div className="dash-card-hdr">
                    <h2 className="dash-card-title">Users / Team Members</h2>
                    <button className="btn-link" onClick={() => navigate("/master/user")}>
                        View more ({totalUsers})
                    </button>
                </div>
                {loading ? (
                    <div className="dash-loading">Loading…</div>
                ) : recentUsers.length === 0 ? (
                    <div className="dash-loading">No users found.</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Photo</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Designation</th>
                                    <th>Mobile</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map((u, i) => (
                                    <tr key={u._id}>
                                        <td style={{ color: "#718096" }}>{String(i + 1).padStart(2, "0")}</td>
                                        <td><Avatar name={u.name} size={34} /></td>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td style={{ color: "#718096" }}>{u.email}</td>
                                        <td>{u.designationId?.name || "-"}</td>
                                        <td>{u.mobile || "-"}</td>
                                        <td>
                                            <span className={`badge ${u.status === "Active" ? "badge-active" : "badge-inactive"}`}>
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
