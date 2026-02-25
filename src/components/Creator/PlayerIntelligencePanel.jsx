import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Medal, Award } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const normalizeName = (name) => String(name || "").toLowerCase().trim().replace(/\s+/g, " ");

const deriveAcademicHistory = (kpmNo) => {
  const normalizedKpm = String(kpmNo || "").trim();
  if (!normalizedKpm || normalizedKpm.length < 3) return [];

  const yearPrefix = parseInt(normalizedKpm.substring(0, 2), 10);
  const diplomaYear = parseInt(normalizedKpm[2], 10);
  if (Number.isNaN(yearPrefix) || Number.isNaN(diplomaYear)) return [];

  const finalYear = 2000 + yearPrefix;
  const history = [];
  for (let i = diplomaYear - 1; i >= 0; i -= 1) {
    history.push({
      year: finalYear - i,
      diplomaYear: diplomaYear - i,
      semester: "-",
      kpmNo: normalizedKpm
    });
  }
  return history;
};

const getMedalPoints = (medal) => {
  const m = String(medal || "").toLowerCase().trim();
  if (m === "gold") return 5;
  if (m === "silver") return 3;
  if (m === "bronze") return 1;
  return 0;
};

const getTeamMedalPoints = (medal) => {
  const m = String(medal || "").toLowerCase().trim();
  if (m === "gold") return 10;
  if (m === "silver") return 7;
  if (m === "bronze") return 4;
  return 0;
};

const getMedalBadgeStyle = (medal) => {
  const m = String(medal || "").toLowerCase().trim();
  if (m === "gold") return { ...styles.medalBadge, background: "#fef3c7" };
  if (m === "silver") return { ...styles.medalBadge, background: "#e5e7eb" };
  if (m === "bronze") return { ...styles.medalBadge, background: "#fde68a" };
  return { ...styles.medalBadge, background: "#d1fae5" };
};

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = Number(value || 0);
    let start = 0;
    const duration = 800;
    const increment = target / (duration / 16 || 1);

    const counter = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(counter);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [value]);

  return <span>{count}</span>;
};

const PlayerHeader = ({ onClose }) => (
  <div style={styles.header}>
    <h2 style={{ margin: 0 }}>Player Intelligence Panel</h2>
    <span style={styles.close} onClick={onClose}>Close</span>
  </div>
);

const PlayerHero = ({ player, profileImage, historyYears, performanceScore }) => (
  <div style={styles.hero} className="heroResponsive">
    <div style={styles.heroLeft}>
      <img src={profileImage} alt={player.name || "player"} style={styles.avatar} />
      <div>
        <h2 style={{ margin: 0 }}>{player.name || "-"}</h2>
        <p style={styles.college}>{player.college || player.branch || "-"}</p>
        <div style={styles.badges}>
          <span style={styles.participation}>{historyYears.length} Years Participation</span>
          <span style={styles.senior}>{"\uD83C\uDFC6"} {historyYears.length >= 3 ? "Senior Player" : "Rising Player"}</span>
        </div>
      </div>
    </div>

    <div style={styles.topScoreBox}>
      <div style={styles.topScoreLabel}>Performance Score</div>
      <div style={styles.topScoreValue}>{performanceScore}</div>
    </div>
  </div>
);

const Timeline = ({ history }) => (
  <div style={styles.timelineSection}>
    <h3 style={styles.h3}>Career Timeline</h3>
    <div style={styles.timeline}>
      <div style={styles.timelineLine} />
      {history.map((h, i) => (
        <div key={`${h.year}-${i}`} style={styles.timelineItem}>
          <div style={styles.yearBadge}>{h.year}</div>
          <div style={styles.dot} />
          <div style={styles.timelineText}>Diploma {h.diplomaYear} Sem {h.semester}</div>
          <div style={styles.kpm}>{h.kpmNo}</div>
        </div>
      ))}
    </div>
  </div>
);

