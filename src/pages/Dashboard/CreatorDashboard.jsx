import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useState, useEffect } from "react";
import { IAMService } from "../../services/iam.service";

const CreatorDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalMedia, setTotalMedia] = useState(0);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const users = await IAMService.getUsers();
        setTotalUsers(users.length);
      } catch (error) {
        console.error('Failed to fetch user count:', error);
        setTotalUsers(0);
      }
    };

    const loadMediaCount = () => {
      const stored = JSON.parse(localStorage.getItem("media") || "[]");
      setTotalMedia(stored.length);
    };

    fetchUserCount();
    loadMediaCount();
  }, []);

  // Dynamic stats with real user count
  const stats = [
    { title: "Total Users", value: totalUsers, icon: "👤", link: "/admin/iam/users" },
    { title: "Coaches", value: 12, icon: "🧑‍🏫" },
    { title: "Students", value: 116, icon: "🎓" },
    { title: "Update Pages", value: 8, icon: "📄" },
    { title: "Media Files", value: totalMedia, icon: "🖼️", link: "/admin/media-stats" },
    { title: "Errors (24h)", value: 1, icon: "⚠️" },
    { title: "IAM Users", value: "Manage", icon: "🔐", link: "/admin/iam/users" },
  ];

  return (
    <AdminLayout>
      <div className="dashboard-title">Creator Dashboard</div>
      <div className="dashboard-subtitle">Content Creation & Management</div>

      {/* SYSTEM OVERVIEW */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Card = (
            <div className="stat-card" style={{ cursor: stat.link ? "pointer" : "default" }}>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>{stat.icon}</div>
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          );

          return stat.link ? (
            <Link key={index} to={stat.link} style={{ textDecoration: "none", color: "inherit" }}>
              {Card}
            </Link>
          ) : (
            <div key={index}>{Card}</div>
          );
        })}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            backgroundColor: "#fff",
            color: "#000",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "500px",
            width: "100%"
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>Quick Actions</h3>

          <Link
            to="/admin/media"
            style={{
              display: "block",
              padding: "12px",
              backgroundColor: "#0d6efd",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
              textAlign: "center",
              marginBottom: "10px"
            }}
          >
            📁 Media Management
          </Link>

          {[
            { name: "Manage Events", route: "/admin/manage-events" },
            { name: "Manage Gallery", route: "/admin/manage-gallery" },
            { name: "Manage Results", route: "/admin/manage-results" },
            { name: "Manage Home", route: "/admin/manage-home" },
            { name: "Manage About", route: "/admin/manage-about" },
            { name: "Manage History", route: "/admin/manage-history" }
          ].map((item, index) => (
            <Link
              key={index}
              to={item.route}
              style={{
                display: "block",
                padding: "12px",
                backgroundColor: "#0d6efd",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "15px",
                marginBottom: "8px",
                textAlign: "center"
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreatorDashboard;