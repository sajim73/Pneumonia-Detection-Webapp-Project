import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/scan/history");
      setScans(data.scans || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this saved scan?");
    if (!confirmed) return;

    try {
      await api.delete(`/scan/${id}`);
      setScans((prev) => prev.filter((scan) => scan.id !== id));
    } catch (err) {
      alert(err?.response?.data?.error || "Delete failed");
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading history..." />;
  }

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h2 className="page-title">Saved Scan History</h2>
        <p className="page-subtitle">
          Review all previously saved scans with timestamps and results.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {scans.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            No scans saved yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Result</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Confidence</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr key={scan.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-sm text-slate-700">#{scan.id}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          scan.predicted_label === "Pneumonia"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {scan.predicted_label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {(scan.confidence * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {new Date(scan.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/scans/${scan.id}`} className="btn-secondary">
                          Details
                        </Link>
                        <Link to={`/reports/${scan.id}`} className="btn-secondary">
                          Report
                        </Link>
                        <button
                          onClick={() => handleDelete(scan.id)}
                          className="btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
