import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import "./SuperAdminDataPages.css";

const AbuseLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Placeholder - replace with real API call
    setLogs([
      { _id: 1, ip: "192.168.1.1", route: "/api/users", count: 100, detectedAt: "2026-04-01T05:30:00Z" },
      { _id: 2, ip: "192.168.1.2", route: "/api/media", count: 50, detectedAt: "2026-04-02T05:30:00Z" },
      { _id: 3, ip: "192.168.1.7", route: "/api/results/export", count: 28, detectedAt: "2026-04-03T08:10:00Z" },
    ]);
  }, []);

  const summary = useMemo(() => {
    const totalRequests = logs.reduce((sum, item) => sum + Number(item?.count || 0), 0);
    const peak = logs.reduce(
      (current, item) => (Number(item?.count || 0) > Number(current?.count || 0) ? item : current),
      null
    );
    const latest = [...logs]
      .sort((left, right) => new Date(right?.detectedAt || 0) - new Date(left?.detectedAt || 0))[0];

    return {
      totalEvents: logs.length,
      totalRequests,
      peakCount: peak?.count || 0,
      latestTime: latest?.detectedAt ? new Date(latest.detectedAt).toLocaleString() : "-",
    };
  }, [logs]);

  const getSeverityClass = (count) => {
    if (count >= 80) return "super-admin-page__pill super-admin-page__pill--rose";
    if (count >= 40) return "super-admin-page__pill super-admin-page__pill--amber";
    return "super-admin-page__pill super-admin-page__pill--blue";
  };

  const getSeverityLabel = (count) => {
    if (count >= 80) return "Critical";
    if (count >= 40) return "High";
    return "Medium";
  };

  return (
    <SuperAdminLayout>
      <section className="super-admin-page">
        <header className="super-admin-page__header">
          <p className="super-admin-page__eyebrow">Security Monitoring</p>
          <h1 className="super-admin-page__title">Abuse Logs</h1>
          <p className="super-admin-page__description">
            Review flagged routes and suspicious request spikes.
          </p>
        </header>

        <div className="super-admin-page__stats">
          <article className="super-admin-page__stat super-admin-page__stat--blue">
            <p className="super-admin-page__stat-label">Flagged Events</p>
            <p className="super-admin-page__stat-value">{summary.totalEvents}</p>
            <p className="super-admin-page__stat-helper">Detected abuse patterns</p>
          </article>
          <article className="super-admin-page__stat super-admin-page__stat--amber">
            <p className="super-admin-page__stat-label">Suspicious Requests</p>
            <p className="super-admin-page__stat-value">{summary.totalRequests}</p>
            <p className="super-admin-page__stat-helper">Combined requests across flagged routes</p>
          </article>
          <article className="super-admin-page__stat super-admin-page__stat--purple">
            <p className="super-admin-page__stat-label">Peak Route</p>
            <p className="super-admin-page__stat-value">{summary.peakCount}</p>
            <p className="super-admin-page__stat-helper">{summary.latestTime}</p>
          </article>
        </div>

        <div className="super-admin-page__panel">
          <div className="super-admin-page__panel-head">
            <div>
              <h2 className="super-admin-page__panel-title">Flagged Routes</h2>
              <p className="super-admin-page__panel-copy">
                High-frequency endpoints and suspicious request volumes recorded by the monitoring layer.
              </p>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="super-admin-page__state">No abuse events detected.</div>
          ) : (
            <div className="super-admin-page__table-wrap">
              <table className="super-admin-page__table">
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>Route</th>
                    <th>Requests</th>
                    <th>Severity</th>
                    <th>Detected At</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <span className="super-admin-page__cell-title">{log.ip}</span>
                        <span className="super-admin-page__cell-copy">Origin address</span>
                      </td>
                      <td>
                        <span className="super-admin-page__cell-title">{log.route}</span>
                        <span className="super-admin-page__cell-copy">Flagged API endpoint</span>
                      </td>
                      <td>
                        <span className="super-admin-page__cell-title">{log.count}</span>
                        <span className="super-admin-page__cell-copy">Requests captured</span>
                      </td>
                      <td>
                        <span className={getSeverityClass(log.count)}>{getSeverityLabel(log.count)}</span>
                      </td>
                      <td>
                        <span className="super-admin-page__cell-title">
                          {new Date(log.detectedAt).toLocaleDateString()}
                        </span>
                        <span className="super-admin-page__cell-copy">
                          {new Date(log.detectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
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

export default AbuseLogs;
