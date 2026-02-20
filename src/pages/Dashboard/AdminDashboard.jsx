

import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useState, useEffect, useMemo } from "react";
import DailyVisitorsChart from "../../admin/components/DailyVisitorsChart";
import VisitorsComparisonChart from "../../admin/components/VisitorsComparisonChart";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import api from "../../services/api";

const CERT_WIDTH = 1394;
const CERT_HEIGHT = 2048;
const CERT_RENDER_SCALE = 2;
const CERT_BG_CANDIDATES = [
  "/certificate-template.png",
  "/certificate-template.jpg",
  "/certificate-template.jpeg",
  "/certificate.png",
  "/certificate.jpg",
  "/certificate.jpeg",
];

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
  const [issuedCertificates, setIssuedCertificates] = useState([]);
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

  const normalizeKeyPart = (value) => String(value ?? "").trim().toLowerCase();

  const getRowCertificateKey = (row) =>
    [
      String(row?.id ?? row?.playerId ?? "").trim(),
      String(row?.year ?? "").trim(),
      normalizeKeyPart(row?.competition),
      normalizeKeyPart(row?.position),
    ].join("|");

  const getActionKey = (row) =>
    [
      String(row?.id ?? row?.playerId ?? "").trim(),
      String(row?.year ?? "").trim(),
      normalizeKeyPart(row?.competition),
      normalizeKeyPart(row?.position),
    ].join("-");

  const preloadCertificateBackground = async () => {
    for (const candidate of CERT_BG_CANDIDATES) {
      const loaded = await new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = candidate;
      });
      if (loaded) return candidate;
    }

    return null;
  };

  const waitForImage = async (img) => {
    if (!img) return false;
    if (img.complete && img.naturalWidth > 0) return true;
    return new Promise((resolve) => {
      const done = () => resolve(img.naturalWidth > 0);
      img.onload = done;
      img.onerror = () => resolve(false);
    });
  };

  const fetchIssuedCertificates = async () => {
    try {
      const response = await api.get("/certificates");
      setIssuedCertificates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch issued certificates:", error);
      setIssuedCertificates([]);
    }
  };

  useEffect(() => {
    fetchIssuedCertificates();
  }, []);

  const issueCertificate = async (row) => {
    const payload = {
      studentId: row.id || row.playerId,
      name: row.name,
      kpmNo: row.kpmNo,
      semester: row.semester,
      department: row.department,
      competition: row.competition,
      position: row.position,
      achievement: row.achievement,
      year: row.year,
    };

    const response = await api.post("/certificates/issue", payload);
    return response.data;
  };

  const generateCertificateQr = async (certificateId) => {
    const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(certificateId)}`;
    return QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    });
  };

  const placeTextAtMarker = (certNode, markerId, text, className) => {
    const marker = certNode.querySelector(`#${markerId}`);
    if (!marker) return;

    const field = document.createElement("div");
    field.className = `field ${className}`;
    field.textContent = safeLineField(text);
    field.style.top = marker.style.top || `${marker.offsetTop}px`;
    field.style.left = marker.style.left || `${marker.offsetLeft}px`;
    field.style.width = marker.style.width || `${marker.offsetWidth}px`;
    field.style.height = marker.style.height || `${marker.offsetHeight || 50}px`;
    certNode.appendChild(field);

    // Auto-fit long values so they stay inside the marker/underline area.
    let fontSize = className === "field-name" ? 48 : 34;
    const minFontSize = className === "field-name" ? 14 : 18;
    field.style.fontSize = `${fontSize}px`;

    while (field.scrollWidth > field.clientWidth && fontSize > minFontSize) {
      fontSize -= 1;
      field.style.fontSize = `${fontSize}px`;
    }
  };

  const buildCertificateNode = (row, backgroundUrl, certMeta) => {
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
          position: relative;
        }
        .cert-bg {
          position: absolute;
          inset: 0;
          width: ${CERT_WIDTH}px;
          height: ${CERT_HEIGHT}px;
          object-fit: cover;
          object-position: center;
          z-index: 1;
          user-select: none;
          pointer-events: none;
        }
        .field {
          position: absolute;
          color: #243a8c;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.1;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.85);
          z-index: 2;
        }
        .marker {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
        }
        .field-kpm {
          font-size: 32px;
          text-align: left;
        }
        .field-name {
          font-family: "Times New Roman", serif;
          font-size: 40px;
          text-align: center;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 5px;
          line-height: 1;
        }
        .field-semester {
          font-size: 34px;
          text-align: left;
          padding-left: 10px;
          display: flex;
          align-items: flex-end;
        }
        .field-department {
          font-size: 34px;
          text-align: left;
          padding-left: 10px;
          display: flex;
          align-items: flex-end;
        }
        .field-competition {
          font-size: 34px;
          text-align: left;
          padding-left: 10px;
          display: flex;
          align-items: flex-end;
        }
        .field-year {
          font-size: 34px;
          text-align: left;
          padding-left: 10px;
          display: flex;
          align-items: flex-end;
        }
        .field-position {
          font-size: 34px;
          text-align: center;
        }
        .qr-code {
          position: absolute;
          bottom: 130px;
          right: 220px;
          width: 170px;
          height: 170px;
          z-index: 2;
          border: 4px solid #ffffff;
          border-radius: 6px;
          box-shadow: 0 8px 24px rgba(10, 20, 65, 0.25);
          background: #fff;
        }
      </style>
      <div class="cert-wrap">
        <div class="cert">
          <img class="cert-bg" src="${backgroundUrl}" alt="Certificate background" />
          <div id="marker-kpm" class="marker" style="top:830px;left:260px;width:380px;height:50px;"></div>
          <div id="marker-name" class="marker" style="top:1150px;left:510px;width:650px;height:60px;"></div>
          <div id="marker-semester" class="marker" style="top:1285px;left:520px;width:150px;height:50px;"></div>
          <div id="marker-department" class="marker" style="top:1285px;left:980px;width:140px;height:50px;"></div>
          <div id="marker-competition" class="marker" style="top:1400px;left:710px;width:240px;height:50px;"></div>
          <div id="marker-year" class="marker" style="top:1510px;left:1115px;width:95px;height:50px;"></div>
          <div id="marker-position" class="marker" style="top:1620px;left:840px;width:200px;height:50px;"></div>
          <img class="qr-code" src="${certMeta.qrImage}" alt="Certificate verification QR" />
        </div>
      </div>
    `;

    const certNode = wrapper.querySelector(".cert");
    if (certNode) {
      placeTextAtMarker(certNode, "marker-kpm", row.kpmNo, "field-kpm");
      placeTextAtMarker(certNode, "marker-name", row.name, "field-name");
      placeTextAtMarker(certNode, "marker-semester", row.semester, "field-semester");
      placeTextAtMarker(certNode, "marker-department", row.department, "field-department");
      placeTextAtMarker(certNode, "marker-competition", row.competition, "field-competition");
      placeTextAtMarker(certNode, "marker-year", row.year, "field-year");
      placeTextAtMarker(certNode, "marker-position", row.position, "field-position");
    }

    return wrapper;
  };

  const copyVerifyLink = async (certificateId) => {
    const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(certificateId)}`;
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(verifyUrl);
      alert("Verification link copied.");
    } catch (error) {
      window.prompt("Copy this verification URL:", verifyUrl);
    }
  };

  const handleDownloadCertificate = async (row, existingCertificate = null) => {
    if (!row || !row.name) {
      alert("Invalid certificate data");
      return;
    }
    const actionKey = getActionKey(row);
    setIsGeneratingId(actionKey);
    let certificateNode = null;
    try {
      const issueResult = existingCertificate ? { certificate: existingCertificate } : await issueCertificate(row);
      const issuedCertificate = issueResult?.certificate;
      const certificateId = issuedCertificate?.certificateId;
      if (!certificateId) {
        throw new Error("Could not issue certificate ID.");
      }
      const qrImage = await generateCertificateQr(certificateId);

      const backgroundUrl = await preloadCertificateBackground();
      if (!backgroundUrl) {
        throw new Error("Certificate background could not be loaded. Add certificate-template.png in frontend/public.");
      }
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      certificateNode = buildCertificateNode(row, backgroundUrl, { certificateId, qrImage });
      document.body.appendChild(certificateNode);
      certificateNode.style.visibility = "visible";
      const cert = certificateNode.querySelector(".cert");
      const certBg = certificateNode.querySelector(".cert-bg");
      const certBgLoaded = await waitForImage(certBg);
      if (!certBgLoaded) {
        throw new Error("Certificate background image failed to render.");
      }

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 50));

      const safeScale = Math.min(
        CERT_RENDER_SCALE,
        Math.max(1, Number(window.devicePixelRatio) || 1)
      );

      const canvas = await html2canvas(cert, {
        scale: safeScale,
        letterRendering: true,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: CERT_WIDTH,
        height: CERT_HEIGHT,
        windowWidth: CERT_WIDTH,
        windowHeight: CERT_HEIGHT,
        imageTimeout: 30000,
        removeContainer: true,
        logging: false,
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
      const safeCertId = String(certificateId).toLowerCase().replace(/[^a-z0-9-]+/g, "");
      pdf.save(`certificate-${safeName || "student"}-${safeCertId || "cert"}.pdf`);
      await fetchIssuedCertificates();
    } catch (error) {
      console.error("Failed to generate certificate PDF:", error);
      const reason = error?.message || "Unknown error";
      alert(`Failed to generate certificate: ${reason}`);
    } finally {
      if (certificateNode) certificateNode.remove();
      setIsGeneratingId(null);
    }
  };

  const issuedCertificateByRowKey = useMemo(() => {
    const lookup = new Map();
    issuedCertificates.forEach((item) => {
      const key = [
        String(item?.studentId ?? "").trim(),
        String(item?.year ?? "").trim(),
        normalizeKeyPart(item?.competition),
        normalizeKeyPart(item?.position),
      ].join("|");
      if (key && !lookup.has(key)) {
        lookup.set(key, item);
      }
    });
    return lookup;
  }, [issuedCertificates]);

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
                  <th>Certificate ID</th>
                  <th>Verify Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificateRows.map((row) => {
                  const rowCertKey = getRowCertificateKey(row);
                  const existingCertificate = issuedCertificateByRowKey.get(rowCertKey);
                  const verifyUrl = existingCertificate
                    ? `${window.location.origin}/verify/${encodeURIComponent(existingCertificate.certificateId)}`
                    : null;
                  const rowActionKey = getActionKey(row);
                  const isBusy = isGeneratingId === rowActionKey;

                  return (
                    <tr key={rowActionKey}>
                      <td>{row.name || "-"}</td>
                      <td>{row.kpmNo || "-"}</td>
                      <td>{row.semester || "-"}</td>
                      <td>{row.department || "-"}</td>
                      <td>{row.competition || "-"}</td>
                      <td>{row.year || "-"}</td>
                      <td>{row.position || "-"}</td>
                      <td>{row.achievement || "-"}</td>
                      <td>{existingCertificate?.certificateId || "-"}</td>
                      <td>
                        {verifyUrl ? (
                          <button
                            className="download-btn"
                            onClick={() => copyVerifyLink(existingCertificate.certificateId)}
                            style={{ minWidth: 124 }}
                          >
                            Copy Link
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          className="download-btn"
                          onClick={() => handleDownloadCertificate(row, existingCertificate || null)}
                          disabled={isBusy}
                        >
                          {isBusy ? "Generating..." : existingCertificate ? "Download PDF" : "Generate PDF"}
                        </button>
                        <button
                          className="download-btn"
                          onClick={() => handleDownloadCertificate(row, existingCertificate)}
                          disabled={!existingCertificate || isBusy}
                          style={{ opacity: !existingCertificate || isBusy ? 0.65 : 1 }}
                        >
                          Reissue PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
