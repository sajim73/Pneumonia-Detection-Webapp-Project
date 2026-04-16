import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    const total = history.length;
    const pneumonia = history.filter((s) => s.predicted_label === "Pneumonia").length;
    const normal = history.filter((s) => s.predicted_label === "Normal").length;

    return { total, pneumonia, normal };
  }, [history]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/scan/history");
        setHistory(data.scans || []);
      } catch (error) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h2 className="page-title">Welcome, {user?.name}</h2>
        <p className="page-subtitle">
          Upload a chest X-ray image, review the AI result, save the scan, and download a report.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Saved scans</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Pneumonia results</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.pneumonia}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Normal results</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.normal}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-xl font-semibold text-slate-900">Quick Actions</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/upload" className="btn-primary">
              Upload New Scan
            </Link>
            <Link to="/history" className="btn-secondary">
              View Scan History
            </Link>
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This app is a screening aid only and is not a clinical diagnosis tool.
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-slate-900">Recent Activity</h3>
          <div className="mt-4 space-y-3">
            {history.slice(0, 4).map((scan) => (
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

            {history.length === 0 && (
              <p className="text-sm text-slate-500">
                No scans saved yet. Start by uploading one.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
