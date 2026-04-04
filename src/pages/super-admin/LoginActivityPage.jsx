import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import activityLogService from "../../services/activityLog.service";
import "./SuperAdminDataPages.css";

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

  const summary = useMemo(() => {
    const uniqueUsers = new Set(logs.map((log) => String(log?.adminId || log?.adminEmail || "")).filter(Boolean)).size;
    const latest = [...logs]
      .sort((left, right) => new Date(right?.createdAt || 0) - new Date(left?.createdAt || 0))[0];
    const superAdminLogins = logs.filter((log) => String(log?.role || "").toLowerCase() === "superadmin").length;

    return {
      total: logs.length,
      uniqueUsers,
      superAdminLogins,
      latestTime: latest?.createdAt ? formatDateTime(latest.createdAt) : "-",
    };
  }, [logs]);

  return (
    <SuperAdminLayout>
      <section className="super-admin-page">
        <header className="super-admin-page__header">
          <p className="super-admin-page__eyebrow">Authentication Monitoring</p>
          <h1 className="super-admin-page__title">Login Activity</h1>
          <p className="super-admin-page__description">
            Successful authentication events across the system.
          </p>
        </header>

        <div className="super-admin-page__stats">
          <article className="super-admin-page__stat super-admin-page__stat--blue">
            <p className="super-admin-page__stat-label">Sign-In Events</p>
            <p className="super-admin-page__stat-value">{summary.total}</p>
            <p className="super-admin-page__stat-helper">Saved authentication records</p>
          </article>
          <article className="super-admin-page__stat super-admin-page__stat--green">
            <p className="super-admin-page__stat-label">Unique Users</p>
            <p className="super-admin-page__stat-value">{summary.uniqueUsers}</p>
            <p className="super-admin-page__stat-helper">Distinct accounts in the current set</p>
          </article>
          <article className="super-admin-page__stat super-admin-page__stat--purple">
            <p className="super-admin-page__stat-label">Super Admin Logins</p>
            <p className="super-admin-page__stat-value">{summary.superAdminLogins}</p>
            <p className="super-admin-page__stat-helper">{summary.latestTime}</p>
          </article>
        </div>

        <div className="super-admin-page__panel">
          <div className="super-admin-page__panel-head">
            <div>
              <h2 className="super-admin-page__panel-title">Authentication Feed</h2>
              <p className="super-admin-page__panel-copy">
                Recent login events with account, role, source IP, and recorded details.
              </p>
            </div>
          </div>

          {error ? (
            <div className="super-admin-page__state super-admin-page__state--error">{error}</div>
          ) : loading ? (
            <div className="super-admin-page__state">Loading login events...</div>
          ) : logs.length === 0 ? (
            <div className="super-admin-page__state">No login activity found.</div>
          ) : (
            <div className="super-admin-page__table-wrap">
              <table className="super-admin-page__table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>IP Address</th>
                    <th>Details</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <span className="super-admin-page__cell-title">{log.adminName || "Unknown User"}</span>
                        <span className="super-admin-page__cell-copy">{log.adminEmail || "-"}</span>
                      </td>
                      <td>
                        <span className="super-admin-page__pill super-admin-page__pill--amber">{log.role || "-"}</span>
                      </td>
                      <td>
                        <span className="super-admin-page__cell-title">{log.ipAddress || "-"}</span>
                        <span className="super-admin-page__cell-copy">Recorded client IP</span>
                      </td>
                      <td>
                        <span className="super-admin-page__cell-copy">{log.details || log.action || "-"}</span>
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
        </div>
      </section>
    </SuperAdminLayout>
  );
};

export default LoginActivityPage;
