import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import activityLogService from '../../services/activityLog.service';
import { clearAuthStorage } from '../../context/tokenStorage';
import { CMS_PAGE_UPDATED } from '../../utils/eventBus';
import {
  BarChart3,
  ClipboardList,
  FilePenLine,
  History,
  House,
  ImageIcon,
  Images,
  Info,
  LayoutDashboard,
  LogOut,
  Trophy,
  Users,
} from 'lucide-react';
import '../../admin.css';

const CMS_SEEN_STORAGE_KEY = 'cms_page_last_seen_v1';
const CMS_PAGES = [
  'Home Page',
  'About Page',
  'History Page',
  'Gallery Page',
  'Results Page'
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [cmsUnreadCount, setCmsUnreadCount] = useState(0);

  const readSeenMap = () => {
    try {
      const raw = localStorage.getItem(CMS_SEEN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const loadCmsUnreadCount = async () => {
    try {
      const seenMap = readSeenMap();
      const responses = await Promise.all(
        CMS_PAGES.map((page) => activityLogService.getPageActivityLogs(page, 50))
      );

      const unread = responses.reduce((sum, response, index) => {
        const pageName = CMS_PAGES[index];
        const logs = Array.isArray(response?.data) ? response.data : [];
        const lastSeen = seenMap[pageName] ? new Date(seenMap[pageName]).getTime() : 0;
        const pageUnread = logs.filter((log) => {
          const created = log?.createdAt ? new Date(log.createdAt).getTime() : 0;
          return created > lastSeen;
        }).length;
        return sum + pageUnread;
      }, 0);

      setCmsUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load CMS unread count:', error);
      setCmsUnreadCount(0);
    }
  };

  useEffect(() => {
    // Refresh user data to get latest profileImage from Cloudinary
    if (user) {
      refreshUser();
    }
  }, []);

  useEffect(() => {
    loadCmsUnreadCount();

    const refreshCounts = () => loadCmsUnreadCount();
    window.addEventListener(CMS_PAGE_UPDATED, refreshCounts);
    window.addEventListener('HOME_UPDATED', refreshCounts);

    return () => {
      window.removeEventListener(CMS_PAGE_UPDATED, refreshCounts);
      window.removeEventListener('HOME_UPDATED', refreshCounts);
    };
  }, [location.pathname]);
  const isCreator = user?.role === 'creator';

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users-manage', label: 'IAM Users', icon: Users },
    { path: '/admin/media-stats', label: 'Media Statistics & Calculator', icon: BarChart3 },
    { path: '/admin/media', label: 'Media Management', icon: ImageIcon },
    { path: '/admin/update-pages', label: 'Content Management Dashboard', icon: FilePenLine },
    { path: '/admin/manage-home', label: 'Manage Home', icon: House },
    { path: '/admin/manage-about', label: 'Manage About', icon: Info },
    { path: '/admin/manage-history', label: 'Manage History', icon: History },
    { path: '/admin/manage-gallery', label: 'Manage Gallery', icon: Images },
    { path: '/admin/manage-results', label: 'Manage Results', icon: Trophy },
    { path: '/admin/sports-meet-registrations', label: 'Sports Meet Registration', icon: ClipboardList },
  ];

  const creatorMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users-manage', label: 'IAM Users', icon: Users },
    { path: '/admin/media', label: 'Media Management', icon: ImageIcon },
    { path: '/admin/manage-results', label: 'Manage Results', icon: Trophy },
    { path: '/admin/sports-meet-registrations', label: 'Sports Meet Registration', icon: ClipboardList },
  ];


  const menuItems = isCreator ? creatorMenuItems : adminMenuItems;

  const handleLogout = () => {
    clearAuthStorage();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-shell dashboard-shell--admin-compact" style={{ '--sidebar-width': '92px' }}>
      {/* Sidebar */}
      <div className="sidebar sidebar--admin-compact">
        <div className="menu admin-sidebar__menu">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item menu-item--icon ${location.pathname === item.path ? 'active' : ''}`}
              data-label={item.label}
              title={item.label}
              aria-label={item.label}
            >
              <item.icon size={20} strokeWidth={2.1} />
              {item.path === '/admin/update-pages' && cmsUnreadCount > 0 ? (
                <span
                  className="admin-sidebar__badge"
                  title={`${cmsUnreadCount} unread content change${cmsUnreadCount > 1 ? 's' : ''}`}
                >
                  {cmsUnreadCount > 99 ? '99+' : cmsUnreadCount}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
        <button
          className="logout-btn admin-sidebar__logout"
          onClick={handleLogout}
          type="button"
          data-label="Logout"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={20} strokeWidth={2.1} />
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">{children}</div>
    </div>
  );
};

export default AdminLayout;


