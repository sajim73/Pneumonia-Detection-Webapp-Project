import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminScans() {
  const [scans, setScans] = useState([]);
  const [query, setQuery] = useState("");
  const [labelFilter, setLabelFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScans = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/admin/scans");
        setScans(data.scans || []);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load scan list");
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      const matchesLabel =
        labelFilter === "all" ? true : scan.predicted_label === labelFilter;

      const search = query.trim().toLowerCase();
      const matchesQuery =
        !search ||
        String(scan.id).includes(search) ||
        String(scan.user_id).includes(search) ||
        scan.predicted_label?.toLowerCase().includes(search) ||
        scan.original_filename?.toLowerCase().includes(search);

      return matchesLabel && matchesQuery;
    });
  }, [scans, query, labelFilter]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading scans..." />;
  }

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h2 className="page-title">Submitted Scans</h2>
        <p className="page-subtitle">
          Review all saved scans, model results, and downloadable reports.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="label">Search by scan ID, user ID, label, or filename</label>
            <input
              type="text"
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search scans..."
            />
          </div>

          <div>
            <label className="label">Filter by result</label>
            <select
              className="input"
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
            >
              <option value="all">All results</option>
              <option value="Pneumonia">Pneumonia</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 card overflow-hidden">
        {filteredScans.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No scans match the current filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Scan ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">User ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Filename</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Result</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Confidence</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredScans.map((scan) => (
                  <tr key={scan.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-sm text-slate-700">#{scan.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">#{scan.user_id}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {scan.original_filename || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          scan.predicted_label === "Pneumonia"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {scan.predicted_label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {(scan.confidence * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {scan.created_at
                        ? new Date(scan.created_at).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/scans/${scan.id}`} className="btn-secondary">
                          Details
                        </Link>
                        <Link to={`/reports/${scan.id}`} className="btn-primary">
                          Report
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
