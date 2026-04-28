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
    admin_key: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
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
        ...(form.role === "admin" && { admin_key: form.admin_key })
      };

      const { data } = await api.post("/auth/register", payload);
      login(data.token, data.user);

      if (data.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
     <div id="holderDiv">
    <div className="card p-9">
      <h2 className="page-title">Create Account</h2>
      <p className="page-subtitle">Register as a patient or admin user.</p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div id="containerForLabels">
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="firstAndLastLblBxs">
        <div>
          <label className="label">First Name</label>
          <input
            className="input"
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="label">Last Name</label>
          <input
            className="input"
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
        </div>

      <div className="emailPassRoleLblBxs">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="label">Role</label>
          <select
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
          <div>
            <label className="label">Admin Registration Key</label>
            <input
              className="input"
              type="password"
              name="admin_key"
              value={form.admin_key}
              onChange={handleChange}
              required
            />
          </div>
        )}
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        Already have an account? <Link to="/login" className="text-teal-700 font-semibold">Login</Link>
      </p>

      <p>
      <Link to="/dashboard" className="tempLink">dashboard</Link>
      </p>
      </div>
    </div>
    </div>
  );
}
