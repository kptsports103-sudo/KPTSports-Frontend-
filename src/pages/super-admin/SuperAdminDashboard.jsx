import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, CalendarDays, LogIn, Users } from "lucide-react";
import SuperAdminLayout from "./SuperAdminLayout";
import MediaPerformanceCard from "./MediaPerformanceCard";
import MediaHeatmap from "./MediaHeatmap";
import activityLogService from "../../services/activityLog.service";
import "./SuperAdminDashboard.css";

const quickLinks = [
  { to: "/admin/iam/users", label: "Manage IAM Users" },
  { to: "/admin/users-manage", label: "Users Management" },
  { to: "/admin/audit-logs", label: "Audit Logs" },
  { to: "/admin/errors", label: "Error Dashboard" },
  { to: "/admin/media-stats", label: "Media Stats" },
  { to: "/admin/login-activity", label: "Login Activity" },
  { to: "/admin/approvals", label: "Approvals" },
  { to: "/admin/abuse-logs", label: "Abuse Logs" },
];

const SOURCE_LABELS = {
  api: "API",
  navigation: "Navigation",
  auth: "Authentication",
  manual: "Manual",
  system: "System",
};

const formatMetric = (value) => new Intl.NumberFormat("en-IN").format(Number(value || 0));

const parseSafeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatLogTime = (value) => {
  const date = parseSafeDate(value);
  if (!date) return { time: "-", day: "" };
  return {
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    day: date.toLocaleDateString([], { month: "short", day: "numeric" }),
  };
};

const getStatusMeta = (log) => {
  const statusCode = Number(log?.statusCode || 0);
  if (statusCode >= 400) {
    return { label: "Review", tone: "warning" };
  }
  if (String(log?.source || "").trim() === "auth") {
    return { label: "Secure", tone: "success" };
  }
  if (String(log?.source || "").trim() === "navigation") {
    return { label: "Tracked", tone: "info" };
  }
  return { label: "Healthy", tone: "neutral" };
};

const SuperAdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await activityLogService.getAllActivityLogs(50, 1);
        const nextLogs = Array.isArray(response?.data) ? response.data : [];
        setLogs(nextLogs);
        setTotalLogs(Number(response?.pagination?.total || nextLogs.length || 0));
      } catch (loadError) {
        console.error("Failed to load dashboard activity logs:", loadError);
        setError(loadError?.response?.data?.message || "Unable to load dashboard activity right now.");
        setLogs([]);
        setTotalLogs(0);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const dashboardData = useMemo(() => {
    const todayKey = new Date().toDateString();
    const sourceCounts = new Map();
    const pageCounts = new Map();
    const uniqueUsers = new Set();
    let todayCount = 0;
    let loginCount = 0;
    let failedActions = 0;

    logs.forEach((log) => {
      const adminId = String(log?.adminId || "").trim();
      const source = String(log?.source || "system").trim() || "system";
      const pageName = String(log?.pageName || "Unknown Page").trim() || "Unknown Page";
      const createdAt = parseSafeDate(log?.createdAt);

      if (adminId) uniqueUsers.add(adminId);
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
      pageCounts.set(pageName, (pageCounts.get(pageName) || 0) + 1);

      if (source === "auth") {
        loginCount += 1;
      }
      if (Number(log?.statusCode || 0) >= 400) {
        failedActions += 1;
      }
      if (createdAt && createdAt.toDateString() === todayKey) {
        todayCount += 1;
      }
    });

    const topSources = [...sourceCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([key, count]) => ({
        key,
        label: SOURCE_LABELS[key] || key,
        count,
      }));

    const topPages = [...pageCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([label, count]) => ({ label, count }));

    const queueItems = [];
    if (failedActions > 0) {
      queueItems.push({
        to: "/admin/errors",
        label: `${failedActions} failed actions need review`,
        description: "Inspect unresolved requests and application errors.",
        tone: "warning",
      });
    }
    if (loginCount > 0) {
      queueItems.push({
        to: "/admin/login-activity",
        label: `${loginCount} authentication events recorded`,
        description: "Review recent sign-ins and privileged access activity.",
        tone: "info",
      });
    }
    if (topPages[0]) {
      queueItems.push({
        to: "/admin/audit-logs",
        label: `${topPages[0].label} has the highest activity`,
        description: `${topPages[0].count} recent actions were recorded for this module.`,
        tone: "neutral",
      });
    }
    if (queueItems.length === 0) {
      queueItems.push(
        {
          to: "/admin/audit-logs",
          label: "Open the audit trail",
          description: "Review the latest platform activity once new logs arrive.",
          tone: "neutral",
        },
        {
          to: "/admin/login-activity",
          label: "Check login activity",
          description: "Monitor sign-ins and access patterns for protected areas.",
          tone: "info",
        }
      );
    }

    return {
      uniqueUserCount: uniqueUsers.size,
      todayCount,
      loginCount,
      failedActions,
      topSources,
      topPages,
      queueItems: queueItems.slice(0, 3),
      recentLogs: logs.slice(0, 6),
    };
  }, [logs]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Activity Logs",
        value: formatMetric(totalLogs || logs.length),
        helper: "All recorded actions",
        tone: "blue",
        Icon: Activity,
      },
      {
        title: "Today",
        value: formatMetric(dashboardData.todayCount),
        helper: "Actions captured today",
        tone: "green",
        Icon: CalendarDays,
      },
      {
        title: "Active Users",
        value: formatMetric(dashboardData.uniqueUserCount),
        helper: "Unique admins and operators",
        tone: "amber",
        Icon: Users,
      },
      {
        title: "Login Events",
        value: formatMetric(dashboardData.loginCount),
        helper: "Authentication activity",
        tone: "purple",
        Icon: LogIn,
      },
    ],
    [dashboardData.loginCount, dashboardData.todayCount, dashboardData.uniqueUserCount, logs.length, totalLogs]
  );

  const maxSourceCount = Math.max(...dashboardData.topSources.map((item) => item.count), 1);
  const statusLabel = loading ? "Syncing Logs" : error ? "Data Delayed" : "Live Logs";

  return (
    <SuperAdminLayout>
      <section className="super-admin-dashboard">
        <div className="super-admin-dashboard__orb super-admin-dashboard__orb--one" aria-hidden="true" />
        <div className="super-admin-dashboard__orb super-admin-dashboard__orb--two" aria-hidden="true" />
        <div className="super-admin-dashboard__orb super-admin-dashboard__orb--three" aria-hidden="true" />

        <div className="super-admin-dashboard__surface">
          <header className="super-admin-dashboard__hero">
            <div>
              <p className="super-admin-dashboard__eyebrow">Super Admin Dashboard / Log Viewer</p>
              <h1>System activity, response counts, and platform oversight</h1>
              <p className="super-admin-dashboard__hero-copy">
                Monitor recorded actions, review high-priority signals, and open core supervision
                tools from one control surface.
              </p>
            </div>
            <span className="super-admin-dashboard__hero-status">{statusLabel}</span>
          </header>

          <div className="super-admin-dashboard__metrics">
            {summaryCards.map((card) => {
              const Icon = card.Icon;
              return (
                <article
                  key={card.title}
                  className={`super-admin-dashboard__metric super-admin-dashboard__metric--${card.tone}`}
                >
                  <div className="super-admin-dashboard__metric-icon">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <p className="super-admin-dashboard__metric-title">{card.title}</p>
                  <p className="super-admin-dashboard__metric-value">{card.value}</p>
                  <p className="super-admin-dashboard__metric-helper">{card.helper}</p>
                </article>
              );
            })}
          </div>

          <div className="super-admin-dashboard__main-grid">
            <section className="super-admin-dashboard__panel super-admin-dashboard__panel--logs">
              <div className="super-admin-dashboard__panel-head">
                <div>
                  <h2>Recent Activity Logs</h2>
                  <p>Structured visibility into user actions, pages, and operational status.</p>
                </div>
                <Link to="/admin/audit-logs" className="super-admin-dashboard__panel-link">
                  View All Logs
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              {error ? (
                <div className="super-admin-dashboard__state super-admin-dashboard__state--error">
                  {error}
                </div>
              ) : loading ? (
                <div className="super-admin-dashboard__state">Loading recent activity...</div>
              ) : dashboardData.recentLogs.length === 0 ? (
                <div className="super-admin-dashboard__state">No activity has been logged yet.</div>
              ) : (
                <div className="super-admin-dashboard__log-table">
                  <div className="super-admin-dashboard__log-head">
                    <span>Time</span>
                    <span>Activity</span>
                    <span>Page</span>
                    <span>Status</span>
                  </div>

                  <div className="super-admin-dashboard__log-body">
                    {dashboardData.recentLogs.map((log) => {
                      const timeInfo = formatLogTime(log?.createdAt);
                      const status = getStatusMeta(log);
                      const sourceLabel = SOURCE_LABELS[String(log?.source || "system").trim()] || "System";
                      return (
                        <article key={log._id} className="super-admin-dashboard__log-row">
                          <div className="super-admin-dashboard__log-time">
                            <strong>{timeInfo.time}</strong>
                            <span>{timeInfo.day}</span>
                          </div>
                          <div className="super-admin-dashboard__log-activity">
                            <p>{log?.action || "Recorded Activity"}</p>
                            <span>
                              {log?.adminName || "Unknown User"} ({log?.role || "viewer"}) •{" "}
                              {log?.details || sourceLabel}
                            </span>
                          </div>
                          <div className="super-admin-dashboard__log-page">
                            <p>{log?.pageName || "Unknown Page"}</p>
                            <span>{sourceLabel}</span>
                          </div>
                          <div
                            className={`super-admin-dashboard__status-pill super-admin-dashboard__status-pill--${status.tone}`}
                          >
                            {status.label}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <div className="super-admin-dashboard__stack">
              <section className="super-admin-dashboard__panel">
                <div className="super-admin-dashboard__panel-head super-admin-dashboard__panel-head--compact">
                  <div>
                    <h2>Source Overview</h2>
                    <p>Top monitored channels from recent platform activity.</p>
                  </div>
                </div>

                {dashboardData.topSources.length === 0 ? (
                  <div className="super-admin-dashboard__state">Source metrics will appear here.</div>
                ) : (
                  <div className="super-admin-dashboard__progress-list">
                    {dashboardData.topSources.map((item) => (
                      <div key={item.key} className="super-admin-dashboard__progress-item">
                        <div className="super-admin-dashboard__progress-meta">
                          <span>{item.label}</span>
                          <strong>{formatMetric(item.count)}</strong>
                        </div>
                        <div className="super-admin-dashboard__progress-track">
                          <span
                            className="super-admin-dashboard__progress-fill"
                            style={{ width: `${(item.count / maxSourceCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="super-admin-dashboard__panel">
                <div className="super-admin-dashboard__panel-head super-admin-dashboard__panel-head--compact">
                  <div>
                    <h2>Operations Queue</h2>
                    <p>Priority actions to maintain system visibility and reliability.</p>
                  </div>
                </div>

                <div className="super-admin-dashboard__queue-list">
                  {dashboardData.queueItems.map((item) => (
                    <Link
                      key={`${item.to}-${item.label}`}
                      to={item.to}
                      className={`super-admin-dashboard__queue-item super-admin-dashboard__queue-item--${item.tone}`}
                    >
                      <div>
                        <p>{item.label}</p>
                        <span>{item.description}</span>
                      </div>
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <section className="super-admin-dashboard__panel super-admin-dashboard__panel--quick-links">
            <div className="super-admin-dashboard__panel-head">
              <div>
                <h2>Quick Navigation</h2>
                <p>Open any super admin function directly from the dashboard.</p>
              </div>
            </div>

            <div className="super-admin-dashboard__quick-grid">
              {quickLinks.map((item) => (
                <Link key={item.to} to={item.to} className="super-admin-dashboard__quick-link">
                  <span>{item.label}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="super-admin-dashboard__secondary">
          <MediaPerformanceCard />
          <MediaHeatmap />
        </div>
      </section>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
