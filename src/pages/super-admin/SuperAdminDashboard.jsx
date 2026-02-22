import { Link } from "react-router-dom";
import SuperAdminLayout from "./SuperAdminLayout";
import { useAuth } from "../../context/AuthContext";
import MediaPerformanceCard from "./MediaPerformanceCard";
import MediaHeatmap from "./MediaHeatmap";

const summaryCards = [
  { title: "Total Users", value: "150", tone: "text-blue-600" },
  { title: "Total Admins", value: "12", tone: "text-emerald-600" },
  { title: "Asset Admins", value: "5", tone: "text-rose-600" },
  { title: "Live Events", value: "25", tone: "text-violet-600" },
  { title: "Published Results", value: "89", tone: "text-amber-600" },
];

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

  return (
    <SuperAdminLayout>
      <section className="p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Super Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Welcome, {user?.name || "Super Admin"}. This is your control center.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
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

        <MediaPerformanceCard />
        <MediaHeatmap />
      </section>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;


