import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/** Rewrites the origin of any absolute URL to match VITE_API_BASE_URL,
 *  so Flask-generated localhost URLs work in Codespaces / production. */
function toAbsoluteUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const base   = new URL(BASE_URL);
    parsed.protocol = base.protocol;
    parsed.host     = base.host;
    return parsed.toString();
  } catch {
    return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  }
}

/* ── Animated probability bar ── */
function ProbBar({ label, value, color, bg }) {
  const pct = (value * 100).toFixed(1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: bg, overflow: "hidden" }}>
        <div style={{ height: 8, borderRadius: 99, background: color, width: `${pct}%`, transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
    </div>
  );
}

/* ── Small stat cell ── */
function StatCell({ label, value, valueColor }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 900, color: valueColor || "#0f172a", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

/* ── Image panel (handles load errors gracefully) ── */
function ImageSlot({ src, alt }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ width: "100%", borderRadius: 10, overflow: "hidden", background: "#0f172a", minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          style={{ width: "100%", maxHeight: 420, objectFit: "contain", display: "block" }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#475569", padding: 24 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span style={{ fontSize: 12 }}>Image unavailable</span>
        </div>
      )}
    </div>
  );
}

/* ── Tab button ── */
function Tab({ active, onClick, icon, label, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        padding: "12px 8px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
        background: active ? "#fff" : "transparent",
        color: active ? "#0f172a" : "#94a3b8",
        borderBottom: active ? `2.5px solid ${accent}` : "2.5px solid transparent",
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span> {label}
    </button>
  );
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result || null);
  const [activeTab, setActiveTab] = useState("overlay");

  useEffect(() => {
    if (!location.state?.result) {
      const stored = localStorage.getItem("lastScanResult");
      if (stored) setResult(JSON.parse(stored));
    }
  }, [location.state]);

  if (!result) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40, maxWidth: 340 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, margin: "0 auto 20px" }}>🩻</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>No result available</h2>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 24px" }}>Please upload a chest X-ray to get started.</p>
          <button onClick={() => navigate("/upload")} style={{ padding: "10px 28px", borderRadius: 12, background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>Go to Upload</button>
        </div>
      </div>
    );
  }

  const prediction  = result.prediction;
  const files       = result.files;
  const scanId      = result.scan_id || result.scan?.id;
  const isPneumonia = prediction.predicted_label === "Pneumonia";
  const confidencePct = (prediction.confidence * 100).toFixed(1);
  const accent      = isPneumonia ? "#ef4444" : "#22c55e";
  const accentMuted  = isPneumonia ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)";
  const accentBorder = isPneumonia ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.18)";

  const imageUrl   = toAbsoluteUrl(files?.image_url);
  const overlayUrl = toAbsoluteUrl(files?.overlay_url);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
          <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none" }}>Dashboard</Link>
          <span>/</span>
          <span style={{ color: "#334155" }}>Scan Results</span>
        </div>
      </div>

      {/* page header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent, margin: 0 }}>AI Screening Result</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "4px 0 0" }}>Scan Results</h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Classification, confidence, and Grad-CAM heatmap.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* diagnosis badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.06em",
              background: accentMuted, color: accent, border: `1.5px solid ${accentBorder}`,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent, display: "inline-block" }} />
              {prediction.predicted_label}
            </span>
            {scanId && (
              <Link
                to={`/reports/${scanId}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 12, textDecoration: "none", background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Full Report
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* main grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>

        {/* ── LEFT column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Confidence hero */}
          <div style={{ borderRadius: 16, padding: "22px 24px", background: accentMuted, border: `1.5px solid ${accentBorder}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent, margin: 0 }}>Confidence</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "6px 0 12px" }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: accent, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{confidencePct}%</span>
              <span style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>model confidence</span>
            </div>
            <div style={{ height: 10, borderRadius: 99, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ height: 10, borderRadius: 99, background: accent, width: `${confidencePct}%`, transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
          </div>

          {/* Probability breakdown */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", margin: 0 }}>Probability Breakdown</p>
            <ProbBar label="Pneumonia" value={prediction.pneumonia_probability} color="#ef4444" bg="rgba(239,68,68,0.1)" />
            <ProbBar label="Normal"    value={prediction.normal_probability}    color="#22c55e" bg="rgba(34,197,94,0.1)" />
          </div>

          {/* Stat 2×2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <StatCell label="Diagnosis"      value={prediction.predicted_label}                                              valueColor={accent} />
            <StatCell label="Confidence"     value={`${confidencePct}%`}                                                     valueColor={accent} />
            <StatCell label="Normal prob."   value={`${(prediction.normal_probability    * 100).toFixed(1)}%`} valueColor="#16a34a" />
            <StatCell label="Pneumonia prob." value={`${(prediction.pneumonia_probability * 100).toFixed(1)}%`} valueColor="#dc2626" />
          </div>

          {/* Disclaimer */}
          <div style={{ borderRadius: 14, border: "1px solid rgba(245,158,11,0.3)", background: "rgba(255,251,235,0.9)", padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>⚠️</span>
            <p style={{ fontSize: 12, color: "#92400e", margin: 0, lineHeight: 1.6 }}>
              This output is a <strong>screening aid only</strong> and must be reviewed by a qualified clinician before any clinical decision is made.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { to: "/upload",      icon: "↑", label: "New Scan" },
              { to: "/history",     icon: "🕐", label: "History" },
            ].map(({ to, icon, label }) => (
              <Link key={to} to={to} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                <span>{icon}</span> {label}
              </Link>
            ))}
          </div>
          {scanId && (
            <Link to={`/scans/${scanId}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Scan Detail
            </Link>
          )}
        </div>

        {/* ── RIGHT column: image viewer ── */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
            <Tab active={activeTab === "overlay"}  onClick={() => setActiveTab("overlay")}  icon="🔥" label="Grad-CAM"     accent={accent} />
            <Tab active={activeTab === "original"} onClick={() => setActiveTab("original")} icon="🩻" label="Original"     accent={accent} />
            <Tab active={activeTab === "side"}     onClick={() => setActiveTab("side")}     icon="⚖️" label="Side by Side" accent={accent} />
          </div>

          {/* image panel */}
          <div style={{ padding: 20, flex: 1 }}>

            {activeTab === "overlay" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Red/yellow regions show where the model focused.</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8" }}>
                    <span style={{ width: 44, height: 6, borderRadius: 99, background: "linear-gradient(to right, #3b82f6, #22c55e, #facc15, #ef4444)", display: "inline-block" }} />
                    Low → High
                  </div>
                </div>
                <ImageSlot src={overlayUrl} alt="Grad-CAM overlay" />
              </div>
            )}

            {activeTab === "original" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>The original uploaded chest X-ray image.</p>
                <ImageSlot src={imageUrl} alt="Original chest X-ray" />
              </div>
            )}

            {activeTab === "side" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Compare original X-ray vs. Grad-CAM activation map.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", textAlign: "center", margin: 0 }}>Original</p>
                    <ImageSlot src={imageUrl} alt="Original X-ray" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", textAlign: "center", margin: 0 }}>Grad-CAM</p>
                    <ImageSlot src={overlayUrl} alt="Grad-CAM activation" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
