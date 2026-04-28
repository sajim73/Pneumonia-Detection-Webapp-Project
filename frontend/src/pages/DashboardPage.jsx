import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    const total     = history.length;
    const pneumonia = history.filter((s) => s.predicted_label === "Pneumonia").length;
    const normal    = history.filter((s) => s.predicted_label === "Normal").length;
    const last      = history[0] || null;
    return { total, pneumonia, normal, last };
  }, [history]);

  useEffect(() => {
    api.get("/scan/history")
      .then(({ data }) => setHistory(data.scans || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen text="Loading dashboard…" />;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{greeting}, {user?.name?.split(" ")[0] || "there"} 👋</h1>
        <p className="page-subtitle">Here&apos;s a summary of your pneumonia screening activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid-stats" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card" style={{ animationDelay: "0ms" }}>
          <div className="stat-icon" style={{ background: "var(--primary-light)" }}>🔬</div>
          <div className="stat-label">Total Scans</div>
          <div className="stat-value">{stats.total}</div>
        </div>

        <div className="stat-card" style={{ animationDelay: "60ms" }}>
          <div className="stat-icon" style={{ background: "var(--danger-bg)" }}>⚠️</div>
          <div className="stat-label">Pneumonia Detected</div>
          <div className="stat-value danger">{stats.pneumonia}</div>
        </div>

        <div className="stat-card" style={{ animationDelay: "120ms" }}>
          <div className="stat-icon" style={{ background: "var(--success-bg)" }}>✅</div>
          <div className="stat-label">Normal Results</div>
          <div className="stat-value accent">{stats.normal}</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid-main">
        {/* Recent activity */}
        <div className="card card-p" style={{ animationDelay: "180ms" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>Recent Scans</h3>
            <Link to="/history" className="btn btn-secondary btn-sm">View all</Link>
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🫁</div>
              <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: "0.4rem" }}>No scans yet</p>
              <p style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
                Upload your first chest X-ray to get started.
              </p>
              <Link to="/upload" className="btn btn-primary btn-sm">Upload Scan</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {history.slice(0, 5).map((scan, i) => (
                <Link
                  key={scan.id}
                  to={`/scans/${scan.id}`}
                  className="activity-item"
                  style={{ animationDelay: `${200 + i * 50}ms` }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "var(--radius-sm)",
                      background: scan.predicted_label === "Pneumonia" ? "var(--warning-bg)" : "var(--success-bg)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem", flexShrink: 0
                    }}>
                      {scan.predicted_label === "Pneumonia" ? "⚠️" : "✅"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>Scan #{scan.id}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                        Confidence: {(scan.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${
                    scan.predicted_label === "Pneumonia" ? "badge-warning" : "badge-success"
                  }`}>
                    {scan.predicted_label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card card-p" style={{ animationDelay: "200ms" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", marginBottom: "1rem" }}>
              Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <Link to="/upload" className="btn btn-primary btn-full">
                🫁 New Scan
              </Link>
              <Link to="/history" className="btn btn-secondary btn-full">
                📋 View History
              </Link>
            </div>
          </div>

          {stats.last && (
            <div className="card card-p" style={{ animationDelay: "260ms" }}>
              <h3 style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", marginBottom: "0.75rem" }}>
                Last Result
              </h3>
              <span className={`badge ${
                stats.last.predicted_label === "Pneumonia" ? "badge-warning" : "badge-success"
              }`} style={{ marginBottom: "0.5rem" }}>
                {stats.last.predicted_label}
              </span>
              <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                {(stats.last.confidence * 100).toFixed(1)}% confidence
              </p>
            </div>
          )}

          <div className="alert alert-warning" style={{ fontSize: "0.82rem", animationDelay: "300ms" }}>
            <span>⚕️</span>
            <span>Screening aid only. All outputs require clinician review.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
