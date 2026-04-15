import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/Components/Login/AuthContext";
import { sidebarConfig } from "@/Data/Sidebar/sidebar";
import "./layout.css";

const icons = {
    dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    ),
    master: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
    ),
    ticket: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/></svg>
    ),
    chevronDown: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
    ),
    chevronUp: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
    ),
    logout: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    ),
    menu: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    ),
    user: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
};

const getIcon = (name) => {
    if (!name) return icons.dashboard;
    if (name.includes('master')) return icons.master;
    if (name.includes('ticket')) return icons.ticket;
    return icons.dashboard;
};

const SidebarItem = ({ item, collapsed }) => {
    const location = useLocation();
    const [open, setOpen] = useState(() => location.pathname.startsWith(item.path || ''));

    if (item.type === "dropdown") {
        const isActive = item.children?.some(c => location.pathname === c.path || location.pathname.startsWith(c.path));
        return (
            <div className={`sidebar-group ${isActive ? 'active' : ''}`}>
                <button
                    className={`sidebar-item sidebar-dropdown-toggle ${isActive || open ? 'open' : ''}`}
                    onClick={() => setOpen(!open)}
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
                                className={({ isActive }) => `sidebar-child ${isActive ? 'active' : ''}`}
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
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
            <span className="sidebar-icon">{getIcon(item.iconClass)}</span>
            {!collapsed && <span className="sidebar-label">{item.name}</span>}
        </NavLink>
    );
};

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className={`layout-root ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

            <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-mark">NT</div>
                        {!sidebarCollapsed && <span className="logo-name">NeoTicket</span>}
                    </div>
                    <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        {icons.chevronDown}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {sidebarConfig.map((item, idx) => (
                        <SidebarItem key={idx} item={item} collapsed={sidebarCollapsed} />
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar-small">{icons.user}</div>
                        {!sidebarCollapsed && (
                            <div className="user-info">
                                <span className="user-name">{user?.name || 'Admin'}</span>
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
                    <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
                        {icons.menu}
                    </button>
                    <div className="topbar-right">
                        <div className="topbar-user">
                            <div className="topbar-avatar">{user?.name?.charAt(0) || 'A'}</div>
                            <span className="topbar-name">{user?.name || 'Admin'}</span>
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
