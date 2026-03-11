import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import { useAuth } from "../../context/AuthContext";
import MediaPerformanceCard from "./MediaPerformanceCard";
import MediaHeatmap from "./MediaHeatmap";
import activityLogService from "../../services/activityLog.service";

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

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const response = await activityLogService.getAllActivityLogs(8, 1);
        setLogs(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load dashboard activity logs:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const summaryCards = useMemo(() => {
    const today = new Date();
    const todayKey = today.toDateString();
    const uniqueUsers = new Set(logs.map((log) => String(log?.adminId || ""))).size;
    const loginCount = logs.filter((log) => log?.source === "auth").length;
    const todayCount = logs.filter((log) => {
      const created = log?.createdAt ? new Date(log.createdAt) : null;
      return created && created.toDateString() === todayKey;
    }).length;

    return [
      { title: "Recent Activity", value: String(logs.length), tone: "text-blue-600" },
      { title: "Today", value: String(todayCount), tone: "text-emerald-600" },
      { title: "Active Users", value: String(uniqueUsers), tone: "text-rose-600" },
      { title: "Login Events", value: String(loginCount), tone: "text-amber-600" },
    ];
  }, [logs]);

  return (
    <SuperAdminLayout>
      <section className="p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Super Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Welcome, {user?.name || "Super Admin"}. This is your control center.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-600">{card.title}</p>
              <p className={`mt-2 text-3xl font-bold ${card.tone}`}>{card.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Quick Navigation</h2>
          <p className="mt-1 text-sm text-slate-500">
            Open any Super Admin section from here.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Recent User Activity</h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest saved actions from across the application.
              </p>
            </div>
            <Link
              to="/admin/audit-logs"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View All Logs
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 text-sm text-slate-500">Loading recent activity...</div>
          ) : logs.length === 0 ? (
            <div className="mt-6 text-sm text-slate-500">No activity has been logged yet.</div>
          ) : (
            <div className="mt-6 space-y-3">
              {logs.map((log) => (
                <article
                  key={log._id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{log.action || "Recorded Activity"}</p>
                      <p className="text-sm text-slate-600">
                        {log.adminName || "Unknown User"} ({log.role || "viewer"}) on {log.pageName || "Unknown Page"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{log.details || "-"}</p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <MediaPerformanceCard />
        <MediaHeatmap />
      </section>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;


