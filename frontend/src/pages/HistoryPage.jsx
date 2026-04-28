import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

function ConfidenceMini({ value }) {
  const pct = (value * 100).toFixed(1);
  const color = value >= 0.8 ? "#f59e0b" : value >= 0.5 ? "#fb923c" : "#22c55e";
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-400">Confidence</span>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ResultBadge({ label }) {
  const isPneumonia = label === "Pneumonia";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        background: isPneumonia ? "#fef3c7" : "#dcfce7",
        color: isPneumonia ? "#92400e" : "#166534",
        border: `1px solid ${isPneumonia ? "#fcd34d" : "#86efac"}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: isPneumonia ? "#f59e0b" : "#22c55e" }}
      />
      {label}
    </span>
  );
}

function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="text-3xl mb-3 text-center">🗑️</div>
        <h3 className="text-lg font-bold text-slate-800 text-center mb-1">Delete this scan?</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          This action cannot be undone. The scan and its results will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: "#ef4444" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  useEffect(() => { fetchHistory(); }, []);

  const confirmDelete = async () => {
    try {
      await api.delete(`/scan/${deleteTarget}`);
      setScans((prev) => prev.filter((s) => s.id !== deleteTarget));
    } catch (err) {
      alert(err?.response?.data?.error || "Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading history..." />;

  const pneumoniaCount = scans.filter(s => s.predicted_label === "Pneumonia").length;
  const normalCount = scans.filter(s => s.predicted_label === "Normal").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {deleteTarget !== null && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Scan Records</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Scan History</h1>
          <p className="text-sm text-slate-500 mt-1">All previously processed chest X-ray scans.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Summary stats */}
        {scans.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-black text-slate-800">{scans.length}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium uppercase tracking-wide">Total Scans</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-black text-amber-500">{pneumoniaCount}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium uppercase tracking-wide">Pneumonia</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-black text-emerald-500">{normalCount}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium uppercase tracking-wide">Normal</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Empty state */}
        {scans.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="text-5xl mb-4">🩻</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No scans yet</h3>
            <p className="text-sm text-slate-400 mb-6">Upload a chest X-ray to get started.</p>
            <Link to="/upload" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">
              Upload a Scan
            </Link>
          </div>
        )}

        {/* Scan cards */}
        <div className="space-y-3">
          {scans.map((scan, idx) => {
            const isPneumonia = scan.predicted_label === "Pneumonia";
            const accentColor = isPneumonia ? "#f59e0b" : "#22c55e";
            return (
              <div
                key={scan.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                style={{ borderLeft: `4px solid ${accentColor}` }}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Left: ID + badge + date */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                        style={{ background: accentColor }}
                      >
                        #{scan.id}
                      </div>
                      <div className="min-w-0">
                        <ResultBadge label={scan.predicted_label} />
                        <p className="text-xs text-slate-400 mt-1.5">
                          {new Date(scan.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Middle: confidence bar */}
                    <div className="flex-1 min-w-0">
                      <ConfidenceMini value={scan.confidence} />
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/scans/${scan.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Details
                      </Link>
                      <Link
                        to={`/reports/${scan.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
                        style={{ background: "#3b82f6" }}
                      >
                        Report
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(scan.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
