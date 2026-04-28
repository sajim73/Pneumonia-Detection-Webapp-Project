import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUploadScan from "../hooks/useUploadScan";
import { getReadableFileSize, isValidImageFile } from "../utils/fileHelpers";

export default function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState("");
  const { uploading, progress, result, error, uploadScan, resetUpload } = useUploadScan();

  const selectFile = (selected) => {
    resetUpload();
    setLocalError("");
    if (!selected) return;
    if (!isValidImageFile(selected)) {
      setFile(null);
      setPreview(null);
      setLocalError("Please select a PNG, JPG, or JPEG chest X-ray image.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleFileChange = (e) => selectFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    selectFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setLocalError("Please choose an image first."); return; }
    try {
      const data = await uploadScan(file, true);
      navigate("/results", { state: { result: data } });
    } catch { /* handled by hook */ }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Upload Chest X-Ray</h1>
        <p className="page-subtitle">
          Upload one image to run pneumonia screening and Grad-CAM visualization.
        </p>
      </div>

      <div style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Drop zone */}
          <div
            className={`drop-zone${dragOver ? " drag-over" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <span className="drop-zone-icon">🫁</span>
            <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: "0.3rem" }}>
              {file ? "Change image" : "Drop X-ray here"}
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              or click to browse &mdash; PNG, JPG, JPEG
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* File preview */}
          {file && (
            <div className="file-preview">
              {preview && (
                <img
                  src={preview}
                  alt="X-ray preview"
                  style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                />
              )}
              <div className="file-preview-icon" style={{ display: preview ? "none" : "flex" }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }} className="truncate">
                  {file.name}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{getReadableFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setFile(null); setPreview(null); resetUpload(); }}
              >
                Remove
              </button>
            </div>
          )}

          {/* Errors */}
          {(localError || error) && (
            <div className="alert alert-error">
              <span>⚠</span> {localError || error}
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.4rem" }}>
                <span>Uploading and analysing…</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={uploading || !file}
            style={{ fontSize: "1rem", padding: "0.8rem" }}
          >
            {uploading ? "Processing scan…" : "🔬 Run Scan"}
          </button>
        </form>

        {result?.scan_id && (
          <div className="alert alert-success" style={{ marginTop: "1rem" }}>
            <span>✅</span> Scan #{result.scan_id} saved successfully.
          </div>
        )}

        <div className="alert alert-warning" style={{ marginTop: "1.25rem", fontSize: "0.82rem" }}>
          <span>⚕️</span>
          <span>This tool is a screening aid only and is not a clinical diagnosis. Always consult a qualified clinician.</span>
        </div>
      </div>
    </div>
  );
}
