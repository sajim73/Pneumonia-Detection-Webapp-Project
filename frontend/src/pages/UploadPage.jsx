import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [saveScan, setSaveScan] = useState(true);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage(file ? "Upload successful: file selected." : "");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please choose an X-ray image first.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");
    setProgress(0);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("save_scan", saveScan ? "true" : "false");

    try {
      const { data } = await api.post("/scan/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        }
      });

      localStorage.setItem("lastScanResult", JSON.stringify(data));
      navigate("/results", { state: { result: data } });
    } catch (err) {
      setError(err?.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h2 className="page-title">Upload Chest X-ray</h2>
        <p className="page-subtitle">
          Select a PNG, JPG, or JPEG chest X-ray image and run the model.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-teal-500"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-lg font-semibold text-slate-800">
                Click to choose an X-ray image
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Supported formats: PNG, JPG, JPEG
              </p>
              {selectedFile && (
                <p className="mt-4 text-sm font-medium text-teal-700">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                id="save_scan"
                type="checkbox"
                checked={saveScan}
                onChange={(e) => setSaveScan(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-700"
              />
              <label htmlFor="save_scan" className="text-sm text-slate-700">
                Save this scan to history
              </label>
            </div>

            {uploading && (
              <div>
                <div className="mb-2 flex justify-between text-sm text-slate-600">
                  <span>Processing scan...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-teal-700 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? "Running inference..." : "Process Scan"}
            </button>
          </form>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-slate-900">Flow</h3>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li>1. Upload a chest X-ray image.</li>
            <li>2. The backend preprocesses the image.</li>
            <li>3. The model predicts Normal or Pneumonia.</li>
            <li>4. Grad-CAM overlay is generated.</li>
            <li>5. Result can be saved and downloaded as PDF.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
