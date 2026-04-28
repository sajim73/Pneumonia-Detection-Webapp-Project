import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

/**
 * Converts any absolute backend URL into a same-origin relative path
 * so the browser fetches it through Vite's /uploads and /heatmaps proxy
 * rules — eliminating the cross-origin CORS issue entirely.
 *
 * e.g. http://localhost:5000/uploads/abc.jpg  →  /uploads/abc.jpg
 *      https://port-5000.github.dev/heatmaps/xyz.png  →  /heatmaps/xyz.png
 */
function toProxiedPath(url) {
  if (!url) return "";
  try {
    const { pathname, search } = new URL(url);
    return pathname + search;
  } catch {
    return url; // already relative
  }
}

function StatCard({ label, value, valueColor, sub }) {
  return (
    <div style={{
      background: "#f8fafc", borderRadius: 14, padding: "16px 18px",
      border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 4,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8" }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 900, color: valueColor || "#0f172a", lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: "#94a3b8" }}>{sub}</span>}
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#334155", wordBreak: "break-word" }}>{value || "N/A"}</span>
    </div>
  );
}

function ImagePanel({ title, icon, iconColor, src, alt, legend }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon}
          <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{title}</span>
        </div>
        {legend && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8" }}>
            <span style={{ width: 40, height: 6, borderRadius: 99, background: "linear-gradient(to right, #3b82f6, #22c55e, #facc15, #ef4444)", display: "inline-block" }} />
            Low → High
          </div>
        )}
      </div>
      <div style={{ padding: 16, background: "#0f172a", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!failed ? (
          <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            style={{ width: "100%", maxHeight: 300, objectFit: "contain", display: "block", borderRadius: 8 }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#475569" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span style={{ fontSize: 12 }}>Image unavailable</span>
            <a href={src} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#6366f1" }}>Try direct link</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScanDetailPage() {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const { data } = await api.get(`/scan/${id}`);
        setScan(data.scan);
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load scan");
      } finally {
        setLoading(false);
      }
    };
    fetchScan();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen text="Loading scan details..." />;

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", color: "#dc2626", fontSize: 13 }}>{error}</div>
      </div>
    );
  }

  if (!scan) return null;

  const isPneumonia  = scan.predicted_label === "Pneumonia";
  const accent       = isPneumonia ? "#ef4444" : "#22c55e";
  const accentLight  = isPneumonia ? "rgba(239,68,68,0.07)"  : "rgba(34,197,94,0.07)";
  const accentBorder = isPneumonia ? "rgba(239,68,68,0.2)"   : "rgba(34,197,94,0.2)";
  const confidencePct = (scan.confidence * 100).toFixed(2);

  // Proxy through Vite — same-origin, no CORS
  const imageUrl   = toProxiedPath(scan.image_url);
  const overlayUrl = toProxiedPath(scan.overlay_url);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
          <Link to="/history" style={{ color: "#94a3b8", textDecoration: "none" }}>Scan Records</Link>
          <span>/</span>
          <span style={{ color: "#334155" }}>Scan #{scan.id}</span>
        </div>
      </div>

      {/* page header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent, marginBottom: 4 }}>Scan Record</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Scan Detail #{scan.id}</h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Full detail for this saved scan record.</p>
          </div>
          <Link
            to={`/reports/${scan.id}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, textDecoration: "none", background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Open Report
          </Link>
        </div>
      </div>

      {/* main layout */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 16, padding: "22px 24px", background: accentLight, border: `1.5px solid ${accentBorder}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent, margin: 0 }}>Diagnosis</p>
            <p style={{ fontSize: 30, fontWeight: 900, color: accent, margin: "6px 0 0" }}>{scan.predicted_label}</p>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Confidence: <strong style={{ color: accent }}>{confidencePct}%</strong></p>
            <div style={{ marginTop: 12, height: 8, borderRadius: 99, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ height: 8, borderRadius: 99, background: accent, width: `${confidencePct}%`, transition: "width 0.7s ease-out" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StatCard label="Confidence"      value={`${confidencePct}%`}                                                valueColor={accent} />
            <StatCard label="Prediction"      value={scan.predicted_label}                                               valueColor={accent} />
            <StatCard label="Normal Prob."    value={`${((scan.normal_probability    || 0) * 100).toFixed(2)}%`} valueColor="#16a34a" />
            <StatCard label="Pneumonia Prob." value={`${((scan.pneumonia_probability || 0) * 100).toFixed(2)}%`} valueColor="#dc2626" />
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", margin: 0 }}>Technical Metadata</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <MetaItem label="Model"          value={scan.model_version} />
              <MetaItem label="Preprocess"     value={scan.preprocess_mode} />
              <MetaItem label="Grad-CAM Layer" value={scan.gradcam_layer} />
              <MetaItem label="Created"        value={new Date(scan.created_at).toLocaleString()} />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ImagePanel
            title="Original X-ray"
            alt="Original X-ray"
            src={imageUrl}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            }
          />
          <ImagePanel
            title="Grad-CAM Heatmap"
            alt="Grad-CAM heatmap"
            src={overlayUrl}
            legend
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
            }
          />
        </div>
      </div>
    </div>
  );
}
