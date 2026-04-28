import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUploadScan from "../hooks/useUploadScan";
import { getReadableFileSize, isValidImageFile } from "../utils/fileHelpers";

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState("");
  const { uploading, progress, result, error, uploadScan, resetUpload } = useUploadScan();

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    resetUpload();
    setLocalError("");

    if (!selected) return;

    if (!isValidImageFile(selected)) {
      setFile(null);
      setLocalError("Please select a PNG, JPG, or JPEG chest X-ray image.");
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setLocalError("Please choose an image first.");
      return;
    }

    try {
      const data = await uploadScan(file, true);
      navigate("/results", { state: { result: data } });
    } catch {
      // handled by hook state
    }
  };

  return (
    <div className="container-page py-8">
      <div className="mb-8">
         <h2 className="page-title">Scanning Tool</h2>
        <p className="page-title-subheading">Upload Chest X-ray</p>
        
      </div>

        <div className="card outerDiv">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">X-ray Image</label>
              <input
                className="input"
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={handleFileChange}
              />
            </div>

            

            {file && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">{file.name}</p>
                <p className="mt-1 text-sm text-slate-500">{getReadableFileSize(file.size)}</p>
              </div>
            )}

            {(localError || error) && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {localError || error}
              </div>
            )}

            {uploading && (
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Uploading and processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            <p className="page-subtitle">
            Select one X-ray image to run pneumonia screening and Grad-CAM visualization.
            </p>

            <button type="submit" className="btn-primary-scan" disabled={uploading}>
              {uploading ? "Processing..." : "Run Scan Tool"}
            </button>
          </form>

          {result?.scan_id && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Upload successful. Scan #{result.scan_id} has been saved.
            </div>
          )}

        </div>
    </div>
  );
}
