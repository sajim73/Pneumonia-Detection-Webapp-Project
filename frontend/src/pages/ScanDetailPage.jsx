import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ScanDetailPage() {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const { data } = await api.get(`/scan/${id}`);
        setScan(data.scan);
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load scan");
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading scan details..." />;
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

  if (!scan) return null;

  return (
    <div className="container-page py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="page-title">Scan Detail #{scan.id}</h2>
          <p className="page-subtitle">
            Full detail for this saved scan record.
          </p>
        </div>

        <Link to={`/reports/${scan.id}`} className="btn-primary">
          Open Report
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Prediction</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {scan.predicted_label}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Confidence</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {(scan.confidence * 100).toFixed(2)}%
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Normal</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">
                {((scan.normal_probability || 0) * 100).toFixed(2)}%
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Pneumonia</p>
              <p className="mt-1 text-lg font-semibold text-amber-700">
                {((scan.pneumonia_probability || 0) * 100).toFixed(2)}%
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 sm:col-span-2">
              <p className="text-sm text-slate-500">Metadata</p>
              <p className="mt-1 text-sm text-slate-700">
                Model: {scan.model_version || "N/A"}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Preprocess: {scan.preprocess_mode || "N/A"}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Grad-CAM layer: {scan.gradcam_layer || "N/A"}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Created: {new Date(scan.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900">Original X-ray</h3>
            <img
              src={scan.image_url}
              alt="Original x-ray"
              className="mt-4 w-full rounded-lg border border-slate-200 object-contain"
            />
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900">Heatmap Overlay</h3>
            <img
              src={scan.overlay_url}
              alt="Heatmap overlay"
              className="mt-4 w-full rounded-lg border border-slate-200 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
