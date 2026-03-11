import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import activityLogService from "../../services/activityLog.service";

const SOURCE_STYLES = {
  api: "bg-blue-100 text-blue-800",
  navigation: "bg-emerald-100 text-emerald-800",
  auth: "bg-amber-100 text-amber-800",
  manual: "bg-violet-100 text-violet-800",
  system: "bg-slate-200 text-slate-800",
};

const ROLE_STYLES = {
  superadmin: "bg-amber-100 text-amber-900",
  admin: "bg-blue-100 text-blue-900",
  creator: "bg-pink-100 text-pink-900",
  coach: "bg-teal-100 text-teal-900",
  student: "bg-slate-100 text-slate-800",
  viewer: "bg-slate-100 text-slate-800",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    source: "",
    role: "",
  });

  const loadLogs = async (page = 1, activeFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const response = await activityLogService.getAllActivityLogs(20, page, activeFilters);
      setLogs(Array.isArray(response?.data) ? response.data : []);
      setPagination(response?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load audit logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1, filters);
  }, []);

  const summary = useMemo(() => {
    const uniqueUsers = new Set(logs.map((log) => String(log?.adminId || ""))).size;
    const failedActions = logs.filter((log) => Number(log?.statusCode || 0) >= 400).length;
    return {
      total: pagination.total || logs.length,
      uniqueUsers,
      failedActions,
    };
  }, [logs, pagination.total]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    loadLogs(1, filters);
  };

  const handleReset = () => {
    const next = { search: "", source: "", role: "" };
    setFilters(next);
    loadLogs(1, next);
  };

  return (
    <SuperAdminLayout>
      <section className="p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
          <p className="mt-2 text-slate-600">
            Review saved user activity across the application.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Logs</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{summary.total}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Active Users</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">{summary.uniqueUsers}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Failed Actions</p>
            <p className="mt-2 text-3xl font-bold text-rose-700">{summary.failedActions}</p>
          </article>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <input
              type="text"
              value={filters.search}
              onChange={(event) => handleFilterChange("search", event.target.value)}
              placeholder="Search user, action, page"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
            />
            <select
              value={filters.source}
              onChange={(event) => handleFilterChange("source", event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
            >
              <option value="">All Sources</option>
              <option value="api">API</option>
              <option value="navigation">Navigation</option>
              <option value="auth">Auth</option>
              <option value="manual">Manual</option>
              <option value="system">System</option>
            </select>
            <select
              value={filters.role}
              onChange={(event) => handleFilterChange("role", event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="creator">Creator</option>
              <option value="coach">Coach</option>
              <option value="student">Student</option>
              <option value="viewer">Viewer</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleApplyFilters}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Apply
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Live Activity Feed</h2>
          </div>

          {error ? (
            <div className="px-6 py-8 text-sm text-rose-600">{error}</div>
          ) : loading ? (
            <div className="px-6 py-8 text-sm text-slate-500">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">No activity logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {logs.map((log) => (
                    <tr key={log._id} className="align-top">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{log.action || "-"}</div>
                        <div className="mt-1 text-xs text-slate-500">{log.details || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="font-medium text-slate-900">{log.adminName || "Unknown User"}</div>
                        <div>{log.adminEmail || "-"}</div>
                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_STYLES[log.role] || ROLE_STYLES.viewer}`}>
                          {log.role || "viewer"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${SOURCE_STYLES[log.source] || SOURCE_STYLES.system}`}>
                          {log.source || "manual"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{log.pageName || "-"}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div>{log.clientPath || "-"}</div>
                        <div className="mt-1">{log.route || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {log.statusCode ? (
                          <span className={`font-semibold ${log.statusCode >= 400 ? "text-rose-600" : "text-emerald-600"}`}>
                            {log.statusCode}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">
              Page {pagination.page || 1} of {pagination.totalPages || 1}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => loadLogs(Math.max(1, (pagination.page || 1) - 1), filters)}
                disabled={(pagination.page || 1) <= 1 || loading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => loadLogs(Math.min(pagination.totalPages || 1, (pagination.page || 1) + 1), filters)}
                disabled={(pagination.page || 1) >= (pagination.totalPages || 1) || loading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </SuperAdminLayout>
  );
};

export default AuditLogs;
