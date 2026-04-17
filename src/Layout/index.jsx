import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/Components/Login/AuthContext";
import { sidebarConfig } from "@/Data/Sidebar/sidebar";
import "./layout.css";

const icons = {
    dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
    ),
    master: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        </svg>
    ),
    ticket: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/>
        </svg>
    ),
    chevronDown: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
    ),
    chevronUp: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
    ),
    logout: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
    menu: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    ),
    collapse: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
    ),
    expand: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
    ),
};

const getIcon = (name) => {
    if (!name) return icons.dashboard;
    if (name.includes("master")) return icons.master;
    if (name.includes("ticket")) return icons.ticket;
    return icons.dashboard;
};

const SidebarItem = ({ item, collapsed }) => {
    const location = useLocation();
    const [open, setOpen] = useState(() =>
        item.children?.some(c => location.pathname.startsWith(c.path)) || false
    );

    if (item.type === "dropdown") {
        const isActive = item.children?.some(c => location.pathname === c.path || location.pathname.startsWith(c.path));
        return (
            <div className={`sidebar-group`}>
                <button
                    className={`sidebar-item sidebar-dropdown-toggle ${isActive || open ? "open" : ""}`}
                    onClick={() => setOpen(!open)}
                    title={collapsed ? (item.title || item.name) : ""}
                >
                    <span className="sidebar-icon">{getIcon(item.iconClass)}</span>
                    {!collapsed && (
                        <>
                            <span className="sidebar-label">{item.title || item.name}</span>
                            <span className="sidebar-chevron">{open ? icons.chevronUp : icons.chevronDown}</span>
                        </>
                    )}
                </button>
                {(open || isActive) && !collapsed && (
                    <div className="sidebar-children">
                        {item.children?.map((child) => (
                            <NavLink
                                key={child.path}
                                to={child.path}
                                className={({ isActive }) => `sidebar-child ${isActive ? "active" : ""}`}
                            >
                                {child.name}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <NavLink
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
            title={collapsed ? item.name : ""}
        >
            <span className="sidebar-icon">{getIcon(item.iconClass)}</span>
            {!collapsed && <span className="sidebar-label">{item.name}</span>}
        </NavLink>
    );
};

const now = new Date();
const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getPageTitle = () => {
        const p = location.pathname;
        if (p === "/") return "Dashboard";
        if (p.includes("company")) return "Company";
        if (p.includes("priority")) return "Priority";
        if (p.includes("designation")) return "Designation";
        if (p.includes("department")) return "Department";
        if (p.includes("ticket-status")) return "Ticket Status";
        if (p.includes("user")) return "Users";
        if (p.includes("create-ticket")) return "Create Ticket";
        if (p.includes("show-ticket")) return "Ticket Detail";
        if (p.includes("worker")) return "Work Details";
        if (p.includes("material-approved")) return "Material Approved";
        if (p.includes("closed")) return "Closed Tickets";
        if (p.includes("ticket")) return "Ticket List";
        return "NeoTicket";
    };

    return (
        <div className={`layout-root ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
            {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

            <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-mark">NT</div>
                        {!sidebarCollapsed && <span className="logo-name">NeoTicket</span>}
                    </div>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? "Expand" : "Collapse"}
                    >
                        {sidebarCollapsed ? icons.expand : icons.collapse}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {!sidebarCollapsed && <div className="sidebar-section-label">Navigation</div>}
                    {sidebarConfig.map((item, idx) => (
                        <SidebarItem key={idx} item={item} collapsed={sidebarCollapsed} />
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar-small">
                            {(user?.name || "A")[0].toUpperCase()}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="user-info">
                                <span className="user-name">{user?.name || "Admin"}</span>
                                <span className="user-role">Administrator</span>
                            </div>
                        )}
                    </div>
                    <button onClick={handleLogout} className="logout-btn" title="Logout">
                        {icons.logout}
                    </button>
                </div>
            </aside>

            <div className="main-area">
                <header className="topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
                            {icons.menu}
                        </button>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.2px" }}>
                            {getPageTitle()}
                        </div>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-date">{dateStr}</div>
                        <div className="topbar-divider" />
                        <div className="topbar-user">
                            <div className="topbar-avatar">{(user?.name || "A")[0].toUpperCase()}</div>
                            <div>
                                <div className="topbar-name">{user?.name || "Admin"}</div>
                                <div className="topbar-role">Administrator</div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
