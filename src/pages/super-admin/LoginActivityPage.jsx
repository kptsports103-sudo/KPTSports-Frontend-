import { useEffect, useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import activityLogService from "../../services/activityLog.service";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const LoginActivityPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await activityLogService.getAllActivityLogs(50, 1, { source: "auth" });
        setLogs(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load login activity.");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <SuperAdminLayout>
      <section className="p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Login Activity</h1>
          <p className="mt-2 text-slate-600">
            Successful authentication events across the system.
          </p>
        </header>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {error ? (
            <div className="px-6 py-8 text-sm text-rose-600">{error}</div>
          ) : loading ? (
            <div className="px-6 py-8 text-sm text-slate-500">Loading login events...</div>
          ) : logs.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">No login activity found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="font-semibold text-slate-900">{log.adminName || "Unknown User"}</div>
                        <div>{log.adminEmail || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{log.role || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{log.ipAddress || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{log.details || log.action || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </SuperAdminLayout>
  );
};

export default LoginActivityPage;
