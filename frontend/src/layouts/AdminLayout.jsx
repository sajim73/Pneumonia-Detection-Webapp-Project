import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import useAdminGuard from "../hooks/useAdminGuard";
import useAuth from "../hooks/useAuth";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminGuard();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAdmin) return null;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="brand brand-sidebar">
          <span className="brand-mark">AI</span>
          <span> Admin Panel</span>
        </Link>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end className="sidebar-link">
            Overview
          </NavLink>
          <NavLink to="/admin/users" className="sidebar-link">
            Users
          </NavLink>
          <NavLink to="/admin/scans" className="sidebar-link">
            Scans
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip user-chip-block">
            <span className="user-name">{user?.name || "Admin"}</span>
            <span className="user-role">{user?.role || "admin"}</span>
          </div>

          <button type="button" className="btn-secondary w-full" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
