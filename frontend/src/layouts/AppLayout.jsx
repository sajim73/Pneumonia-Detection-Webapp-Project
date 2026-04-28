import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const NAV_PATIENT = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/upload",    icon: "🫁", label: "Upload Scan" },
  { to: "/history",   icon: "📋", label: "History" },
];

const NAV_ADMIN = [
  { to: "/admin",        icon: "📊", label: "Overview" },
  { to: "/admin/users",  icon: "👥", label: "Users" },
  { to: "/admin/scans",  icon: "🔬", label: "Scans" },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const links = isAdmin ? NAV_ADMIN : NAV_PATIENT;

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {open && (
        <div className="overlay" onClick={() => setOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle navigation"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <aside className={`app-sidebar${open ? " open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">AI</span>
          <span>Pneumonia<br />Detection</span>
        </div>

        <nav className="sidebar-nav">
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard" || to === "/admin"}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="user-name">{user?.name || "User"}</span>
            <span className="user-role">{user?.role || "patient"}</span>
          </div>
          <button type="button" className="btn btn-secondary btn-full" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
