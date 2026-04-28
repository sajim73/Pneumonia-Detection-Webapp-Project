import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

/* ── Diagnosis pill ── */
function DiagnosisBadge({ label }) {
  const isPneumonia = label === "Pneumonia";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
      background: isPneumonia ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
      color: isPneumonia ? "#dc2626" : "#16a34a",
      border: `1.5px solid ${isPneumonia ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: isPneumonia ? "#ef4444" : "#22c55e", display: "inline-block" }} />
      {label}
    </span>
  );
}

/* ── Mini confidence bar ── */
function ConfidencePill({ value }) {
  const pct = (value * 100).toFixed(1);
  const color = value >= 0.9 ? "#ef4444" : value >= 0.6 ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 110 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
        <div style={{ height: 6, borderRadius: 99, background: color, width: `${pct}%`, transition: "width 0.5s" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ icon, label, value, valueColor, bg }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9",
      boxShadow: "0 1px 6px rgba(0,0,0,0.04)", padding: "18px 20px",
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 24, fontWeight: 900, color: valueColor || "#0f172a", margin: 0, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", marginTop: 4 }}>{label}</p>
      </div>
    </div>
  );
}

/* ── Delete modal ── */
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", padding: 28, maxWidth: 360, width: "100%", margin: "0 16px", border: "1px solid #f1f5f9" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>🗑️</div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", textAlign: "center", margin: "0 0 8px" }}>Delete this scan?</h3>
        <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", margin: "0 0 24px" }}>This action cannot be undone. The scan and its results will be permanently removed.</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Delete</button>
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
    const matchesFilter = filter === "all" || (filter === "pneumonia" && s.predicted_label === "Pneumonia") || (filter === "normal" && s.predicted_label === "Normal");
    const matchesSearch = search === "" || String(s.id).includes(search);
    return matchesFilter && matchesSearch;
  });

  const thStyle = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", padding: "10px 14px", textAlign: "left", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" };
  const tdStyle = { padding: "14px", verticalAlign: "middle", borderBottom: "1px solid #f8fafc" };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {deleteTarget !== null && <DeleteModal onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}

      {/* ── Page header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 4 }}>Scan Records</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Scan History</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>All previously processed chest X-ray scans.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Stats row ── */}
        {scans.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <StatCard icon="🩻" label="Total Scans" value={scans.length} valueColor="#4f46e5" bg="rgba(99,102,241,0.08)" />
            <StatCard icon="🔴" label="Pneumonia" value={pneumoniaCount} valueColor="#dc2626" bg="rgba(239,68,68,0.08)" />
            <StatCard icon="✅" label="Normal" value={normalCount} valueColor="#16a34a" bg="rgba(34,197,94,0.08)" />
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", color: "#dc2626", fontSize: 13 }}>{error}</div>
        )}

        {/* ── Empty state ── */}
        {scans.length === 0 && !error && (
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, marginBottom: 20 }}>🩻</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>No scans yet</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 24px", maxWidth: 280 }}>Upload a chest X-ray to get your first AI screening result.</p>
            <Link to="/upload" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 12, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Upload a Scan</Link>
          </div>
        )}

        {/* ── Toolbar ── */}
        {scans.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search scan ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 34, paddingRight: 14, paddingTop: 8, paddingBottom: 8, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#334155", background: "#fff", outline: "none", width: 200 }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["all", "pneumonia", "normal"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                    textTransform: "capitalize", cursor: "pointer", transition: "all 0.15s",
                    border: filter === f ? "none" : "1px solid #e2e8f0",
                    background: filter === f ? "#0f172a" : "#fff",
                    color: filter === f ? "#fff" : "#64748b",
                  }}
                >
                  {f === "all" ? "All" : f === "pneumonia" ? "Pneumonia" : "Normal"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Table ── */}
        {filtered.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 60 }}>#</th>
                  <th style={thStyle}>Diagnosis</th>
                  <th style={thStyle}>Date & Time</th>
                  <th style={thStyle}>Confidence</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((scan) => {
                  const isPneumonia = scan.predicted_label === "Pneumonia";
                  const accent = isPneumonia ? "#ef4444" : "#22c55e";
                  return (
                    <tr key={scan.id} style={{ background: "#fff", transition: "background 0.1s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                      <td style={tdStyle}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{scan.id}</div>
                      </td>
                      <td style={tdStyle}><DiagnosisBadge label={scan.predicted_label} /></td>
                      <td style={tdStyle}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#334155", margin: 0, fontVariantNumeric: "tabular-nums" }}>{new Date(scan.created_at).toLocaleDateString()}</p>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, fontVariantNumeric: "tabular-nums" }}>{new Date(scan.created_at).toLocaleTimeString()}</p>
                      </td>
                      <td style={tdStyle}><ConfidencePill value={scan.confidence} /></td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                          <Link to={`/scans/${scan.id}`} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, color: "#475569", textDecoration: "none", background: "#fff" }}>Details</Link>
                          <Link to={`/reports/${scan.id}`} style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, color: "#fff", textDecoration: "none", background: "#4f46e5" }}>Report</Link>
                          <button onClick={() => setDeleteTarget(scan.id)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#ef4444", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Showing <strong style={{ color: "#475569" }}>{filtered.length}</strong> of <strong style={{ color: "#475569" }}>{scans.length}</strong> scans</p>
              <Link to="/upload" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, background: "#0f172a", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New Scan
              </Link>
            </div>
          </div>
        )}

        {/* ── Empty filter result ── */}
        {filtered.length === 0 && scans.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "48px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>No scans match your current filter.</p>
            <button onClick={() => { setFilter("all"); setSearch(""); }} style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}>Clear filters</button>
          </div>
        )}

      </div>
    </div>
  );
}
