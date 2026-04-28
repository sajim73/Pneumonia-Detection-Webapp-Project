import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ConfidenceBar({ label, value, color }) {
  const pct = (value * 100).toFixed(1);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function RiskBadge({ label }) {
  const isPneumonia = label === "Pneumonia";
  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
      style={{
        background: isPneumonia ? "#fef3c7" : "#dcfce7",
        color: isPneumonia ? "#92400e" : "#166534",
        border: `1.5px solid ${isPneumonia ? "#fcd34d" : "#86efac"}`,
      }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: isPneumonia ? "#f59e0b" : "#22c55e" }}
      />
      {label}
    </span>
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
        <div className="text-center p-10">
          <div className="text-5xl mb-4">🩻</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No result available</h2>
          <p className="text-slate-500 mb-6">Please upload a scan first.</p>
          <button onClick={() => navigate("/upload")} className="btn-primary">Go to Upload</button>
        </div>
      </div>
    );
  }

  const prediction = result.prediction;
  const files = result.files;
  const scanId = result.scan_id || result.scan?.id;
  const isPneumonia = prediction.predicted_label === "Pneumonia";
  const confidencePct = (prediction.confidence * 100).toFixed(1);

  const riskColor = isPneumonia ? "#f59e0b" : "#22c55e";
  const riskBg = isPneumonia
    ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
    : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero banner ── */}
      <div
        className="w-full px-6 py-8"
        style={{ background: riskBg, borderBottom: `3px solid ${riskColor}` }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: riskColor }}>AI Screening Result</p>
            <h1 className="text-3xl font-extrabold text-slate-900">Scan Results</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Review the classification, confidence, and Grad-CAM heatmap overlay.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <RiskBadge label={prediction.predicted_label} />
            <span className="text-4xl font-black" style={{ color: riskColor }}>
              {confidencePct}%
            </span>
            <span className="text-xs text-slate-400 font-medium">Model Confidence</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-5">

        {/* Left col — stats */}
        <div className="lg:col-span-2 space-y-5">

          {/* Confidence ring card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">
              Probability Breakdown
            </h3>
            <div className="space-y-4">
              <ConfidenceBar
                label="Pneumonia"
                value={prediction.pneumonia_probability}
                color="#f59e0b"
              />
              <ConfidenceBar
                label="Normal"
                value={prediction.normal_probability}
                color="#22c55e"
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Diagnosis</span>
              <span className="text-lg font-extrabold" style={{ color: riskColor }}>
                {prediction.predicted_label}
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Confidence</span>
              <span className="text-lg font-extrabold text-slate-800">{confidencePct}%</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Normal prob.</span>
              <span className="text-lg font-extrabold text-emerald-600">
                {(prediction.normal_probability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Pneumonia prob.</span>
              <span className="text-lg font-extrabold text-amber-600">
                {(prediction.pneumonia_probability * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                This output is a <strong>screening aid only</strong> and must be
                reviewed by a qualified clinician before any clinical decision.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {scanId && (
              <Link
                to={`/reports/${scanId}`}
                className="w-full text-center btn-primary py-3 rounded-xl font-semibold"
              >
                📄 Open Full Report
              </Link>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Link to="/upload" className="btn-secondary text-center text-sm py-2 rounded-xl">
                ↑ New Scan
              </Link>
              <Link to="/history" className="btn-secondary text-center text-sm py-2 rounded-xl">
                🕘 History
              </Link>
            </div>
            {scanId && (
              <Link
                to={`/scans/${scanId}`}
                className="w-full text-center btn-secondary py-2 rounded-xl text-sm"
              >
                🔍 Scan Detail
              </Link>
            )}
          </div>
        </div>

        {/* Right col — images */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-slate-100">
              {[
                { key: "overlay", label: "🔥 Grad-CAM Overlay" },
                { key: "original", label: "🩻 Original X-ray" },
                { key: "side", label: "⚖️ Side by Side" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? "border-b-2 text-slate-900"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  style={activeTab === tab.key ? { borderColor: riskColor } : {}}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Image display */}
            <div className="p-5">
              {activeTab === "overlay" && (
                <div>
                  <p className="text-xs text-slate-400 mb-3">
                    Red/yellow regions indicate areas the model focused on for this prediction.
                  </p>
                  <img
                    src={files.overlay_url}
                    alt="Grad-CAM overlay"
                    className="w-full rounded-xl object-contain bg-slate-900"
                    style={{ maxHeight: "420px" }}
                  />
                </div>
              )}
              {activeTab === "original" && (
                <div>
                  <p className="text-xs text-slate-400 mb-3">
                    The original uploaded chest X-ray image.
                  </p>
                  <img
                    src={files.image_url}
                    alt="Uploaded chest X-ray"
                    className="w-full rounded-xl object-contain bg-slate-900"
                    style={{ maxHeight: "420px" }}
                  />
                </div>
              )}
              {activeTab === "side" && (
                <div>
                  <p className="text-xs text-slate-400 mb-3">
                    Compare original vs. Grad-CAM activation overlay.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2 text-center">Original</p>
                      <img
                        src={files.image_url}
                        alt="Original"
                        className="w-full rounded-xl object-contain bg-slate-900"
                        style={{ maxHeight: "300px" }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2 text-center">Grad-CAM</p>
                      <img
                        src={files.overlay_url}
                        alt="Grad-CAM"
                        className="w-full rounded-xl object-contain bg-slate-900"
                        style={{ maxHeight: "300px" }}
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
