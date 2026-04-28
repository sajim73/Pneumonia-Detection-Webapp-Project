import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* ── Animated confidence bar ── */
function ConfidenceBar({ label, value, color, bgColor }) {
  const pct = (value * 100).toFixed(1);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: bgColor }}>
        <div
          className="h-2.5 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ── Diagnosis pill ── */
function DiagnosisBadge({ label }) {
  const isPneumonia = label === "Pneumonia";
  return (
    <span
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase"
      style={{
        background: isPneumonia ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
        color: isPneumonia ? "#dc2626" : "#16a34a",
        border: `1.5px solid ${isPneumonia ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ background: isPneumonia ? "#ef4444" : "#22c55e" }}
      />
      {label}
    </span>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, valueColor }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 border border-slate-100">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      <span className="text-xl font-extrabold" style={{ color: valueColor || "#0f172a" }}>{value}</span>
    </div>
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-10 max-w-sm">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5"
            style={{ background: "rgba(99,102,241,0.08)" }}
          >🩻</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No result available</h2>
          <p className="text-slate-500 mb-6 text-sm">Please upload a chest X-ray to get started.</p>
          <button
            onClick={() => navigate("/upload")}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold"
          >Go to Upload</button>
        </div>
      </div>
    );
  }

  const prediction = result.prediction;
  const files = result.files;
  const scanId = result.scan_id || result.scan?.id;
  const isPneumonia = prediction.predicted_label === "Pneumonia";
  const confidencePct = (prediction.confidence * 100).toFixed(1);

  const accent = isPneumonia ? "#ef4444" : "#22c55e";
  const accentMuted = isPneumonia ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)";
  const accentBorder = isPneumonia ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.18)";

  const tabs = [
    { key: "overlay",  icon: "🔥", label: "Grad-CAM" },
    { key: "original", icon: "🩻", label: "Original" },
    { key: "side",     icon: "⚖️",  label: "Side by Side" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>

      {/* ── Top breadcrumb bar ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link to="/dashboard" className="hover:text-slate-700 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-700">Scan Results</span>
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: accent }}
            >AI Screening Result</p>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">Scan Results</h1>
            <p className="text-sm text-slate-500 mt-1">Classification, confidence, and Grad-CAM heatmap.</p>
          </div>
          <div className="flex items-center gap-3">
            <DiagnosisBadge label={prediction.predicted_label} />
            {scanId && (
              <Link
                to={`/reports/${scanId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#334155" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Full Report
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-5">

        {/* ── LEFT: metrics column ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Confidence hero card */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: accentMuted, borderColor: accentBorder }}
          >
            <div className="flex items-end justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Confidence</span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black tabular-nums" style={{ color: accent }}>{confidencePct}%</span>
              <span className="text-sm text-slate-500 font-medium mb-1">model confidence</span>
            </div>
            {/* Wide confidence bar */}
            <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
              <div
                className="h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${confidencePct}%`, background: accent }}
              />
            </div>
          </div>

          {/* Probability breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Probability Breakdown</h3>
            <div className="space-y-4">
              <ConfidenceBar
                label="Pneumonia"
                value={prediction.pneumonia_probability}
                color="#ef4444"
                bgColor="rgba(239,68,68,0.1)"
              />
              <ConfidenceBar
                label="Normal"
                value={prediction.normal_probability}
                color="#22c55e"
                bgColor="rgba(34,197,94,0.1)"
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Diagnosis" value={prediction.predicted_label} valueColor={accent} />
            <StatCard label="Confidence" value={`${confidencePct}%`} />
            <StatCard
              label="Normal prob."
              value={`${(prediction.normal_probability * 100).toFixed(1)}%`}
              valueColor="#16a34a"
            />
            <StatCard
              label="Pneumonia prob."
              value={`${(prediction.pneumonia_probability * 100).toFixed(1)}%`}
              valueColor="#dc2626"
            />
          </div>

          {/* Clinical disclaimer */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
            <span className="text-lg mt-0.5">⚠️</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              This output is a <strong>screening aid only</strong> and must be reviewed by a qualified clinician before any clinical decision is made.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/upload"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                New Scan
              </Link>
              <Link
                to="/history"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                History
              </Link>
            </div>
            {scanId && (
              <Link
                to={`/scans/${scanId}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Scan Detail
              </Link>
            )}
          </div>
        </div>

        {/* ── RIGHT: image viewer ── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">

            {/* Tab bar */}
            <div className="flex border-b border-slate-100 bg-slate-50">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? "bg-white border-b-2 text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  style={activeTab === tab.key ? { borderBottomColor: accent } : {}}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Image panel */}
            <div className="flex-1 p-6">
              {activeTab === "overlay" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium">Red/yellow regions show where the model focused.</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "linear-gradient(to right, #3b82f6, #22c55e, #facc15, #ef4444)" }} />
                      Low → High
                    </div>
                  </div>
                  <img
                    src={files.overlay_url}
                    alt="Grad-CAM overlay"
                    className="w-full rounded-xl object-contain"
                    style={{ maxHeight: "420px", background: "#0f172a" }}
                  />
                </div>
              )}
              {activeTab === "original" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-medium">The original uploaded chest X-ray image.</p>
                  <img
                    src={files.image_url}
                    alt="Uploaded chest X-ray"
                    className="w-full rounded-xl object-contain"
                    style={{ maxHeight: "420px", background: "#0f172a" }}
                  />
                </div>
              )}
              {activeTab === "side" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-medium">Compare original X-ray vs. Grad-CAM activation map.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Original</p>
                      <img
                        src={files.image_url}
                        alt="Original X-ray"
                        className="w-full rounded-xl object-contain"
                        style={{ maxHeight: "300px", background: "#0f172a" }}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Grad-CAM</p>
                      <img
                        src={files.overlay_url}
                        alt="Grad-CAM activation"
                        className="w-full rounded-xl object-contain"
                        style={{ maxHeight: "300px", background: "#0f172a" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
