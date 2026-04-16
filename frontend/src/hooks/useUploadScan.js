import { useState } from "react";
import api from "../api/axios";

export default function useUploadScan() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const uploadScan = async (file, saveScan = true) => {
    setUploading(true);
    setProgress(0);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("save_scan", String(saveScan));

      const response = await api.post("/scan/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        }
      });

      setResult(response.data);
      setProgress(100);
      return response.data;
    } catch (err) {
      const message =
        err?.response?.data?.error || "Upload failed. Please try again.";
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setUploading(false);
    setProgress(0);
    setResult(null);
    setError("");
  };

  return {
    uploading,
    progress,
    result,
    error,
    uploadScan,
    resetUpload
  };
}
