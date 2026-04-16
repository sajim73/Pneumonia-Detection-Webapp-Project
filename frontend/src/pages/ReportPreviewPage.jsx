import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ReportPage() {
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
          api.get(`/scan/${id}/report`, {
            responseType: "blob"
          })
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

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/scan/${id}/report`, {
        responseType: "blob"
      });

      const blobUrl = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );

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

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading report preview..." />;
  }

  if (error) {
    return (
      <div className="container-page py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="page-title">Report Preview</h2>
          <p className="page-subtitle">
            Preview and download the PDF report for scan #{scan?.id}.
          </p>
        </div>

        <button onClick={handleDownload} className="btn-primary" disabled={downloading}>
          {downloading ? "Downloading..." : "Download PDF"}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold">Prediction:</span> {scan?.predicted_label}</p>
            <p><span className="font-semibold">Confidence:</span> {(scan?.confidence * 100).toFixed(2)}%</p>
            <p><span className="font-semibold">Model:</span> {scan?.model_version || "N/A"}</p>
            <p><span className="font-semibold">Preprocess:</span> {scan?.preprocess_mode || "N/A"}</p>
            <p><span className="font-semibold">Date:</span> {new Date(scan?.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="card p-2 xl:col-span-2">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="PDF report preview"
              className="h-[75vh] w-full rounded-lg"
            />
          ) : (
            <div className="p-6 text-sm text-slate-500">Preview unavailable.</div>
          )}
        </div>
      </div>
    </div>
  );
}
