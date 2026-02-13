

import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useState, useEffect } from "react";
import DailyVisitorsChart from "../../admin/components/DailyVisitorsChart";
import VisitorsComparisonChart from "../../admin/components/VisitorsComparisonChart";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import api from "../../services/api";

const CERT_WIDTH = 1235;
const CERT_HEIGHT = 1600;
const CERT_BG = (import.meta.env.VITE_CERTIFICATE_BG_URL || "").trim();

const normalizeMedalKey = (medal = "") => {
  const value = medal.trim().toLowerCase();
  if (value === "gold") return "gold";
  if (value === "silver") return "silver";
  if (value === "bronze") return "bronze";
  return null;
};

const AdminDashboard = () => {
  const [totalMedia, setTotalMedia] = useState(0);
  const [certificateRows, setCertificateRows] = useState([]);
  const [isGeneratingId, setIsGeneratingId] = useState(null);
  const [yearlyStats, setYearlyStats] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerYear, setPlayerYear] = useState("all");
  const srOnlyStyle = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  };

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const playersRes = await api.get('/home/players');
        const playersGrouped = playersRes.data || {};
        
        // Flatten players by year
        const allPlayers = [];
        Object.keys(playersGrouped).forEach(year => {
          const yearNum = parseInt(year);
          playersGrouped[year].forEach(player => {
            allPlayers.push({
              id: player.id || player.playerId,
              name: player.name || '',
              kpmNo: player.kpmNo || '',
              semester: player.semester || '',
              department: player.branch || player.department || player.dept || '',
              competition: player.competition || player.event || '',
              position: player.position || player.rank || '',
              achievement: player.achievement || '',
              year: yearNum,
              diplomaYear: player.diplomaYear || ''
            });
          });
        });
        
        setCertificateRows(allPlayers);
      } catch (error) {
        console.error('Failed to fetch player data:', error);
        setCertificateRows([]);
      }
    };

    fetchPlayerData();
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

  const safeField = (value, fallback = "________") => {
    const text = value === null || value === undefined ? "" : String(value).trim();
    return text || fallback;
  };

  const safeLineField = (value) => safeField(value, "");

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const preloadCertificateBackground = async () => {
    if (!CERT_BG) return;
    await new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Failed to load certificate background image."));
      image.src = CERT_BG;
    });
  };

  const buildCertificateNode = (row) => {
    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.left = "0";
    wrapper.style.top = "0";
    wrapper.style.visibility = "hidden";
    wrapper.style.pointerEvents = "none";
    wrapper.style.width = `${CERT_WIDTH}px`;
    wrapper.style.height = `${CERT_HEIGHT}px`;
    wrapper.style.zIndex = "-1";

    wrapper.innerHTML = `
      <style>
        .cert-wrap {
          width: ${CERT_WIDTH}px;
          height: ${CERT_HEIGHT}px;
          font-family: "Times New Roman", serif;
        }
        .cert {
          width: ${CERT_WIDTH}px;
          height: ${CERT_HEIGHT}px;
          background-image: url("${CERT_BG}");
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
          position: relative;
        }
        .field {
          position: absolute;
          color: #243a8c;
          font-weight: 700;
          text-align: center;
          white-space: normal;
          overflow: visible;
          min-height: 36px;
          line-height: 1.2;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.85);
        }
        .field-kpm {
          top: 665px;
          left: 260px;
          width: 300px;
          font-size: 32px;
          text-align: left;
          height: 40px;
        }
        .field-name {
          top: 930px;
          left: 450px;
          width: 550px;
          font-size: 40px;
          line-height: 1.2;
        }
        .field-semester {
          top: 1030px;
          left: 430px;
          width: 165px;
          font-size: 30px;
        }
        .field-department {
          top: 1030px;
          left: 700px;
          width: 270px;
          font-size: 30px;
        }
        .field-competition {
          top: 1118px;
          left: 600px;
          width: 250px;
          font-size: 30px;
        }
        .field-year {
          top: 1205px;
          left: 905px;
          width: 150px;
          font-size: 30px;
        }
        .field-position {
          top: 1292px;
          left: 740px;
          width: 190px;
          font-size: 30px;
        }
        .field-semester,
        .field-department,
        .field-competition,
        .field-year,
        .field-position {
          line-height: 30px;
          padding-bottom: 4px;
        }
      </style>
      <div class="cert-wrap">
        <div class="cert">
          <div class="field field-kpm">${escapeHtml(safeLineField(row.kpmNo))}</div>
          <div class="field field-name">${escapeHtml(safeLineField(row.name))}</div>
          <div class="field field-semester">${escapeHtml(safeLineField(row.semester))}</div>
          <div class="field field-department">${escapeHtml(safeLineField(row.department))}</div>
          <div class="field field-competition">${escapeHtml(safeLineField(row.competition))}</div>
          <div class="field field-year">${escapeHtml(safeLineField(row.year))}</div>
          <div class="field field-position">${escapeHtml(safeLineField(row.position))}</div>
        </div>
      </div>
    `;

    return wrapper;
  };

  const handleDownloadCertificate = async (row) => {
    if (!row || !row.name) {
      alert("Invalid certificate data");
      return;
    }
    if (!CERT_BG) {
      alert("Certificate background URL is missing. Set VITE_CERTIFICATE_BG_URL.");
      return;
    }
    
    setIsGeneratingId(row.id);
    let certificateNode = null;
    try {
      await preloadCertificateBackground();
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      certificateNode = buildCertificateNode(row);
      document.body.appendChild(certificateNode);
      certificateNode.style.visibility = "visible";
      const cert = certificateNode.querySelector(".cert");

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 50));

      const canvas = await html2canvas(cert, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        width: CERT_WIDTH,
        height: CERT_HEIGHT,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [CERT_WIDTH, CERT_HEIGHT],
        compress: true,
      });

      pdf.addImage(imgData, "PNG", 0, 0, CERT_WIDTH, CERT_HEIGHT);

      const safeName = (row.name || "student")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      pdf.save(`certificate-${safeName || "student"}.pdf`);
    } catch (error) {
      console.error("Failed to generate certificate PDF:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      if (certificateNode) certificateNode.remove();
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

  // Set default selected year after medalData is loaded
  useEffect(() => {
    if (medalData.length > 0) {
      const defaultYear = String(medalData[0].year);
      if (selectedYear === "" || !medalData.some(m => String(m.year) === selectedYear)) {
        setSelectedYear(defaultYear);
      }
    }
  }, [medalData]);

  const topYears = [...medalData]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);
  const maxIndividualPoints = medalData.reduce((m, i) => Math.max(m, i.individualPoints || 0), 0);
  const maxGroupPoints = medalData.reduce((m, i) => Math.max(m, i.groupPoints || 0), 0);
  const maxTotalPoints = medalData.reduce((m, i) => Math.max(m, i.totalPoints || 0), 0);

  useEffect(() => {
    if (medalData.length === 0) {
      if (selectedYear !== "") setSelectedYear("");
      return;
    }
    const hasYear = medalData.some((m) => String(m.year) === String(selectedYear));
    if (!hasYear) {
      setSelectedYear(medalData[0].year);
    }
  }, [medalData, selectedYear]);

  const selectedStats = medalData.length > 0
    ? medalData.find((m) => String(m.year) === String(selectedYear)) || medalData[0]
    : null;

  // Calculate safe values for conic gradient
  const medalBase = selectedStats?.totalMedals > 0 ? selectedStats.totalMedals : 1;
  const goldPercent = selectedStats ? (selectedStats.totalGold / medalBase) * 100 : 0;
  const silverPercent = selectedStats ? ((selectedStats.totalGold + selectedStats.totalSilver) / medalBase) * 100 : 0;

  // Available years - normalize to strings
  const availablePlayerYears = Array.from(
    new Set(
      certificateRows
        .map((row) => String(row.year || "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => Number(b) - Number(a));

  // Filter players based on search and year
  const filteredPlayers = certificateRows.filter((row) => {
    const matchesYear =
      playerYear === "all" || String(row.year) === String(playerYear);

    const term = playerSearch.trim().toLowerCase();
    if (!term) return matchesYear;

    const name = (row.name || "").toLowerCase();
    const branch = (row.department || "").toLowerCase();

    return matchesYear && (name.includes(term) || branch.includes(term));
  });

  // Scroll to visitor charts
  const scrollToVisitors = () => {
    const element = document.getElementById('visitor-charts');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Dynamic stats
  const stats = [
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
              <div className="section-header-left">
                <div className="section-title">📊 Quick Stats</div>
                <div className="section-subtitle">Points by year (Individual + Group)</div>
              </div>
              <div className="quick-stats-controls">
                <label className="quick-stats-label" htmlFor="quick-stats-year">Select Year</label>
                <select
                  id="quick-stats-year"
                  name="quick-stats-year"
                  className="quick-stats-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={medalData.length === 0}
                >
                  {medalData.map((item) => (
                    <option key={item.year} value={item.year}>
                      {item.year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {medalData.length === 0 ? (
              <div className="iam-empty">No results yet to calculate points.</div>
            ) : (
              <div className="stats-main-card">
                <div className="stats-left">
                  <div
                    className="stats-circle-animated"
                    style={{
                      background: `conic-gradient(
                        #f1c40f 0 ${goldPercent}%,
                        #bdc3c7 ${goldPercent}% ${silverPercent}%,
                        #cd7f32 ${silverPercent}% 100%
                      )`,
                    }}
                  >
                    {selectedStats?.totalPoints || 0}
                  </div>
                  <div className="stats-legend">
                    <span><span className="legend-dot gold"></span> Gold</span>
                    <span><span className="legend-dot silver"></span> Silver</span>
                    <span><span className="legend-dot bronze"></span> Bronze</span>
                  </div>
                </div>

                <div className="stats-center">
                  <h3 className="stats-center-title">Total Points</h3>
                  <h2 className="stats-center-year">{selectedStats?.year || "-"}</h2>
                  <p className="stats-center-subtitle">Total Points (Individual + Group)</p>
                  <div className="stats-breakdown">
                    <div className="stats-mini">
                      <div
                        className="stats-mini-ring"
                        style={{
                          background: `conic-gradient(#2563eb 0 ${(selectedStats?.individualPoints / (maxIndividualPoints || 1)) * 100}%, #e5e7eb ${(selectedStats?.individualPoints / (maxIndividualPoints || 1)) * 100}% 100%)`,
                        }}
                      >
                        <span>{selectedStats?.individualPoints || 0}</span>
                      </div>
                      <span className="stats-mini-label">Individual</span>
                    </div>
                    <div className="stats-mini">
                      <div
                        className="stats-mini-ring"
                        style={{
                          background: `conic-gradient(#16a34a 0 ${(selectedStats?.groupPoints / (maxGroupPoints || 1)) * 100}%, #e5e7eb ${(selectedStats?.groupPoints / (maxGroupPoints || 1)) * 100}% 100%)`,
                        }}
                      >
                        <span>{selectedStats?.groupPoints || 0}</span>
                      </div>
                      <span className="stats-mini-label">Group</span>
                    </div>
                    <div className="stats-mini">
                      <div
                        className="stats-mini-ring"
                        style={{
                          background: `conic-gradient(#f97316 0 ${(selectedStats?.totalPoints / (maxTotalPoints || 1)) * 100}%, #e5e7eb ${(selectedStats?.totalPoints / (maxTotalPoints || 1)) * 100}% 100%)`,
                        }}
                      >
                        <span>{selectedStats?.totalPoints || 0}</span>
                      </div>
                      <span className="stats-mini-label">Total</span>
                    </div>
                  </div>
                  <div className="stats-note">Weights: Individual 5/3/1 • Group 10/7/4</div>
                </div>

                <div className="stats-right-cards">
                  <div className="small-card">
                    <h4>🏆 Best Performing Years</h4>
                    <h2>{topYears[0]?.year || "-"}</h2>
                    <p>{topYears[0]?.totalPoints || 0} Points</p>
                  </div>
                  <div className="small-card">
                    <h4>🎖 Certificates</h4>
                    <h2>{certificateRows.length}</h2>
                    <p>Total Certificates</p>
                  </div>
                </div>
              </div>
            )}

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
      </div>
    </div>

        {/* =====================
            PLAYERS LIST
        ====================== */}
        <div className="section-header compact">
          <div className="section-header-left">
            <div className="section-title">🧑‍🎓 Players List</div>
            <div className="section-subtitle">Search by name or branch and filter by year</div>
          </div>
          <div className="table-filters">
            <label htmlFor="player-search" style={srOnlyStyle}>Search by name or branch</label>
            <input
              id="player-search"
              name="player-search"
              className="iam-search"
              type="search"
              placeholder="Search name or branch"
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
            />
            <label htmlFor="player-year-filter" style={srOnlyStyle}>Filter by year</label>
            <select
              id="player-year-filter"
              name="player-year-filter"
              className="quick-stats-select"
              value={playerYear}
              onChange={(e) => setPlayerYear(e.target.value)}
              disabled={availablePlayerYears.length === 0}
            >
              <option value="all">All Years</option>
              {availablePlayerYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="table-card">
          {filteredPlayers.length === 0 ? (
            <div className="iam-empty">No matching players found.</div>
          ) : (
            <table className="iam-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name || "-"}</td>
                    <td>{row.department || "-"}</td>
                    <td>{row.year || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
    </AdminLayout>
  );
};

export default AdminDashboard;
