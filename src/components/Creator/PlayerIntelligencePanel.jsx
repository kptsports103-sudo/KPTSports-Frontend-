import React from "react";
import { motion } from "framer-motion";
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

const getMedalBadgeStyle = (medal) => {
  const m = String(medal || "").toLowerCase().trim();
  if (m === "gold") return { ...styles.medalBadge, background: "#fef3c7" };
  if (m === "silver") return { ...styles.medalBadge, background: "#e5e7eb" };
  if (m === "bronze") return { ...styles.medalBadge, background: "#fde68a" };
  return { ...styles.medalBadge, background: "#d1fae5" };
};

const PlayerIntelligencePanel = ({ player, data = [], individualResults = [], teamResults = [], onClose }) => {
  if (!player) return null;

  const playerKey = String(player.masterId || player.id || "").trim();
  const history = [];
  const eventsByYear = {};

  data.forEach((yearBlock) => {
    const yearNumber = Number(yearBlock?.year || 0);
    (yearBlock?.players || []).forEach((p) => {
      const rowKey = String(p.masterId || p.id || "").trim();
      const samePlayer =
        (playerKey && rowKey && playerKey === rowKey) ||
        normalizeName(p.name) === normalizeName(player.name);
      if (!samePlayer) return;

      history.push({
        year: yearNumber,
        kpmNo: p.kpmNo || "-",
        diplomaYear: p.diplomaYear || "-",
        semester: p.semester || "-"
      });

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

  matchedIndividualResults.forEach((row) => {
    pushUniqueResultEvent(row.year, row.event, row.medal);
  });

  matchedTeamResults.forEach((row) => {
    pushUniqueResultEvent(row.year, row.event, row.medal);
  });

  history.sort((a, b) => Number(a.year) - Number(b.year));

  const chartData = Object.keys(eventsByYear)
    .map((year) => ({
      year: Number(year),
      participation: (eventsByYear[year] || []).length
    }))
    .sort((a, b) => a.year - b.year);

  const medals = { gold: 0, silver: 0, bronze: 0, participation: 0 };
  Object.values(eventsByYear).flat().forEach((e) => {
    const medal = String(e?.medal || "").toLowerCase();
    if (medals[medal] !== undefined) {
      medals[medal] += 1;
    } else {
      medals.participation += 1;
    }
  });

  const totalParticipationsByYear = chartData.map((d) => d.participation);
  const latestParticipation = totalParticipationsByYear.length ? totalParticipationsByYear[totalParticipationsByYear.length - 1] : 0;
  const growthPercentage =
    totalParticipationsByYear.length > 1 && totalParticipationsByYear[0] > 0
      ? (((latestParticipation - totalParticipationsByYear[0]) / totalParticipationsByYear[0]) * 100).toFixed(1)
      : "0.0";

  const individualPoints = matchedIndividualResults.reduce((sum, row) => sum + getMedalPoints(row.medal), 0);
  const teamPoints = matchedTeamResults.reduce((sum, row) => sum + getMedalPoints(row.medal), 0);
  const performanceScore = individualPoints + teamPoints;
  const seniorBadge = history.length >= 3 ? "Senior Player" : "Rising Player";
  const profileImage = player.image || matchedIndividualResults.find((row) => row?.imageUrl)?.imageUrl || "/default-avatar.png";

  return (
    <div style={styles.overlay} onClick={onClose}>
      <motion.div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Player Intelligence Panel</h2>
          <span style={styles.close} onClick={onClose}>Close</span>
        </div>

        <div style={styles.hero}>
          <img src={profileImage} alt={player.name || "player"} style={styles.avatar} />
          <div>
            <h2 style={{ margin: 0 }}>{player.name || "-"}</h2>
            <p style={styles.college}>{player.college || player.branch || "-"}</p>
            <div style={styles.badges}>
              <span style={styles.participation}>{history.length} Years Participation</span>
              <span style={styles.senior}>{"\uD83C\uDFC6"} {seniorBadge}</span>
            </div>
          </div>
        </div>

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

        <div style={styles.eventsSection}>
          <h3 style={styles.h3}>
            Events Participated{" "}
            <span style={styles.subtitle}>(Karnataka State Inter-Polytechnic Meet)</span>
          </h3>
          <div style={styles.eventsGrid}>
            {Object.entries(eventsByYear)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([year, events]) => (
                <div key={year} style={styles.yearCard}>
                  <h4 style={{ margin: 0 }}>{year}</h4>
                  {events.map((e, i) => (
                    <div key={`${year}-${i}`} style={styles.eventRow}>
                      <span style={styles.smallDot} />
                      <span style={styles.eventName}>{e.name}</span>
                      <span style={getMedalBadgeStyle(e.medal)}>{e.medal || "Participation"}</span>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>

        <div style={styles.dashboard}>
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
                      <td style={styles.td}>{h.year}</td>
                      <td style={styles.td}>{h.kpmNo}</td>
                      <td style={styles.td}>{h.diplomaYear}</td>
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

          <div>
            <h3 style={styles.h3}>Medal Summary</h3>
            <div style={styles.medalGrid}>
              <div style={styles.medalCard}>{"\uD83E\uDD47"} {medals.gold} Gold</div>
              <div style={styles.medalCard}>{"\uD83E\uDD48"} {medals.silver} Silver</div>
              <div style={styles.medalCard}>{"\uD83E\uDD49"} {medals.bronze} Bronze</div>
              <div style={styles.medalCard}>{"\uD83D\uDD35"} {medals.participation} Participation</div>
            </div>

            <h3 style={{ ...styles.h3, marginTop: 30 }}>Performance Chart</h3>
            <div style={styles.growth}>+{growthPercentage}% {"\u2022"} {latestParticipation}</div>
            <div style={styles.card}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="participation"
                    stroke="#0ea5e9"
                    fill="#bae6fd"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={styles.scoreCard}>
          <h3 style={styles.h3White}>Performance Score</h3>
          <div style={styles.score}>{performanceScore}</div>
          <div style={styles.scoreSplit}>
            <div>Individual Result Points: {individualPoints}</div>
            <div>Team Result Points: {teamPoints}</div>
          </div>
        </div>
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
    gap: 20,
    padding: 30,
    background: "#fff"
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
    top: 30,
    left: 50,
    right: 50,
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
    width: 12,
    height: 12,
    background: "#2563eb",
    borderRadius: "50%",
    margin: "10px auto"
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
    padding: 15,
    borderRadius: 12,
    border: "1px solid #e2e8f0"
  },
  eventRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
    gap: 8
  },
  smallDot: {
    width: 6,
    height: 6,
    background: "#2563eb",
    borderRadius: "50%",
    marginRight: 6,
    flexShrink: 0
  },
  eventName: {
    flex: 1,
    color: "#1f2937"
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
    gap: 30,
    padding: 30
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #e2e8f0"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "2px solid #e2e8f0"
  },
  td: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "1px solid #e2e8f0"
  },
  kpmChips: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },
  chip: {
    background: "#dbeafe",
    color: "#1e3a8a",
    borderRadius: 999,
    padding: "6px 12px",
    fontWeight: 600,
    display: "inline-flex",
    gap: 8
  },
  medalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: 10
  },
  medalCard: {
    background: "#fff",
    padding: 15,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    fontWeight: 600
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
