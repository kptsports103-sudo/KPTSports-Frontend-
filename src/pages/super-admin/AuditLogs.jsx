import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import activityLogService from "../../services/activityLog.service";
import "./SuperAdminDataPages.css";

const SOURCE_STYLES = {
  api: "super-admin-page__pill super-admin-page__pill--blue",
  navigation: "super-admin-page__pill super-admin-page__pill--green",
  auth: "super-admin-page__pill super-admin-page__pill--amber",
  manual: "super-admin-page__pill super-admin-page__pill--violet",
  system: "super-admin-page__pill super-admin-page__pill--slate",
};

const ROLE_STYLES = {
  superadmin: "super-admin-page__pill super-admin-page__pill--amber",
  admin: "super-admin-page__pill super-admin-page__pill--blue",
  creator: "super-admin-page__pill super-admin-page__pill--violet",
  coach: "super-admin-page__pill super-admin-page__pill--green",
  student: "super-admin-page__pill super-admin-page__pill--slate",
  viewer: "super-admin-page__pill super-admin-page__pill--slate",
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
      <section className="super-admin-page">
        <header className="super-admin-page__header">
          <p className="super-admin-page__eyebrow">System Oversight</p>
          <h1 className="super-admin-page__title">Audit Logs</h1>
          <p className="super-admin-page__description">
            Review saved user activity across the application.
          </p>
        </header>

        <div className="super-admin-page__stats">
          <article className="super-admin-page__stat super-admin-page__stat--blue">
            <p className="super-admin-page__stat-label">Total Logs</p>
            <p className="super-admin-page__stat-value">{summary.total}</p>
            <p className="super-admin-page__stat-helper">Tracked system actions</p>
          </article>
          <article className="super-admin-page__stat super-admin-page__stat--green">
            <p className="super-admin-page__stat-label">Active Users</p>
            <p className="super-admin-page__stat-value">{summary.uniqueUsers}</p>
            <p className="super-admin-page__stat-helper">Distinct users in current page set</p>
          </article>
          <article className="super-admin-page__stat super-admin-page__stat--amber">
            <p className="super-admin-page__stat-label">Failed Actions</p>
            <p className="super-admin-page__stat-value">{summary.failedActions}</p>
            <p className="super-admin-page__stat-helper">Responses with error codes</p>
          </article>
        </div>

        <div className="super-admin-page__filters">
          <input
            id="audit-logs-search"
            name="auditLogsSearch"
            type="text"
            value={filters.search}
            onChange={(event) => handleFilterChange("search", event.target.value)}
            placeholder="Search user, action, page"
            className="super-admin-page__field"
          />
          <select
            id="audit-logs-source"
            name="auditLogsSource"
            value={filters.source}
            onChange={(event) => handleFilterChange("source", event.target.value)}
            className="super-admin-page__field"
          >
            <option value="">All Sources</option>
            <option value="api">API</option>
            <option value="navigation">Navigation</option>
            <option value="auth">Auth</option>
            <option value="manual">Manual</option>
            <option value="system">System</option>
          </select>
          <select
            id="audit-logs-role"
            name="auditLogsRole"
            value={filters.role}
            onChange={(event) => handleFilterChange("role", event.target.value)}
            className="super-admin-page__field"
          >
            <option value="">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="creator">Creator</option>
            <option value="coach">Coach</option>
            <option value="student">Student</option>
            <option value="viewer">Viewer</option>
          </select>
          <div className="super-admin-page__actions">
            <button onClick={handleApplyFilters} className="super-admin-page__button">
              Apply
            </button>
            <button onClick={handleReset} className="super-admin-page__button super-admin-page__button--secondary">
              Reset
            </button>
          </div>
        </div>

        <div className="super-admin-page__panel">
          <div className="super-admin-page__panel-head">
            <div>
              <h2 className="super-admin-page__panel-title">Live Activity Feed</h2>
              <p className="super-admin-page__panel-copy">
                Structured user actions, routes, and operational outcomes across protected pages.
              </p>
            </div>
          </div>

          {error ? (
            <div className="super-admin-page__state super-admin-page__state--error">{error}</div>
          ) : loading ? (
            <div className="super-admin-page__state">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="super-admin-page__state">No activity logs found.</div>
          ) : (
            <div className="super-admin-page__table-wrap">
              <table className="super-admin-page__table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>User</th>
                    <th>Source</th>
                    <th>Page</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <span className="super-admin-page__cell-title">{log.action || "-"}</span>
                        <span className="super-admin-page__cell-copy">{log.details || "-"}</span>
                      </td>
                      <td>
                        <span className="super-admin-page__cell-title">{log.adminName || "Unknown User"}</span>
                        <span className="super-admin-page__cell-copy">{log.adminEmail || "-"}</span>
                        <span className={ROLE_STYLES[log.role] || ROLE_STYLES.viewer}>
                          {log.role || "viewer"}
                        </span>
                      </td>
                      <td>
                        <span className={SOURCE_STYLES[log.source] || SOURCE_STYLES.system}>
                          {log.source || "manual"}
                        </span>
                      </td>
                      <td>
                        <span className="super-admin-page__cell-title">{log.pageName || "-"}</span>
                      </td>
                      <td>
                        <span className="super-admin-page__cell-copy super-admin-page__cell-copy--mono">
                          {log.clientPath || "-"}
                        </span>
                        <span className="super-admin-page__cell-copy super-admin-page__cell-copy--mono">
                          {log.route || "-"}
                        </span>
                      </td>
                      <td>
                        {log.statusCode ? (
                          <span
                            className={
                              log.statusCode >= 400
                                ? "super-admin-page__pill super-admin-page__pill--rose"
                                : "super-admin-page__pill super-admin-page__pill--green"
                            }
                          >
                            {log.statusCode >= 400 ? `Error ${log.statusCode}` : `OK ${log.statusCode}`}
                          </span>
                        ) : (
                          <span className="super-admin-page__pill super-admin-page__pill--slate">Pending</span>
                        )}
                      </td>
                      <td>
                        <span className="super-admin-page__cell-title">{formatDateTime(log.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="super-admin-page__table-footer">
            <p className="super-admin-page__table-footer-copy">
              Page {pagination.page || 1} of {pagination.totalPages || 1}
            </p>
            <div className="super-admin-page__actions">
              <button
                onClick={() => loadLogs(Math.max(1, (pagination.page || 1) - 1), filters)}
                disabled={(pagination.page || 1) <= 1 || loading}
                className="super-admin-page__button super-admin-page__button--secondary"
              >
                Previous
              </button>
              <button
                onClick={() => loadLogs(Math.min(pagination.totalPages || 1, (pagination.page || 1) + 1), filters)}
                disabled={(pagination.page || 1) >= (pagination.totalPages || 1) || loading}
                className="super-admin-page__button super-admin-page__button--secondary"
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
