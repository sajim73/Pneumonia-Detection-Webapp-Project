import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

function MetaRow({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8" }}>{label}</span>
      <span style={{ fontSize: "14px", fontWeight: 600, color: valueColor || "#1e293b" }}>{value}</span>
    </div>
  );
}

export default function ReportPreviewPage() {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl = "";
    const loadData = async () => {
      try {
        const [scanRes, pdfRes] = await Promise.all([
          api.get(`/scan/${id}`),
          api.get(`/scan/${id}/report`, { responseType: "blob" }),
        ]);
        setScan(scanRes.data.scan);
        objectUrl = URL.createObjectURL(new Blob([pdfRes.data], { type: "application/pdf" }));
        setPdfUrl(objectUrl);
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/scan/${id}/report`, { responseType: "blob" });
      const blobUrl = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `scan_report_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert(err?.response?.data?.error || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading report..." />;

  const isPneumonia = scan?.predicted_label === "Pneumonia";
  const accent = isPneumonia ? "#ef4444" : "#22c55e";
  const confidencePct = scan ? (scan.confidence * 100).toFixed(2) : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* ── Top bar ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
          <Link to="/history" style={{ color: "#94a3b8", textDecoration: "none" }}>Scan Records</Link>
          <span>/</span>
          <Link to={`/scans/${id}`} style={{ color: "#94a3b8", textDecoration: "none" }}>Scan #{id}</Link>
          <span>/</span>
          <span style={{ color: "#334155" }}>Report Preview</span>
        </div>
      </div>

      {/* ── Page header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent, marginBottom: 4 }}>PDF Report</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Report Preview</h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Scan #{id} · Generated PDF screening report.</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 12, border: "none",
              background: downloading ? "#94a3b8" : "#0f172a",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: downloading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {downloading ? "Downloading…" : "Download PDF"}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 24px" }}>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", color: "#dc2626", fontSize: 13 }}>{error}</div>
        </div>
      )}

      {/* ── Main grid ── */}
      {scan && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>

          {/* ── Left: summary card ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Diagnosis hero */}
            <div style={{
              borderRadius: 16, padding: "20px",
              background: isPneumonia ? "rgba(239,68,68,0.07)" : "rgba(34,197,94,0.07)",
              border: `1.5px solid ${isPneumonia ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent, marginBottom: 6 }}>Diagnosis</p>
              <p style={{ fontSize: 26, fontWeight: 900, color: accent, margin: 0 }}>{scan.predicted_label}</p>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Confidence: <strong style={{ color: accent }}>{confidencePct}%</strong></p>
            </div>

            {/* Metadata card */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", margin: 0 }}>Scan Metadata</p>
              <MetaRow label="Model" value={scan.model_version || "N/A"} />
              <MetaRow label="Preprocess" value={scan.preprocess_mode || "N/A"} />
              <MetaRow label="Normal Prob." value={`${((scan.normal_probability || 0) * 100).toFixed(2)}%`} valueColor="#16a34a" />
              <MetaRow label="Pneumonia Prob." value={`${((scan.pneumonia_probability || 0) * 100).toFixed(2)}%`} valueColor="#dc2626" />
              <MetaRow label="Date" value={new Date(scan.created_at).toLocaleString()} />
            </div>

            {/* Actions */}
            <Link
              to={`/scans/${id}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "10px 0", borderRadius: 12, border: "1px solid #e2e8f0",
                background: "#fff", color: "#334155", fontSize: 13, fontWeight: 600,
                textDecoration: "none", transition: "background 0.15s",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              View Scan Details
            </Link>
          </div>

          {/* ── Right: PDF preview ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>scan_report_{id}.pdf</span>
            </div>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title="PDF report preview"
                style={{ width: "100%", height: "75vh", border: "none", display: "block" }}
              />
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Preview unavailable.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
