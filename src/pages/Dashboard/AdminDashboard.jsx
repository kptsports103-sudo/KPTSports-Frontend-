

import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useState, useEffect } from "react";
import DailyVisitorsChart from "../../admin/components/DailyVisitorsChart";
import VisitorsComparisonChart from "../../admin/components/VisitorsComparisonChart";
import { jsPDF } from "jspdf";
import api from "../../services/api";
import logoLeft from "/college-logo-left.png";
import logoRight from "/college-logo-right.png";
import emblem from "/karnataka-emblem.png";

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

  const buildCertificateNode = (row) => {
    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.left = "-9999px";
    wrapper.style.top = "0";
    wrapper.style.visibility = "hidden";
    wrapper.style.width = "980px";
    wrapper.style.background = "#f2f2f2";
    wrapper.style.padding = "20px";

    wrapper.innerHTML = `
      <style>
        .cert-wrap { font-family: "Times New Roman", serif; }
        .cert {
          width: 900px;
          height: 650px;
          margin: 0 auto;
          padding: 30px 40px;
          background: #fffaf0;
          border: 10px solid #7b2d2d;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
        }
        .cert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .cert-logo { height: 80px; width: 80px; object-fit: contain; }
        .cert-logo.center { height: 90px; width: 90px; }
        .cert-text-center { text-align: center; margin: 0; color: #111827; }
        .cert-gov, .cert-dept { font-size: 14px; margin: 6px 0; font-weight: 700; }
        .cert-college {
          text-align: center;
          font-size: 30px;
          color: #2b2b7f;
          margin: 10px 0 6px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }
        .cert-subtitle { text-align: center; font-size: 14px; margin: 0 0 16px; color: #374151; }
        .cert-kpm { font-size: 14px; margin: 4px 0 8px; color: #111827; font-weight: 700; }
        .cert-title {
          text-align: center;
          font-size: 42px;
          color: darkred;
          margin: 12px 0 16px;
          font-family: "Old English Text MT", "Times New Roman", serif;
          font-weight: 700;
        }
        .cert-content { text-align: center; font-size: 18px; line-height: 1.9; color: #111827; }
        .cert-field { font-size: 20px; margin: 8px 0; }
        .cert-line {
          border-bottom: 1px solid #000;
          padding: 0 10px;
          display: inline-block;
          min-width: 200px;
          font-weight: 700;
        }
        .cert-footer {
          display: flex;
          justify-content: space-between;
          position: absolute;
          bottom: 20px;
          left: 40px;
          right: 40px;
          font-weight: bold;
          color: darkred;
          font-size: 16px;
        }
      </style>
      <div class="cert-wrap">
        <div class="cert">
          <div class="cert-header">
            <img src="${logoLeft}" class="cert-logo" alt="College Logo Left" />
            <img src="${emblem}" class="cert-logo center" alt="Karnataka Emblem" />
            <img src="${logoRight}" class="cert-logo" alt="College Logo Right" />
          </div>
          <p class="cert-text-center cert-gov">GOVERNMENT OF KARNATAKA</p>
          <p class="cert-text-center cert-dept">DEPARTMENT OF COLLEGIATE AND TECHNICAL EDUCATION</p>
          <h1 class="cert-college">KARNATAKA (GOVT.) POLYTECHNIC, MANGALURU</h1>
          <p class="cert-subtitle">(First Autonomous Polytechnic in India under AICTE, New Delhi)</p>
          <div class="cert-kpm">KPM No.: ${safeField(row.kpmNo)}</div>
          <h2 class="cert-title">Certificate of Merit</h2>
          <div class="cert-content">
            <p>This award certificate is proudly presented to</p>
            <p class="cert-field">Mr./Ms. <span class="cert-line">${safeField(row.name)}</span></p>
            <p>
              studying in the <span class="cert-line">${safeField(row.semester)}</span> semester of the
              <span class="cert-line">${safeField(row.department)}</span> Department,
            </p>
            <p>
              for participating in the <span class="cert-line">${safeField(row.competition)}</span>
              sports/cultural competition
            </p>
            <p>
              organized by the Sports and Students Union in the year
              <span class="cert-line">${safeField(row.year)}</span>
            </p>
            <p>
              and securing the <span class="cert-line">${safeField(row.position)}</span> position.
            </p>
          </div>
          <div class="cert-footer">
            <div>Student Welfare Officer</div>
            <div>Sports Officer</div>
            <div>Principal</div>
          </div>
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
    
    setIsGeneratingId(row.id);
    let certificateNode = null;
    try {
      certificateNode = buildCertificateNode(row);
      document.body.appendChild(certificateNode);
      const cert = certificateNode.querySelector(".cert");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [900, 650],
        compress: true,
      });

      await pdf.html(cert, {
        x: 0,
        y: 0,
        width: 900,
        windowWidth: 900,
        margin: [0, 0, 0, 0],
        pagebreak: { mode: ["avoid-all", "css"] },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#fffaf0",
        },
      });

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
