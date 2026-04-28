import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "patient",
    admin_key: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === "admin" && { admin_key: form.admin_key }),
      };
      const { data } = await api.post("/auth/register", payload);
      login(data.token, data.user);
      navigate(data.user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="page-title">Create account</h2>
        <p className="page-subtitle">Register as a patient or admin user.</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1.25rem" }}>
          <span>⚠</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Name row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div className="form-group">
            <label className="label" htmlFor="firstName">First name</label>
            <input
              id="firstName"
              className="input"
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Jane"
              required
              autoComplete="given-name"
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              className="input"
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="reg-email">Email address</label>
          <input
            id="reg-email"
            className="input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            className="input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 8 characters"
            required
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="role">Role</label>
          <select
            id="role"
            className="input"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="patient">Patient</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {form.role === "admin" && (
          <div className="form-group" style={{ animation: "fadeSlideUp 0.3s var(--ease) both" }}>
            <label className="label" htmlFor="admin_key">Admin registration key</label>
            <input
              id="admin_key"
              className="input"
              type="password"
              name="admin_key"
              value={form.admin_key}
              onChange={handleChange}
              placeholder="Enter key provided by admin"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          style={{ marginTop: "0.5rem" }}
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: "1.5rem", fontSize: "0.88rem", color: "var(--muted)", textAlign: "center" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
