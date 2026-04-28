import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

/* ── Diagnosis pill ── */
function DiagnosisBadge({ label }) {
  const isPneumonia = label === "Pneumonia";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
      style={{
        background: isPneumonia ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
        color: isPneumonia ? "#dc2626" : "#16a34a",
        border: `1.5px solid ${isPneumonia ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: isPneumonia ? "#ef4444" : "#22c55e" }}
      />
      {label}
    </span>
  );
}

/* ── Inline confidence bar ── */
function ConfidencePill({ value }) {
  const pct = (value * 100).toFixed(1);
  const color = value >= 0.9 ? "#ef4444" : value >= 0.6 ? "#f59e0b" : "#22c55e";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{pct}%</span>
    </div>
  );
}

/* ── Delete confirmation modal ── */
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full mx-4 border border-slate-100">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{ background: "rgba(239,68,68,0.08)" }}
        >🗑️</div>
        <h3 className="text-lg font-bold text-slate-800 text-center mb-1">Delete this scan?</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          This action cannot be undone. The scan and its results will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#ef4444" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ icon, label, value, valueColor, accent }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: accent }}
      >{icon}</div>
      <div>
        <p className="text-2xl font-black" style={{ color: valueColor || "#0f172a" }}>{value}</p>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

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

  const pneumoniaCount = scans.filter((s) => s.predicted_label === "Pneumonia").length;
  const normalCount = scans.filter((s) => s.predicted_label === "Normal").length;

  const filtered = scans.filter((s) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pneumonia" && s.predicted_label === "Pneumonia") ||
      (filter === "normal" && s.predicted_label === "Normal");
    const matchesSearch = search === "" || String(s.id).includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>

      {deleteTarget !== null && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Scan Records</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Scan History</h1>
          <p className="text-sm text-slate-500 mt-1">All previously processed chest X-ray scans.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-7 space-y-6">

        {/* ── Summary stats ── */}
        {scans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon="🩻" label="Total Scans" value={scans.length} accent="rgba(99,102,241,0.08)" valueColor="#4f46e5" />
            <StatCard icon="🔴" label="Pneumonia" value={pneumoniaCount} accent="rgba(239,68,68,0.08)" valueColor="#dc2626" />
            <StatCard icon="✅" label="Normal" value={normalCount} accent="rgba(34,197,94,0.08)" valueColor="#16a34a" />
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* ── Empty state ── */}
        {scans.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 flex flex-col items-center text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
              style={{ background: "rgba(99,102,241,0.08)" }}
            >🩻</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No scans yet</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">Upload a chest X-ray to get your first AI screening result.</p>
            <Link
              to="/upload"
              className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold"
            >Upload a Scan</Link>
          </div>
        )}

        {/* ── Toolbar ── */}
        {scans.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search by scan ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 text-slate-700 placeholder-slate-400"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pneumonia", "normal"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border ${
                    filter === f
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {f === "all" ? "All" : f === "pneumonia" ? "Pneumonia" : "Normal"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Scans table ── */}
        {filtered.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
              <div className="col-span-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">#</div>
              <div className="col-span-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Diagnosis</div>
              <div className="col-span-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Date &amp; Time</div>
              <div className="col-span-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Confidence</div>
              <div className="col-span-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
              {filtered.map((scan) => {
                const isPneumonia = scan.predicted_label === "Pneumonia";
                const accent = isPneumonia ? "#ef4444" : "#22c55e";
                return (
                  <div
                    key={scan.id}
                    className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50/70 transition-colors"
                  >
                    {/* ID */}
                    <div className="col-span-1">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white"
                        style={{ background: accent }}
                      >
                        {scan.id}
                      </div>
                    </div>

                    {/* Diagnosis badge */}
                    <div className="col-span-3">
                      <DiagnosisBadge label={scan.predicted_label} />
                    </div>

                    {/* Date */}
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-slate-700 tabular-nums leading-tight">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-400 tabular-nums">
                        {new Date(scan.created_at).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Confidence */}
                    <div className="col-span-2">
                      <ConfidencePill value={scan.confidence} />
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-1.5">
                      <Link
                        to={`/scans/${scan.id}`}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Details
                      </Link>
                      <Link
                        to={`/reports/${scan.id}`}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: "#4f46e5" }}
                      >
                        Report
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(scan.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-red-100 text-xs font-semibold text-red-400 hover:bg-red-50 transition-colors"
                        aria-label="Delete scan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
                <span className="font-semibold text-slate-600">{scans.length}</span> scans
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "#334155" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New Scan
              </Link>
            </div>
          </div>
        )}

        {/* No results after filter */}
        {filtered.length === 0 && scans.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-12 flex flex-col items-center text-center">
            <p className="text-slate-400 text-sm font-medium">No scans match your current filter.</p>
            <button
              onClick={() => { setFilter("all"); setSearch(""); }}
              className="mt-3 text-xs font-semibold text-indigo-500 hover:underline"
            >Clear filters</button>
          </div>
        )}

      </div>
    </div>
  );
}
