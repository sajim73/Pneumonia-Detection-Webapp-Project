import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      navigate(data.user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="page-title">Welcome back</h2>
        <p className="page-subtitle">Sign in to access the screening platform.</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1.25rem" }}>
          <span>⚠</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="form-group">
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
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
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          style={{ marginTop: "0.5rem" }}
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: "1.5rem", fontSize: "0.88rem", color: "var(--muted)", textAlign: "center" }}>
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          style={{ color: "var(--primary)", fontWeight: 700 }}
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
