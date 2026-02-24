import React from "react";
import { motion } from "framer-motion";
import { FaMedal } from "react-icons/fa";
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
const getMedalPoints = (medal) => {
  const m = String(medal || "").toLowerCase().trim();
  if (m === "gold") return 5;
  if (m === "silver") return 3;
  if (m === "bronze") return 1;
  return 0;
};

const getEventMedalStyle = (medal) => {
  const m = String(medal || "").toLowerCase().trim();
  const base = {
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 12,
    marginLeft: "auto",
    fontWeight: 600,
    color: "#334155"
  };
  if (m === "gold") return { ...base, background: "#fef3c7" };
  if (m === "silver") return { ...base, background: "#e5e7eb" };
  if (m === "bronze") return { ...base, background: "#fde68a" };
  return { ...base, background: "#d1fae5" };
};

const SummaryCard = ({ label, count }) => (
  <div style={styles.summaryCard}>
    <FaMedal />
    <span>{label}</span>
    <strong>{count}</strong>
  </div>
);

const PlayerIntelligencePanel = ({ player, data, individualResults = [], teamResults = [], onClose }) => {
  if (!player) return null;

  const history = [];
  const eventsByYear = {};

  data.forEach((yearBlock) => {
    yearBlock.players.forEach((p) => {
      if ((p.masterId || p.id) !== (player.masterId || player.id)) return;

      history.push({
        year: yearBlock.year,
        kpmNo: p.kpmNo,
        diplomaYear: p.diplomaYear,
        semester: p.semester,
      });

      if (Array.isArray(p.events) && p.events.length > 0) {
        eventsByYear[yearBlock.year] = p.events;
      }
    });
  });

  const matchedIndividualResults = (individualResults || [])
    .filter((row) => {
      const playerMasterId = String(player.masterId || player.id || "").trim();
      const rowMasterId = String(row.playerMasterId || row.playerId || "").trim();
      if (playerMasterId && rowMasterId && playerMasterId === rowMasterId) return true;
      return normalizeName(row.name) === normalizeName(player.name);
    })
    .sort((a, b) => Number(a?.year || 0) - Number(b?.year || 0));

  const matchedTeamResults = (teamResults || [])
    .filter((groupRow) => {
      const playerMasterId = String(player.masterId || player.id || "").trim();

      const memberMasterIds = Array.isArray(groupRow?.memberMasterIds) ? groupRow.memberMasterIds : [];
      const memberIds = Array.isArray(groupRow?.memberIds) ? groupRow.memberIds : [];
      if (playerMasterId && [...memberMasterIds, ...memberIds].map((id) => String(id)).includes(playerMasterId)) {
        return true;
      }

      const members = Array.isArray(groupRow?.members) ? groupRow.members : [];
      return members.some((member) => {
        if (!member) return false;
        if (typeof member === "string") return normalizeName(member) === normalizeName(player.name);
        const memberMasterId = String(member.playerMasterId || member.playerId || member.masterId || "").trim();
        if (playerMasterId && memberMasterId && playerMasterId === memberMasterId) return true;
        return normalizeName(member.name) === normalizeName(player.name);
      });
    })
    .sort((a, b) => Number(a?.year || 0) - Number(b?.year || 0));

  const pushUniqueEvent = (yearKey, eventName, medalValue) => {
    if (!yearKey) return;
    const normalizedEvent = String(eventName || "").toLowerCase().trim();
    eventsByYear[yearKey] = eventsByYear[yearKey] || [];
    const exists = eventsByYear[yearKey].some((e) => String(e?.name || "").toLowerCase().trim() === normalizedEvent);
    if (exists) return;
    eventsByYear[yearKey].push({
      name: eventName || "-",
      medal: medalValue || ""
    });
  };

  matchedIndividualResults.forEach((row) => {
    const yearKey = Number(row?.year || 0);
    pushUniqueEvent(yearKey, row.event, row.medal);
  });

  matchedTeamResults.forEach((row) => {
    const yearKey = Number(row?.year || 0);
    pushUniqueEvent(yearKey, row.event, row.medal);
  });

  history.sort((a, b) => a.year - b.year);
  const chartData = history.map((h) => {
    const events = eventsByYear[h.year] || [];
    return {
      year: h.year,
      participation: events.length
    };
  });

  const medals = { gold: 0, silver: 0, bronze: 0, participation: 0 };
  Object.values(eventsByYear)
    .flat()
    .forEach((e) => {
      const m = String(e?.medal || "").toLowerCase();
      if (medals[m] !== undefined) {
        medals[m] += 1;
      } else if (!m) {
        medals.participation += 1;
      }
    });

  const individualPoints = matchedIndividualResults.reduce((sum, row) => sum + getMedalPoints(row?.medal), 0);
  const teamPoints = matchedTeamResults.reduce((sum, row) => sum + getMedalPoints(row?.medal), 0);
  const performanceScore = individualPoints + teamPoints;
  const seniorBadge = history.length >= 3 ? "Senior Player" : "Rising Player";
  const totalParticipationsByYear = chartData.map((d) => d.participation);
  const baseParticipation = totalParticipationsByYear[0] || 0;
  const latestParticipation = totalParticipationsByYear.length ? totalParticipationsByYear[totalParticipationsByYear.length - 1] : 0;
  const growthPercentage =
    totalParticipationsByYear.length > 1 && baseParticipation > 0
      ? (((latestParticipation - baseParticipation) / baseParticipation) * 100).toFixed(1)
      : "0.0";

  return (
    <div style={styles.overlay} onClick={onClose}>
      <motion.div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Player Intelligence Panel</h2>
          <span style={styles.closeText} onClick={onClose}>Close</span>
        </div>

        {/* HERO */}
        <div style={styles.hero}>
          <img src={player.image || matchedIndividualResults.find((row) => row?.imageUrl)?.imageUrl || "/default-avatar.png"} style={styles.avatar} alt="" />
          <div>
            <h2 style={{ margin: 0 }}>{player.name}</h2>
            <p style={{ color: "#6b7280", margin: "4px 0 0" }}>{player.branch}</p>
            <div style={styles.badgeRow}>
              <div style={styles.participationBadge}>{history.length} Years Participation</div>
              <div style={styles.seniorBadge}>Trophy {seniorBadge}</div>
            </div>
          </div>
        </div>

        <h3 style={styles.section}>Player Details</h3>
        <div style={styles.summaryRow}>
          <div style={styles.summaryCard}><b>KPM No:</b> {player.kpmNo || "-"}</div>
          <div style={styles.summaryCard}><b>Name:</b> {player.name || "-"}</div>
          <div style={styles.summaryCard}><b>Branch:</b> {player.branch || "-"}</div>
          <div style={styles.summaryCard}><b>Diploma Year:</b> {player.diplomaYear || "-"}</div>
        </div>

        {/* TIMELINE */}
        <h3 style={styles.section}>Career Timeline</h3>
        <div style={styles.timelineContainer}>
          <div style={styles.timelineLine} />
          {history.length ? history.map((h, i) => (
            <div key={i} style={styles.timelineItem}>
              <div style={styles.timelineYear}>{h.year}</div>
              <div style={styles.timelineDot} />
              <div style={styles.timelineText}>Diploma {h.diplomaYear} Sem {h.semester}</div>
              <div style={styles.timelineKpm}>{h.kpmNo || "-"}</div>
            </div>
          )) : (
            <div style={{ color: "#64748b", padding: 20 }}>No timeline records</div>
          )}
        </div>

        {/* EVENTS */}
        <h3 style={styles.section}>
          Events Participated{" "}
          <span style={{ fontWeight: 400, color: "#64748b" }}>(Karnataka State Inter-Polytechnic Meet)</span>
        </h3>
        <div style={styles.eventsWrapper}>
          {Object.entries(eventsByYear).sort((a, b) => Number(a[0]) - Number(b[0])).map(([year, events]) => (
            <div key={year} style={styles.yearColumn}>
              <h4 style={{ margin: "0 0 10px" }}>{year}</h4>
              {events.map((e, i) => (
                <div key={i} style={styles.eventCard}>
                  <span style={styles.dot} />
                  <span>{e.name}</span>
                  <span style={getEventMedalStyle(e.medal || "participation")}>
                    {e.medal || "Participation"}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <h3 style={styles.section}>Individual Results</h3>
        <div style={styles.chartCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Year</th>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Medal</th>
              </tr>
            </thead>
            <tbody>
              {matchedIndividualResults.length ? matchedIndividualResults.map((row, idx) => (
                <tr key={`individual-${row._id || idx}`}>
                  <td style={styles.td}>{row.year || "-"}</td>
                  <td style={styles.td}>{row.event || "-"}</td>
                  <td style={styles.td}>{row.medal || "-"}</td>
                </tr>
              )) : (
                <tr>
                  <td style={styles.td} colSpan={3}>No individual results</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h3 style={styles.section}>Team Results</h3>
        <div style={styles.chartCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Year</th>
                <th style={styles.th}>Team</th>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Medal</th>
              </tr>
            </thead>
            <tbody>
              {matchedTeamResults.length ? matchedTeamResults.map((row, idx) => (
                <tr key={`team-${row._id || idx}`}>
                  <td style={styles.td}>{row.year || "-"}</td>
                  <td style={styles.td}>{row.teamName || "-"}</td>
                  <td style={styles.td}>{row.event || "-"}</td>
                  <td style={styles.td}>{row.medal || "-"}</td>
                </tr>
              )) : (
                <tr>
                  <td style={styles.td} colSpan={4}>No team results</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SUMMARY */}
        <h3 style={styles.section}>Medal Summary</h3>
        <div style={styles.summaryGrid}>
          <SummaryCard label="Gold" count={medals.gold} />
          <SummaryCard label="Silver" count={medals.silver} />
          <SummaryCard label="Bronze" count={medals.bronze} />
          <SummaryCard label="Participation" count={medals.participation} />
        </div>

        {/* PERFORMANCE CHART */}
        <h3 style={styles.section}>Performance Chart</h3>
        <div style={styles.growthText}>
          +{growthPercentage}% • {latestParticipation}
        </div>
        <div style={styles.chartCard}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="participation"
                stroke="#0ea5e9"
                strokeWidth={3}
                fill="#bae6fd"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.scoreCard}>
          <h4 style={{ margin: "0 0 10px" }}>Performance Score</h4>
          <div style={styles.scoreValue}>{performanceScore}</div>
          <div style={{ marginBottom: 8, fontSize: 14 }}>
            <div>Individual Result Points: {individualPoints}</div>
            <div>Team Result Points: {teamPoints}</div>
          </div>
          <p style={{ fontSize: 13, color: "#dbeafe", margin: 0 }}>
            Based on medal weight scoring system
          </p>
        </div>

        {/* KPM TABLE */}
        <h3 style={styles.section}>KPM History</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Year</th>
              <th style={styles.th}>KPM</th>
              <th style={styles.th}>Diploma</th>
              <th style={styles.th}>Sem</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td style={styles.td}>{h.year}</td>
                <td style={styles.td}>{h.kpmNo}</td>
                <td style={styles.td}>{h.diplomaYear}</td>
                <td style={styles.td}>{h.semester}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    width: "95%",
    maxWidth: "1200px",
    height: "95vh",
    overflowY: "auto",
    scrollbarWidth: "thin",
    background: "#f8fafc",
    borderRadius: 16,
    boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
  },
  header: {
    background: "linear-gradient(90deg,#2563eb,#1e40af)",
    color: "#fff",
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeText: {
    cursor: "pointer",
    fontWeight: 500,
    opacity: 0.9
  },
  hero: {
    display: "flex",
    gap: 20,
    padding: 20,
    background: "#fff",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 12,
    objectFit: "cover",
  },
  badgeRow: {
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  participationBadge: {
    marginTop: 8,
    background: "#10b981",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 20,
    display: "inline-block",
  },
  seniorBadge: {
    background: "#e0e7ff",
    color: "#3730a3",
    padding: "4px 10px",
    borderRadius: 20,
    fontWeight: 600,
    fontSize: 12
  },
  section: { padding: "20px 20px 10px", margin: 0 },
  timelineContainer: {
    display: "flex",
    justifyContent: "space-between",
    padding: 20,
    gap: 10,
    flexWrap: "wrap",
    position: "relative"
  },
  timelineLine: {
    position: "absolute",
    top: 48,
    left: 40,
    right: 40,
    height: 2,
    background: "#cbd5e1",
    zIndex: 0
  },
  timelineItem: {
    textAlign: "center",
    flex: 1,
    minWidth: 140,
    position: "relative",
    zIndex: 1
  },
  timelineYear: {
    background: "#e5e7eb",
    padding: "4px 12px",
    borderRadius: 20,
    display: "inline-block",
    fontWeight: 600
  },
  timelineDot: {
    width: 10,
    height: 10,
    background: "#2563eb",
    borderRadius: "50%",
    margin: "10px auto"
  },
  timelineText: {
    fontSize: 13,
    color: "#475569"
  },
  timelineKpm: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#0f172a",
    marginTop: 6
  },
  dot: {
    width: 8,
    height: 8,
    background: "#2563eb",
    borderRadius: "50%",
    marginRight: 8,
    flexShrink: 0
  },
  eventsWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    padding: 20,
  },
  yearColumn: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: 12
  },
  eventCard: {
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
    fontSize: 14
  },
  summaryRow: { display: "flex", gap: 10, padding: 20, flexWrap: "wrap" },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 10,
    padding: "0 20px 20px"
  },
  summaryCard: {
    background: "#fff",
    padding: 12,
    borderRadius: 8,
    display: "flex",
    gap: 6,
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid #e2e8f0"
  },
  chartCard: {
    background: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },
  growthText: {
    textAlign: "right",
    paddingRight: 20,
    fontWeight: "bold",
    color: "#059669"
  },
  scoreCard: {
    background: "linear-gradient(135deg,#2563eb,#1e40af)",
    color: "white",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    textAlign: "center",
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)"
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 5
  },
  table: {
    width: "100%",
    background: "#fff",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: 15
  },
  th: {
    textAlign: "left",
    padding: "14px 18px",
    background: "#f1f5f9",
    fontWeight: 600,
    borderBottom: "2px solid #e2e8f0"
  },
  td: {
    padding: "14px 18px",
    borderBottom: "1px solid #e5e7eb"
  },
};

export default PlayerIntelligencePanel;
