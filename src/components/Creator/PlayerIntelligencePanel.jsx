import React from "react";
import { motion } from "framer-motion";
import { FaTimes, FaMedal, FaRunning } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const PlayerIntelligencePanel = ({ player, data, onClose }) => {
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

  history.sort((a, b) => a.year - b.year);
  const chartData = history.map((h) => {
    const events = eventsByYear[h.year] || [];
    return {
      year: h.year,
      participation: events.length
    };
  });

  const medals = { gold: 0, silver: 0, bronze: 0 };
  Object.values(eventsByYear)
    .flat()
    .forEach((e) => {
      const m = String(e?.medal || "").toLowerCase();
      if (m === "gold") medals.gold++;
      if (m === "silver") medals.silver++;
      if (m === "bronze") medals.bronze++;
    });

  const medalStatsByYear = {};
  Object.entries(eventsByYear).forEach(([year, events]) => {
    medalStatsByYear[year] = { gold: 0, silver: 0, bronze: 0 };
    events.forEach((e) => {
      const medal = String(e?.medal || "").toLowerCase();
      if (medal === "gold") medalStatsByYear[year].gold++;
      if (medal === "silver") medalStatsByYear[year].silver++;
      if (medal === "bronze") medalStatsByYear[year].bronze++;
    });
  });

  const medalTrendData = Object.keys(medalStatsByYear)
    .sort((a, b) => Number(a) - Number(b))
    .map((year) => ({
      year,
      gold: medalStatsByYear[year].gold,
      silver: medalStatsByYear[year].silver,
      bronze: medalStatsByYear[year].bronze,
    }));

  let performanceScore = 0;
  Object.values(medalStatsByYear).forEach((stat) => {
    performanceScore += stat.gold * 5;
    performanceScore += stat.silver * 3;
    performanceScore += stat.bronze * 1;
  });

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
          <FaTimes style={styles.closeBtn} onClick={onClose} />
        </div>

        {/* HERO */}
        <div style={styles.hero}>
          <img src={player.image || "/default-avatar.png"} style={styles.avatar} alt="" />
          <div>
            <h2 style={{ margin: 0 }}>{player.name}</h2>
            <p style={{ color: "#6b7280", margin: "4px 0 0" }}>{player.branch}</p>
            <div style={styles.badge}>{history.length} Years Participation</div>
          </div>
        </div>

        {/* TIMELINE */}
        <h3 style={styles.section}>Career Timeline</h3>
        <div style={styles.timeline}>
          {history.map((h, i) => (
            <div key={i} style={styles.timelineItem}>
              <div style={styles.dot} />
              <strong>{h.year}</strong>
              <p style={{ margin: "4px 0" }}>
                Diploma {h.diplomaYear} Sem {h.semester}
              </p>
              <b>{h.kpmNo}</b>
            </div>
          ))}
        </div>

        {/* EVENTS */}
        <h3 style={styles.section}>Events Participated</h3>
        <div style={styles.eventGrid}>
          {Object.entries(eventsByYear).map(([year, events]) => (
            <div key={year} style={styles.yearCard}>
              <h4 style={{ marginTop: 0 }}>{year}</h4>
              {events.map((e, i) => (
                <div key={i} style={styles.eventRow}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <FaRunning />
                    {e.name}
                  </span>
                  {e.medal && <span style={styles.medal}>{e.medal}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <h3 style={styles.section}>Medal Summary</h3>
        <div style={styles.summaryRow}>
          <div style={styles.summaryCard}>
            <FaMedal /> Gold {medals.gold}
          </div>
          <div style={styles.summaryCard}>
            <FaMedal /> Silver {medals.silver}
          </div>
          <div style={styles.summaryCard}>
            <FaMedal /> Bronze {medals.bronze}
          </div>
        </div>

        {/* PERFORMANCE CHART */}
        <h3 style={styles.section}>Performance Chart</h3>
        <div style={styles.chartCard}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="participation"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* MEDAL TREND CHART */}
        <h3 style={styles.section}>Medal Growth Trend</h3>
        <div style={styles.chartCard}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={medalTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="gold" stroke="#facc15" strokeWidth={3} dot={{ r: 5 }} name="Gold" />
              <Line type="monotone" dataKey="silver" stroke="#94a3b8" strokeWidth={3} dot={{ r: 5 }} name="Silver" />
              <Line type="monotone" dataKey="bronze" stroke="#b45309" strokeWidth={3} dot={{ r: 5 }} name="Bronze" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.scoreCard}>
          <h4 style={{ margin: "0 0 10px" }}>Performance Score</h4>
          <div style={styles.scoreValue}>{performanceScore}</div>
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
    width: 900,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#f8fafc",
    borderRadius: 12,
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  },
  header: {
    background: "linear-gradient(90deg,#2563eb,#1e40af)",
    color: "#fff",
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: { cursor: "pointer" },
  hero: {
    display: "flex",
    gap: 20,
    padding: 20,
    background: "#fff",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 10,
    objectFit: "cover",
  },
  badge: {
    marginTop: 8,
    background: "#10b981",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 20,
    display: "inline-block",
  },
  section: { padding: "20px 20px 10px", margin: 0 },
  timeline: {
    display: "flex",
    justifyContent: "space-around",
    padding: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  timelineItem: { textAlign: "center", minWidth: 130 },
  dot: {
    width: 10,
    height: 10,
    background: "#2563eb",
    borderRadius: "50%",
    margin: "0 auto 6px",
  },
  eventGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 20,
    padding: 20,
  },
  yearCard: { background: "#fff", padding: 12, borderRadius: 8 },
  eventRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  medal: { background: "#facc15", padding: "2px 6px", borderRadius: 4 },
  summaryRow: { display: "flex", gap: 10, padding: 20, flexWrap: "wrap" },
  summaryCard: {
    background: "#fff",
    padding: 10,
    borderRadius: 8,
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  chartCard: {
    background: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
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
  table: { width: "100%", background: "#fff", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f1f5f9" },
};

export default PlayerIntelligencePanel;
