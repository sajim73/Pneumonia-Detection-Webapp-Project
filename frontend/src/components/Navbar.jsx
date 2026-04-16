import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive
      ? "bg-teal-700 text-white"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex items-center justify-between py-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            AI-Enhanced Pneumonia Detection
          </h1>
          <p className="text-xs text-slate-500">Simple working demo platform</p>
        </div>

        <nav className="flex items-center gap-2">
          {!user && (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </>
          )}

          {user && user.role === "patient" && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/upload" className={linkClass}>
                Upload
              </NavLink>
              <NavLink to="/history" className={linkClass}>
                History
              </NavLink>
            </>
          )}

          {user && user.role === "admin" && (
            <>
              <NavLink to="/admin/dashboard" className={linkClass}>
                Admin Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={linkClass}>
                Users
              </NavLink>
              <NavLink to="/admin/scans" className={linkClass}>
                Scans
              </NavLink>
            </>
          )}

          {user && (
            <div className="ml-3 flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {user.role}
                </p>
              </div>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
