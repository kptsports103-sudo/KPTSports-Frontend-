import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  Lock,
  LogOut,
  Settings2,
  ShieldAlert,
  ShieldBan,
  UserCog,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { clearAuthStorage } from "../../context/tokenStorage";
import FeedbackWidget from "../../components/FeedbackWidget";
import "../../admin.css";
import "./SuperAdminLayout.css";

const superAdminMenuItems = [
  { path: "/admin/super-admin-dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { path: "/admin/iam/users", label: "IAM Users", Icon: UserCog },
  { path: "/admin/users-manage", label: "Users Management", Icon: Users },
  { path: "/admin/audit-logs", label: "Interaction Logs", Icon: ClipboardList },
  { path: "/admin/errors", label: "Error Dashboard", Icon: ShieldAlert },
  { path: "/admin/media-stats", label: "Analytics", Icon: BarChart3 },
  { path: "/admin/login-activity", label: "Login Activity", Icon: Lock },
  { path: "/admin/approvals", label: "Approvals", Icon: CheckCircle2 },
  { path: "/admin/abuse-logs", label: "Abuse Logs", Icon: ShieldBan },
  { path: "/admin/settings", label: "Settings", Icon: Settings2 },
];

const SuperAdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, []);

  const handleLogout = () => {
    clearAuthStorage();
    navigate("/login", { replace: true });
  };

  return (
    <div className="super-admin-layout">
      <div className="super-admin-layout__orb super-admin-layout__orb--one" aria-hidden="true" />
      <div className="super-admin-layout__orb super-admin-layout__orb--two" aria-hidden="true" />
      <div className="super-admin-layout__orb super-admin-layout__orb--three" aria-hidden="true" />

      <aside className="super-admin-layout__sidebar" aria-label="Super admin navigation">
        <div className="super-admin-layout__brand">
          <div className="super-admin-layout__brand-panel">
            <h1>KPT Bot Admin</h1>
            <p>Super admin control center</p>
          </div>
        </div>

        <nav className="super-admin-layout__nav">
          {superAdminMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.Icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`super-admin-layout__nav-link ${isActive ? "is-active" : ""}`}
              >
                <span className="super-admin-layout__nav-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="super-admin-layout__nav-text">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="super-admin-layout__footer">
          <div className="super-admin-layout__status-card">
            <p>System Status</p>
            <div className="super-admin-layout__status-row">
              <span className="super-admin-layout__status-dot" aria-hidden="true" />
              <strong>Healthy</strong>
            </div>
          </div>

          <div className="super-admin-layout__account">
            <strong>{user?.name || "Super Admin"}</strong>
            <span>{user?.email || "Secure access session"}</span>
          </div>

          <button type="button" className="super-admin-layout__logout" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="super-admin-layout__main">
        {children}
      </main>

      <FeedbackWidget
        user={user}
        title="Share Your Feedback"
        description="We value your thoughts and suggestions about the super admin dashboard experience."
        contextLabel="Super Admin Dashboard"
        triggerLabel="Share Your Feedback"
        interactive={false}
        disabledReason="Visitors can submit feedback from the public website."
      />
    </div>
  );
};

export default SuperAdminLayout;
