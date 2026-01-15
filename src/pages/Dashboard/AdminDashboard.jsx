

import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useState, useEffect } from "react";
import { IAMService } from "../../services/iam.service";

/* =====================
   YEAR DATA (ONLY 2024 & 2025)
====================== */
const yearlyMedals = [
  {
    year: 2024,
    gold: 52,   // Overall champion points converted to medal weight (example)
    silver: 0,
    bronze: 0
  },
  {
    year: 2025,
    gold: 4,
    silver: 0,
    bronze: 1
  }
];

const AdminDashboard = () => {
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

  const medalData = yearlyMedals.map((y) => ({
    ...y,
    total: y.gold + y.silver + y.bronze
  }));

  const topYears = [...medalData].sort((a, b) => b.total - a.total);

  // Dynamic stats with real user count
  const stats = [
    { title: "Total Users", value: totalUsers, icon: "👤", link: "/admin/users-manage" },
    { title: "Update Pages", value: "Manage", icon: "📄", link: "/admin/update-pages" },
    { title: "Media Files", value: totalMedia, icon: "🖼️", link: "/admin/media-stats" },
    { title: "Errors (24h)", value: 1, icon: "⚠️", link: "/admin/errors" },
    { title: "IAM Users", value: "Manage", icon: "🔐", link: "/admin/iam/users" },
  ];

  return (
    <AdminLayout>
      <div className="dashboard-title">Admin Dashboard</div>
      <div className="dashboard-subtitle">System Overview & Analytics</div>

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


      {/* ANALYTICS */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "40px",
          color: "#000"
        }}
      >

        {/* =====================
            MEDAL TALLY (2024 & 2025)
        ====================== */}
        <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>
          Medal Tally by Year (2024 – 2025)
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "25px",
            marginBottom: "40px"
          }}
        >
          {medalData.map((item) => (
            <div
              key={item.year}
              style={{
                backgroundColor: "#ffffff",
                color: "#000",
                borderRadius: "12px",
                padding: "25px",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  width: "130px",
                  height: "130px",
                  borderRadius: "50%",
                  margin: "0 auto 15px",
                  background: `conic-gradient(
                    #f1c40f 0 ${(item.gold / item.total) * 100}%,
                    #bdc3c7 ${(item.gold / item.total) * 100}% ${((item.gold + item.silver) / item.total) * 100}%,
                    #cd7f32 ${((item.gold + item.silver) / item.total) * 100}% 100%
                  )`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "22px"
                }}
              >
                {item.total}
              </div>

              <h2 style={{ marginBottom: "5px" }}>{item.year}</h2>
              <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
                Total Medals / Points
              </p>
            </div>
          ))}
        </div>

        {/* =====================
            TOP YEARS
        ====================== */}
        <h2 style={{ marginBottom: "15px" }}>🏆 Best Performing Years</h2>

        <div style={{ display: "flex", gap: "20px", marginBottom: "50px" }}>
          {topYears.map((year, index) => (
            <div
              key={year.year}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                color: "#000",
                borderRadius: "12px",
                padding: "30px",
                textAlign: "center"
              }}
            >
              <h1 style={{ margin: 0 }}>
                {index === 0 ? "🥇" : "🥈"}
              </h1>
              <h2 style={{ margin: "10px 0" }}>{year.year}</h2>
              <h3 style={{ margin: 0 }}>{year.total} Total</h3>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
