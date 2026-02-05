

import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useState, useEffect } from "react";
import { IAMService } from "../../services/iam.service";
import DailyVisitorsChart from "../../admin/components/DailyVisitorsChart";
import VisitorsComparisonChart from "../../admin/components/VisitorsComparisonChart";
import { jsPDF } from "jspdf";
import api from "../../services/api";

const normalizeMedalKey = (medal = "") => {
  const value = medal.trim().toLowerCase();
  if (value === "gold") return "gold";
  if (value === "silver") return "silver";
  if (value === "bronze") return "bronze";
  return null;
};

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalMedia, setTotalMedia] = useState(0);
  const [certificateRows, setCertificateRows] = useState([]);
  const [isGeneratingId, setIsGeneratingId] = useState(null);
  const [yearlyStats, setYearlyStats] = useState([]);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const users = await IAMService.getUsers();
        setTotalUsers(users.length);
        const students = users.filter((u) => (u.role || "").toLowerCase() === "student");
        const rows = students.map((u) => ({
          id: u._id || u.id || u.email,
          name: u.name || "",
          kpmNo: u.kpmNo || u.kpm_no || "",
          semester: u.semester || "",
          department: u.department || u.dept || "",
          competition: u.competition || u.event || "",
          year: u.year || "",
          position: u.position || "",
          achievement: u.achievement || "",
        }));
        setCertificateRows(rows);
      } catch (error) {
        console.error('Failed to fetch user count:', error);
        setTotalUsers(0);
        setCertificateRows([]);
      }
    };

    const loadMediaCount = () => {
      const stored = JSON.parse(localStorage.getItem("media") || "[]");
      setTotalMedia(stored.length);
    };

    fetchUserCount();
    loadMediaCount();
  }, []);

  useEffect(() => {
    const fetchYearlyStats = async () => {
      try {
        const [resultsRes, groupRes] = await Promise.all([
          api.get("/results"),
          api.get("/group-results"),
        ]);

        const statsMap = new Map();
        const ensureYear = (year) => {
          if (!statsMap.has(year)) {
            statsMap.set(year, {
              year,
              individual: { gold: 0, silver: 0, bronze: 0 },
              group: { gold: 0, silver: 0, bronze: 0 },
            });
          }
          return statsMap.get(year);
        };

        (resultsRes.data || []).forEach((item) => {
          const year = Number(item.year);
          if (!year) return;
          const medalKey = normalizeMedalKey(item.medal);
          if (!medalKey) return;
          const entry = ensureYear(year);
          entry.individual[medalKey] += 1;
        });

        (groupRes.data || []).forEach((item) => {
          const year = Number(item.year);
          if (!year) return;
          const medalKey = normalizeMedalKey(item.medal);
          if (!medalKey) return;
          const entry = ensureYear(year);
          entry.group[medalKey] += 1;
        });

        const stats = Array.from(statsMap.values()).sort((a, b) => b.year - a.year);
        setYearlyStats(stats);
      } catch (error) {
        console.error("Failed to load yearly stats:", error);
        setYearlyStats([]);
      }
    };

    fetchYearlyStats();
  }, []);

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const drawText = (ctx, text, x, y) => {
    const safeText = text ?? "";
    ctx.fillText(safeText, x, y);
  };

  const handleDownloadCertificate = async (row) => {
    setIsGeneratingId(row.id);
    try {
      const template = await loadImage("/certificate.jpeg");
      const canvas = document.createElement("canvas");
      canvas.width = template.width;
      canvas.height = template.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#111";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      const base = { w: 1235, h: 1600 };
      const scaleX = canvas.width / base.w;
      const scaleY = canvas.height / base.h;
      const fontSize = Math.round(28 * scaleY);
      ctx.font = `${fontSize}px "Times New Roman", serif`;

      const positions = {
        kpmNo: { x: 260, y: 515 },
        name: { x: 470, y: 594 },
        semester: { x: 563, y: 656 },
        department: { x: 766, y: 656 },
        competition: { x: 641, y: 718 },
        year: { x: 922, y: 781 },
        position: { x: 703, y: 843 },
      };

      drawText(ctx, row.kpmNo, positions.kpmNo.x * scaleX, positions.kpmNo.y * scaleY);
      drawText(ctx, row.name, positions.name.x * scaleX, positions.name.y * scaleY);
      drawText(ctx, row.semester, positions.semester.x * scaleX, positions.semester.y * scaleY);
      drawText(ctx, row.department, positions.department.x * scaleX, positions.department.y * scaleY);
      drawText(ctx, row.competition, positions.competition.x * scaleX, positions.competition.y * scaleY);
      drawText(ctx, row.year, positions.year.x * scaleX, positions.year.y * scaleY);
      drawText(ctx, row.position, positions.position.x * scaleX, positions.position.y * scaleY);

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);

      const safeName = (row.name || "student")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      pdf.save(`certificate-${safeName || "student"}.pdf`);
    } catch (error) {
      console.error("Failed to generate certificate PDF:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsGeneratingId(null);
    }
  };

  const medalData = yearlyStats.map((y) => {
    const individualPoints =
      y.individual.gold * 5 + y.individual.silver * 3 + y.individual.bronze * 1;
    const groupPoints =
      y.group.gold * 10 + y.group.silver * 7 + y.group.bronze * 4;
    const totalPoints = individualPoints + groupPoints;
    const totalGold = y.individual.gold + y.group.gold;
    const totalSilver = y.individual.silver + y.group.silver;
    const totalBronze = y.individual.bronze + y.group.bronze;
    const totalMedals = totalGold + totalSilver + totalBronze;
    return {
      ...y,
      totalPoints,
      individualPoints,
      groupPoints,
      totalGold,
      totalSilver,
      totalBronze,
      totalMedals,
    };
  });

  const topYears = [...medalData]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);
  const maxIndividualPoints = medalData.reduce((m, i) => Math.max(m, i.individualPoints || 0), 0);
  const maxGroupPoints = medalData.reduce((m, i) => Math.max(m, i.groupPoints || 0), 0);
  const maxTotalPoints = medalData.reduce((m, i) => Math.max(m, i.totalPoints || 0), 0);

  // Scroll to visitor charts
  const scrollToVisitors = () => {
    const element = document.getElementById('visitor-charts');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Dynamic stats with real user count
  const stats = [
    { title: "Total Users", value: totalUsers, icon: "👤", link: "/admin/users-manage" },
    { title: "Update Pages", value: "Manage", icon: "📄", link: "/admin/update-pages" },
    { title: "Media Files", value: totalMedia, icon: "🖼️", link: "/admin/media-stats" },
    { title: "Visitors", value: "Analytics", icon: "📊", action: "scrollToVisitors" },
    { title: "IAM Users", value: "Manage", icon: "🔐", link: "/admin/iam/users" },
  ];

  return (
    <AdminLayout>
      {/* Improved layout wrapper for consistent spacing and readability */}
      <div className="admin-dashboard">
        <div className="dashboard-title">Admin Dashboard</div>
        <div className="dashboard-subtitle">System Overview & Analytics</div>

        {/* SYSTEM OVERVIEW */}
        <div className="section-header">
          <div className="section-title">🧭 System Overview</div>
          <div className="section-subtitle">Key operational totals at a glance</div>
        </div>
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const Card = (
              <div 
                className="stat-card" 
                style={{ 
                  cursor: (stat.link || stat.action) ? "pointer" : "default",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
                onClick={stat.action === "scrollToVisitors" ? scrollToVisitors : undefined}
                onMouseEnter={(e) => {
                  if (stat.link || stat.action) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (stat.link || stat.action) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                  }
                }}
              >
                <div className="stat-icon">{stat.icon}</div>
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
          id="visitor-charts"
          className="dashboard-panel"
        >
          <div className="panel-inner">
            <div className="section-header">
              <div className="section-title">📈 Analytics</div>
              <div className="section-subtitle">Trends, performance, and engagement</div>
            </div>

            {/* Daily Visitors Chart */}
            <DailyVisitorsChart />

            {/* Daily vs Total Visitors Comparison */}
            <VisitorsComparisonChart />

            {/* =====================
                QUICK STATS - NEW LAYOUT
                LEFT: Main stats card | RIGHT: Two stacked side cards
            ====================== */}
            <div className="section-header compact">
              <div className="section-title">📊 Quick Stats</div>
              <div className="section-subtitle">Points by year (Individual + Group)</div>
            </div>
            
            {/* DEBUG: Current structure renders N cards (one per year). Reference shows 1 card with LEFT+RIGHT split */}
            {console.log('[DEBUG] Current medalData count:', medalData.length, '| Reference expects: 1 wrapper with LEFT+RIGHT split')}
            
            <div className="quick-stats-wrapper">
              {/* LEFT BIG CARD - Main Stats */}
              <div className="quick-stats-main">
                <div className="stats-left">
                  <div className="stats-circle-animated">{medalData[0]?.totalPoints || 0}</div>
                  <div className="stats-legend">
                    <span><span className="legend-dot gold" /> Gold</span>
                    <span><span className="legend-dot silver" /> Silver</span>
                    <span><span className="legend-dot bronze" /> Bronze</span>
                  </div>
                </div>

                <div className="stats-right">
                  <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Points</h2>
                  <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px' }}>{medalData[0]?.year || '-'}</h1>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Points (Individual + Group)</p>
                  <p className="stats-note">Weights: Individual 5/3/1 · Group 10/7/4</p>

                  <div className="stats-breakdown">
                    <div className="stats-mini">
                      <div className="stats-mini-ring blue">{medalData[0]?.individualPoints || 0}</div>
                      <span className="stats-mini-label">Individual</span>
                    </div>
                    <div className="stats-mini">
                      <div className="stats-mini-ring green">{medalData[0]?.groupPoints || 0}</div>
                      <span className="stats-mini-label">Group</span>
                    </div>
                    <div className="stats-mini">
                      <div className="stats-mini-ring orange">{medalData[0]?.totalPoints || 0}</div>
                      <span className="stats-mini-label">Total</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE STACK */}
              <div className="quick-stats-side">
                <div className="side-card">
                  <h3>🏆 Best Performing Years</h3>
                  <h2>{topYears[0]?.year || '-'}</h2>
                  <p>{topYears[0]?.totalPoints || 0} Points</p>
                </div>

                <div className="side-card">
                  <h3>🎖 Certificates</h3>
                  <h2>{certificateRows.length}</h2>
                  <p>Total Certificates</p>
                </div>
              </div>
            </div>

            {/* DEBUG: Old structure (hidden for now) */}
            {console.log('[DEBUG] Side cards now inside Quick Stats wrapper:', true)}

          {/* =====================
              TOP YEARS
          ====================== */}
          <div className="section-header compact">
            <div className="section-title">🏆 Best Performing Years</div>
            <div className="section-subtitle">Top 5 years by medal points</div>
          </div>

          <div style={{ display: "flex", gap: "20px", marginBottom: "50px", flexWrap: "wrap" }}>
          {topYears.length === 0 ? (
            <div className="iam-empty">No results yet to rank top years.</div>
          ) : topYears.map((year, index) => (
            <div
              key={year.year}
              className="top-year-card-animated"
            >
              <h1 style={{ margin: 0 }}>
                {index === 0 ? "🥇" : "🥈"}
              </h1>
              <h2 style={{ margin: "10px 0" }}>{year.year}</h2>
              <h3 style={{ margin: 0 }}>{year.totalPoints} Points</h3>
            </div>
          ))}
        </div>

        {/* =====================
            CERTIFICATE DOWNLOADS
        ====================== */}
        <div className="section-header compact">
          <div className="section-title">🏅 Certificates</div>
          <div className="section-subtitle">Generate and download student certificates</div>
        </div>
        <div className="table-card">
          {certificateRows.length === 0 ? (
            <div className="iam-empty">No student records available for certificates.</div>
          ) : (
            <table className="iam-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>KPM No.</th>
                  <th>Semester</th>
                  <th>Department</th>
                  <th>Competition</th>
                  <th>Year</th>
                  <th>Position</th>
                  <th>Achievement</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {certificateRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name || "-"}</td>
                    <td>{row.kpmNo || "-"}</td>
                    <td>{row.semester || "-"}</td>
                    <td>{row.department || "-"}</td>
                    <td>{row.competition || "-"}</td>
                    <td>{row.year || "-"}</td>
                    <td>{row.position || "-"}</td>
                    <td>{row.achievement || "-"}</td>
                    <td>
                      <button
                        className="download-btn"
                        onClick={() => handleDownloadCertificate(row)}
                        disabled={isGeneratingId === row.id}
                      >
                        {isGeneratingId === row.id ? "Generating..." : "Download PDF"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
