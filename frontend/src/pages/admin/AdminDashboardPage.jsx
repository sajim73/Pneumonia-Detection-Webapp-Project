import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalScans = scans.length;
    const pneumoniaCount = scans.filter(
      (scan) => scan.predicted_label === "Pneumonia"
    ).length;
    const normalCount = scans.filter(
      (scan) => scan.predicted_label === "Normal"
    ).length;
    const adminCount = users.filter((user) => user.role === "admin").length;
    const patientCount = users.filter((user) => user.role === "patient").length;

    return {
      totalUsers,
      totalScans,
      pneumoniaCount,
      normalCount,
      adminCount,
      patientCount
    };
  }, [users, scans]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        const [usersRes, scansRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/scans")
        ]);

        setUsers(usersRes.data.users || []);
        setScans(scansRes.data.scans || []);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading admin dashboard..." />;
  }

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h2 className="page-title">Admin Dashboard</h2>
        <p className="page-subtitle">
          Review registered users, total scans, and recent pneumonia screening activity.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Total users</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Total scans</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalScans}</p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Pneumonia results</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {stats.pneumoniaCount}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Normal results</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {stats.normalCount}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-slate-900">Quick Admin Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/users" className="btn-secondary">
                View Users
              </Link>
              <Link to="/admin/scans" className="btn-primary">
                Review Scans
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Patient accounts</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.patientCount}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Admin accounts</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.adminCount}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Admin review is for project monitoring only. This application is not a clinical deployment environment.
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-slate-900">Recent Scans</h3>

          <div className="mt-4 space-y-3">
            {scans.slice(0, 5).map((scan) => (
              <Link
                key={scan.id}
                to={`/scans/${scan.id}`}
                className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-800">Scan #{scan.id}</span>
                  <span
                    className={`badge ${
                      scan.predicted_label === "Pneumonia"
                        ? "badge-warning"
                        : "badge-success"
                    }`}
                  >
                    {scan.predicted_label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Confidence: {(scan.confidence * 100).toFixed(2)}%
                </p>
              </Link>
            ))}

            {scans.length === 0 && (
              <p className="text-sm text-slate-500">No scans found yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
