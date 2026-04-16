import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container-page header-inner">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="brand">
            <span className="brand-mark">AI</span>
            <span> Pneumonia Detection</span>
          </Link>

          <nav className="main-nav">
            {!isAdmin && (
              <>
                <NavLink to="/dashboard" className="nav-link">
                  Dashboard
                </NavLink>
                <NavLink to="/upload" className="nav-link">
                  Upload Scan
                </NavLink>
                <NavLink to="/history" className="nav-link">
                  History
                </NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <NavLink to="/admin" className="nav-link">
                  Admin Dashboard
                </NavLink>
                <NavLink to="/admin/users" className="nav-link">
                  Users
                </NavLink>
                <NavLink to="/admin/scans" className="nav-link">
                  Scans
                </NavLink>
              </>
            )}
          </nav>

          <div className="header-actions">
            <div className="user-chip">
              <span className="user-name">{user?.name || "User"}</span>
              <span className="user-role">{user?.role || "patient"}</span>
            </div>

            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