const EventsSection = ({ history, eventsByYear }) => (
  <div style={styles.eventsSection}>
    <h3 style={styles.h3}>
      Events Participated{" "}
      <span style={styles.subtitle}>(Karnataka State Inter-Polytechnic Meet)</span>
    </h3>
    <div style={styles.eventsGrid} className="eventsResponsive">
      {history.map((h) => {
        const year = h.year;
        const events = eventsByYear[year] || [];
        return (
          <div key={year} style={styles.yearCard}>
            <h4 style={{ margin: 0 }}>{year}</h4>
            {[...Array(5)].map((_, i) => {
              const e = events[i];
              const isEmpty = !e;
              return (
                <div
                  key={`${year}-${i}`}
                  style={{
                    ...styles.eventRow,
                    ...(isEmpty ? styles.emptyEventRow : {})
                  }}
                >
                  <span style={{ ...styles.smallDot, ...(isEmpty ? styles.emptyDot : {}) }} />
                  <span style={{ ...styles.eventName, ...(isEmpty ? styles.emptyText : {}) }}>
                    {e?.name || ""}
                  </span>
                  {e ? (
                    <span style={getMedalBadgeStyle(e.medal)}>{e.medal}</span>
                  ) : (
                    <span style={styles.emptyBadge} />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  </div>
);

const KpmHistory = ({ history }) => (
  <div>
    <h3 style={styles.h3}>KPM History</h3>
    <div style={styles.card}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Year</th>
            <th style={styles.th}>KPM No</th>
            <th style={styles.th}>Diploma</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={`kpm-row-${i}`}>
              <td style={{ ...styles.td, ...(i === history.length - 1 ? { borderBottom: "none" } : {}) }}>{h.year}</td>
              <td style={{ ...styles.td, ...(i === history.length - 1 ? { borderBottom: "none" } : {}) }}>{h.kpmNo}</td>
              <td style={{ ...styles.td, ...(i === history.length - 1 ? { borderBottom: "none" } : {}) }}>{h.diplomaYear}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div style={styles.kpmChips}>
      {history.map((h, i) => (
        <div key={`kpm-chip-${i}`} style={styles.chip}>
          {h.year} <span>{h.kpmNo}</span>
        </div>
      ))}
    </div>
  </div>
);

const MedalSummary = ({ medals }) => (
  <div>
    <h3 style={styles.h3}>Medal Summary</h3>
    <div style={styles.medalWrapper}>
      <div style={styles.medalGrid}>
        <motion.div whileHover={{ y: -4, scale: 1.02 }} style={{ ...styles.medalCard, ...styles.goldCard }}>
          <Medal size={32} strokeWidth={2.5} style={styles.iconShadow} />
          <div style={styles.medalContent}>
            <div style={styles.medalCount}><AnimatedCounter value={medals.gold} /></div>
            <div style={styles.medalLabel}>Gold</div>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4, scale: 1.02 }} style={{ ...styles.medalCard, ...styles.silverCard }}>
          <Medal size={32} strokeWidth={2.5} style={styles.iconShadow} />
          <div style={styles.medalContent}>
            <div style={styles.medalCount}><AnimatedCounter value={medals.silver} /></div>
            <div style={styles.medalLabel}>Silver</div>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4, scale: 1.02 }} style={{ ...styles.medalCard, ...styles.bronzeCard }}>
          <Medal size={32} strokeWidth={2.5} style={styles.iconShadow} />
          <div style={styles.medalContent}>
            <div style={styles.medalCount}><AnimatedCounter value={medals.bronze} /></div>
            <div style={styles.medalLabel}>Bronze</div>
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4, scale: 1.02 }} style={{ ...styles.medalCard, ...styles.participationCard }}>
          <Award size={32} strokeWidth={2.5} style={styles.iconShadow} />
          <div style={styles.medalContent}>
            <div style={styles.medalCount}><AnimatedCounter value={medals.participation} /></div>
            <div style={styles.medalLabel}>Participation</div>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);

const PerformanceChart = ({ growthPercentage, latestParticipation, chartData }) => (
  <>
    <h3 style={{ ...styles.h3, marginTop: 30 }}>Performance Chart</h3>
    <div style={styles.growth}>+{growthPercentage}% {"\u2022"} {latestParticipation}</div>
    <div style={styles.card}>
      <div style={{ minHeight: 260 }}>
        <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="participation" stroke="#0ea5e9" fill="#bae6fd" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  </>
);

const ScoreCard = ({ performanceScore, individualPoints, teamPoints }) => (
  <div style={styles.scoreCard}>
    <h3 style={styles.h3White}>Performance Score</h3>
    <div style={styles.score}>{performanceScore}</div>
    <div style={styles.scoreSplit}>
      <div>Individual Result Points: {individualPoints}</div>
      <div>Team Result Points: {teamPoints}</div>
    </div>
  </div>
);

const PlayerIntelligencePanel = ({ player, data = [], individualResults = [], teamResults = [], onClose }) => {
  if (!player) return null;

  const playerKey = String(player.masterId || player.id || "").trim();
  const history = deriveAcademicHistory(player.kpmNo);
  const eventsByYear = {};
  const historyByYear = history.reduce((acc, row) => {
    acc[Number(row.year)] = row;
    return acc;
  }, {});

  data.forEach((yearBlock) => {
    const yearNumber = Number(yearBlock?.year || 0);
    (yearBlock?.players || []).forEach((p) => {
      const rowKey = String(p.masterId || p.id || "").trim();
      const samePlayer =
        (playerKey && rowKey && playerKey === rowKey) ||
        normalizeName(p.name) === normalizeName(player.name);
      if (!samePlayer) return;

      if (historyByYear[yearNumber]) {
        historyByYear[yearNumber].semester = p.semester || historyByYear[yearNumber].semester || "-";
        historyByYear[yearNumber].diplomaYear = p.diplomaYear || historyByYear[yearNumber].diplomaYear || "-";
        historyByYear[yearNumber].kpmNo = p.kpmNo || historyByYear[yearNumber].kpmNo || "-";
      } else if (yearNumber) {
        const fallbackRow = {
          year: yearNumber,
          kpmNo: p.kpmNo || player.kpmNo || "-",
          diplomaYear: p.diplomaYear || "-",
          semester: p.semester || "-"
        };
        history.push(fallbackRow);
        historyByYear[yearNumber] = fallbackRow;
      }

      if (!Array.isArray(p.events)) return;
      p.events.forEach((e) => {
        eventsByYear[yearNumber] = eventsByYear[yearNumber] || [];
        const eventName = String(e?.name || "-").trim();
        if (eventsByYear[yearNumber].some((entry) => normalizeName(entry.name) === normalizeName(eventName))) return;
        eventsByYear[yearNumber].push({
          name: eventName,
          medal: e?.medal || "Participation"
        });
      });
    });
  });

  const matchedIndividualResults = (individualResults || []).filter((row) => {
    const rowKey = String(row.playerMasterId || row.playerId || "").trim();
    if (playerKey && rowKey && playerKey === rowKey) return true;
    return normalizeName(row.name) === normalizeName(player.name);
  });

  const matchedTeamResults = (teamResults || []).filter((groupRow) => {
    const masterIds = Array.isArray(groupRow?.memberMasterIds) ? groupRow.memberMasterIds.map((id) => String(id)) : [];
    const ids = Array.isArray(groupRow?.memberIds) ? groupRow.memberIds.map((id) => String(id)) : [];
    if (playerKey && [...masterIds, ...ids].includes(playerKey)) return true;

    const members = Array.isArray(groupRow?.members) ? groupRow.members : [];
    return members.some((member) => {
      if (!member) return false;
      if (typeof member === "string") return normalizeName(member) === normalizeName(player.name);
      const memberKey = String(member.playerMasterId || member.playerId || member.masterId || "").trim();
      if (playerKey && memberKey && playerKey === memberKey) return true;
      return normalizeName(member.name) === normalizeName(player.name);
    });
  });

  const pushUniqueResultEvent = (year, event, medal) => {
    const yearNumber = Number(year || 0);
    if (!yearNumber) return;
    eventsByYear[yearNumber] = eventsByYear[yearNumber] || [];
    if (eventsByYear[yearNumber].some((entry) => normalizeName(entry.name) === normalizeName(event))) return;
    eventsByYear[yearNumber].push({
      name: event || "-",
      medal: medal || "Participation"
    });
  };

  matchedIndividualResults.forEach((row) => pushUniqueResultEvent(row.year, row.event, row.medal));
  matchedTeamResults.forEach((row) => pushUniqueResultEvent(row.year, row.event, row.medal));

  history.sort((a, b) => Number(a.year) - Number(b.year));
  const chartData = history.map((h) => ({ year: h.year, participation: (eventsByYear[h.year] || []).length }));

  const medals = { gold: 0, silver: 0, bronze: 0, participation: 0 };
  Object.values(eventsByYear).flat().forEach((e) => {
    const medal = String(e?.medal || "").toLowerCase();
    if (medals[medal] !== undefined) medals[medal] += 1;
    else medals.participation += 1;
  });

  const base = chartData[0]?.participation || 0;
  const latest = chartData[chartData.length - 1]?.participation || 0;
  const growthPercentage = base > 0 ? (((latest - base) / base) * 100).toFixed(1) : "0.0";
  const latestParticipation = latest;

  const individualPoints = matchedIndividualResults.reduce((sum, row) => sum + getMedalPoints(row.medal), 0);
  const teamPoints = matchedTeamResults.reduce((sum, row) => sum + getTeamMedalPoints(row.medal), 0);
  const performanceScore = individualPoints + teamPoints;
  const profileImage = player.image || matchedIndividualResults.find((row) => row?.imageUrl)?.imageUrl || "/default-avatar.png";

  return (
    <div style={styles.overlay} onClick={onClose}>
      <motion.div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <PlayerHeader onClose={onClose} />
        <PlayerHero
          player={player}
          profileImage={profileImage}
          historyYears={history}
          performanceScore={performanceScore}
        />
        <Timeline history={history} />
        <EventsSection history={history} eventsByYear={eventsByYear} />

        <div style={styles.dashboard} className="dashboardResponsive">
          <KpmHistory history={history} />
          <div>
            <MedalSummary medals={medals} />
            <PerformanceChart
              growthPercentage={growthPercentage}
              latestParticipation={latestParticipation}
              chartData={chartData}
            />
          </div>
        </div>

        <ScoreCard
          performanceScore={performanceScore}
          individualPoints={individualPoints}
          teamPoints={teamPoints}
        />
      </motion.div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  modal: {
    width: "95%",
    maxWidth: "1300px",
    height: "95vh",
    overflowY: "auto",
    background: "#f8fafc",
    borderRadius: 20
  },
  header: {
    background: "linear-gradient(90deg,#2563eb,#1e40af)",
    color: "white",
    padding: 20,
    display: "flex",
    justifyContent: "space-between"
  },
  close: { cursor: "pointer", fontWeight: 600 },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 30,
    background: "#fff"
  },
  heroLeft: {
    display: "flex",
    gap: 20,
    alignItems: "center"
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 16,
    objectFit: "cover"
  },
  college: { color: "#64748b", marginTop: 4 },
  badges: { marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" },
  participation: {
    background: "#10b981",
    color: "white",
    padding: "6px 12px",
    borderRadius: 20
  },
  senior: {
    background: "#dbeafe",
    padding: "6px 12px",
    borderRadius: 20
  },
  topScoreBox: {
    background: "linear-gradient(135deg,#1e40af,#2563eb)",
    color: "#fff",
    padding: "20px 30px",
    borderRadius: 20,
    minWidth: 220,
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(37,99,235,0.35)"
  },
  topScoreLabel: {
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 6
  },
  topScoreValue: {
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 1
  },
  timelineSection: { padding: 30 },
  h3: { margin: 0, color: "#0f172a" },
  h3White: { margin: 0, color: "white" },
  timeline: {
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
    marginTop: 20,
    gap: 8
  },
  timelineLine: {
    position: "absolute",
    top: 34,
    left: 60,
    right: 60,
    height: 2,
    background: "#cbd5e1"
  },
  timelineItem: { textAlign: "center", flex: 1, zIndex: 1 },
  yearBadge: {
    background: "#e2e8f0",
    padding: "4px 12px",
    borderRadius: 20,
    display: "inline-block"
  },
  dot: {
    width: 14,
    height: 14,
    background: "#2563eb",
    borderRadius: "50%",
    margin: "12px auto"
  },
  timelineText: { fontSize: 13, color: "#64748b" },
  kpm: { fontWeight: "bold", marginTop: 5 },
  eventsSection: { padding: 30 },
  subtitle: { fontWeight: 400, color: "#64748b" },
  eventsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 20,
    marginTop: 20
  },
  yearCard: {
    background: "#fff",
    padding: 16,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    minHeight: 260,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start"
  },
  eventRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
    gap: 8
  },
  emptyEventRow: {
    background: "#f8fafc",
    borderRadius: 8,
    padding: "10px 12px",
    opacity: 0.9
  },
  smallDot: {
    width: 6,
    height: 6,
    background: "#2563eb",
    borderRadius: "50%",
    marginRight: 6,
    flexShrink: 0
  },
  emptyDot: {
    background: "#cbd5e1"
  },
  eventName: {
    flex: 1,
    color: "#1f2937"
  },
  emptyText: {
    color: "#94a3b8"
  },
  emptyBadge: {
    width: 58,
    height: 22,
    borderRadius: 6,
    background: "linear-gradient(90deg,#e2e8f0,#f1f5f9)"
  },
  medalBadge: {
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 12,
    whiteSpace: "nowrap"
  },
  dashboard: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: 40,
    padding: "40px 30px"
  },
  card: {
    background: "#f1f5f9",
    padding: "22px 24px",
    borderRadius: 18,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(15,23,42,0.04)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    borderBottom: "2px solid #cbd5e1",
    fontWeight: 700,
    fontSize: 15,
    color: "#0f172a"
  },
  td: {
    textAlign: "left",
    padding: "16px",
    borderBottom: "1px solid #cbd5e1",
    fontSize: 15,
    color: "#1e293b",
    transition: "all 0.2s ease"
  },
  rowWrapper: {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    borderBottom: "1px solid #cbd5e1"
  },
  rowAccent: {
    width: 4,
    background: "#2563eb",
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    opacity: 0,
    transition: "opacity 0.2s ease"
  },
  rowContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    width: "100%",
    padding: "16px"
  },
  cell: {
    fontSize: 15,
    color: "#1e293b"
  },
  kpmChips: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },
  chip: {
    background: "#e2e8f0",
    color: "#0f172a",
    borderRadius: 999,
    padding: "10px 18px",
    fontWeight: 600,
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)"
  },
  medalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20
  },
  medalWrapper: {
    width: "829px",
    maxWidth: "100%",
    margin: "0 auto",
    paddingTop: 10,
    paddingBottom: 10
  },
  medalCard: {
    height: 104,
    borderRadius: 18,
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
    transition: "all 0.25s ease",
    transformStyle: "preserve-3d"
  },
  goldCard: {
    background: "linear-gradient(135deg,#fbbf24,#f59e0b)"
  },
  silverCard: {
    background: "linear-gradient(135deg,#d1d5db,#9ca3af)"
  },
  bronzeCard: {
    background: "linear-gradient(135deg,#f59e0b,#b45309)"
  },
  participationCard: {
    background: "linear-gradient(135deg,#38bdf8,#0ea5e9)"
  },
  medalContent: {
    display: "flex",
    flexDirection: "column"
  },
  iconShadow: {
    filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
    transform: "translateZ(10px)"
  },
  medalCount: {
    fontSize: 22,
    fontWeight: 800
  },
  medalLabel: {
    fontSize: 14,
    opacity: 0.9
  },
  growth: {
    textAlign: "right",
    color: "#059669",
    fontWeight: "bold",
    marginBottom: 10
  },
  scoreCard: {
    margin: 30,
    padding: 30,
    borderRadius: 16,
    background: "linear-gradient(135deg,#2563eb,#1e40af)",
    color: "white",
    textAlign: "center"
  },
  score: {
    fontSize: 50,
    fontWeight: "bold",
    lineHeight: 1.2
  },
  scoreSplit: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.95
  }
};

export default PlayerIntelligencePanel;
