import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state?.result || null);

  useEffect(() => {
    if (!location.state?.result) {
      const stored = localStorage.getItem("lastScanResult");
      if (stored) {
        setResult(JSON.parse(stored));
      }
    }
  }, [location.state]);

  if (!result) {
    return (
      <div className="container-page py-8">
        <div className="card p-6">
          <h2 className="page-title">No result available</h2>
          <p className="page-subtitle">
            Please upload a scan first.
          </p>
          <button onClick={() => navigate("/upload")} className="btn-primary mt-6">
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  const prediction = result.prediction;
  const files = result.files;
  const scanId = result.scan_id || result.scan?.id;

  return (
    <div className="container-page py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="page-title">Scan Results</h2>
          <p className="page-subtitle">
            Review the classification result, confidence, and heatmap overlay.
          </p>
        </div>

        <div
          className={`badge ${
            prediction.predicted_label === "Pneumonia"
              ? "badge-warning"
              : "badge-success"
          }`}
        >
          {prediction.predicted_label}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">Prediction Summary</h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Predicted label</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {prediction.predicted_label}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Confidence</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {(prediction.confidence * 100).toFixed(2)}%
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Normal probability</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">
                {(prediction.normal_probability * 100).toFixed(2)}%
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Pneumonia probability</p>
              <p className="mt-1 text-xl font-bold text-amber-700">
                {(prediction.pneumonia_probability * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This output is a screening aid only and must be reviewed by a qualified clinician.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/upload" className="btn-secondary">
              Upload Another Scan
            </Link>

            <Link to="/history" className="btn-secondary">
              View History
            </Link>

            {scanId && (
              <>
                <Link to={`/scans/${scanId}`} className="btn-secondary">
                  Open Scan Detail
                </Link>
                <Link to={`/reports/${scanId}`} className="btn-primary">
                  Open Report Page
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900">Original X-ray</h3>
            <img
              src={files.image_url}
              alt="Uploaded chest x-ray"
              className="mt-4 w-full rounded-lg border border-slate-200 object-contain"
            />
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900">Grad-CAM Overlay</h3>
            <img
              src={files.overlay_url}
              alt="Grad-CAM overlay"
              className="mt-4 w-full rounded-lg border border-slate-200 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
