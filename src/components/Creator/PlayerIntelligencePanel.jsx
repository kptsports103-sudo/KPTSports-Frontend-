import React from "react";
import { motion } from "framer-motion";
import { FaTimes, FaTrophy, FaMedal, FaRunning, FaCalendarAlt } from "react-icons/fa";
import { MdEmojiEvents, MdSportsScore } from "react-icons/md";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const hoverCard = {
  whileHover: {
    scale: 1.03,
    boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
    transition: { duration: 0.2 }
  }
};

const medalGlow = {
  animate: {
    boxShadow: [
      "0 0 0px rgba(255,215,0,0)",
      "0 0 12px rgba(255,215,0,0.6)",
      "0 0 0px rgba(255,215,0,0)"
    ]
  },
  transition: {
    repeat: Infinity,
    duration: 2
  }
};

const KARNATAKA_EVENTS = {
  boys: [
    "100 M Race", "200 M Race", "400 M Race", "800 M Race",
    "3 KM Race", "1500 M Race",
    "4 x 100 M Relay", "4 x 400 M Relay",
    "Discus", "Long Jump", "High Jump", "Triple Jump",
    "Chess", "Javelin Throw", "Yoga"
  ],
  girls: [
    "100 M Race", "200 M Race", "400 M Race", "800 M Race",
    "1 KM Race", "1500 M Race",
    "4 x 400 M Relay", "4 x 100 M Relay",
    "Discus", "Long Jump", "High Jump", "Triple Jump",
    "Chess", "Javelin Throw", "Yoga"
  ]
};

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
  const allEventRows = Object.values(eventsByYear).flat();
  const medalSummary = allEventRows.reduce(
    (acc, e) => {
      const medal = String(e?.medal || "").toLowerCase();
      if (medal === "gold") acc.gold += 1;
      if (medal === "silver") acc.silver += 1;
      if (medal === "bronze") acc.bronze += 1;
      return acc;
    },
    { gold: 0, silver: 0, bronze: 0 }
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <motion.div
        style={styles.panel}
        onClick={(e) => e.stopPropagation()}
        initial="hidden"
        animate="show"
        variants={fadeIn}
      >
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <MdEmojiEvents size={28} color="#0d6efd" />
            <div>
              <h2 style={styles.title}>{player.name || "Player"}</h2>
              <p style={styles.subTitle}>{player.branch || "-"}</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <FaTimes size={20} onClick={onClose} style={styles.closeIcon} />
          </motion.div>
        </div>

        <h3 style={styles.sectionTitle}>
          <MdSportsScore /> Events Participated (Karnataka State Inter-Polytechnic Meet)
        </h3>

        {Object.keys(eventsByYear).length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ margin: 0, fontWeight: 600 }}>No events mapped yet</p>
            <p style={{ marginTop: 6, fontSize: 12, color: "#6c757d" }}>
              Suggested events list (Boys/Girls): {KARNATAKA_EVENTS.boys.length}/{KARNATAKA_EVENTS.girls.length}
            </p>
          </div>
        ) : (
          Object.entries(eventsByYear)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([year, events]) => (
              <div key={year}>
                <h4 style={styles.yearTitle}>{year}</h4>
                <div style={styles.eventGrid}>
                  {events.map((e, i) => (
                    <motion.div key={`${year}-${i}`} style={styles.eventCard} {...hoverCard}>
                      <div style={styles.eventLeft}>
                        <motion.div whileHover={{ rotate: 10, scale: 1.2 }}>
                          <FaRunning color="#0d6efd" />
                        </motion.div>
                        <span>{e.name || "-"}</span>
                      </div>
                      {e.medal ? (
                        <motion.div
                          style={styles.medalTag}
                          {...(String(e.medal).toLowerCase() === "gold" ? medalGlow : {})}
                        >
                          <FaMedal size={12} /> {e.medal}
                        </motion.div>
                      ) : null}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
        )}

        <h3 style={styles.sectionTitle}>
          <FaTrophy /> Medal Summary
        </h3>
        <div style={styles.summaryRow}>
          <motion.div
            style={styles.summaryCard}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <FaTrophy size={16} color="#f59e0b" /> Gold: {medalSummary.gold}
          </motion.div>
          <motion.div
            style={styles.summaryCard}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <FaTrophy size={16} color="#94a3b8" /> Silver: {medalSummary.silver}
          </motion.div>
          <motion.div
            style={styles.summaryCard}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <FaTrophy size={16} color="#b45309" /> Bronze: {medalSummary.bronze}
          </motion.div>
        </div>

        <h3 style={{ ...styles.sectionTitle, marginTop: 8 }}>
          <FaCalendarAlt /> KPM History
        </h3>
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
              <tr key={`kpm-history-${i}`}>
                <td style={styles.td}>
                  <div style={styles.yearWithDot}>
                    <motion.div
                      style={styles.timelineDot}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    {h.year}
                  </div>
                </td>
                <td style={styles.td}>{h.kpmNo || "-"}</td>
                <td style={styles.td}>{h.diplomaYear || "-"}</td>
                <td style={styles.td}>{h.semester || "-"}</td>
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
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  panel: {
    width: "min(520px, 100%)",
    background: "#fff",
    padding: 20,
    overflowY: "auto",
    boxShadow: "-4px 0 12px rgba(0,0,0,0.15)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerLeft: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  closeIcon: {
    cursor: "pointer",
    color: "#6c757d",
  },
  title: {
    margin: "0 0 4px",
    color: "#111827",
  },
  subTitle: {
    margin: "0 0 14px",
    color: "#6b7280",
  },
  sectionTitle: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    color: "#1e3a8a",
  },
  yearTitle: {
    margin: "8px 0",
    color: "#334155",
  },
  eventGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
    gap: 10,
    marginBottom: 20,
  },
  eventCard: {
    background: "#f8f9fa",
    padding: 8,
    borderRadius: 6,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  eventLeft: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  medalTag: {
    display: "flex",
    gap: 4,
    alignItems: "center",
    background: "#0d6efd",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  summaryRow: {
    display: "flex",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  summaryCard: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 13,
    color: "#334155",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  emptyBox: {
    border: "1px dashed #cbd5e1",
    borderRadius: 8,
    padding: 12,
    background: "#f8fafc",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "8px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 12,
    color: "#334155",
  },
  td: {
    padding: "8px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
    color: "#111827",
  },
  yearWithDot: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#0d6efd",
  },
};

export default PlayerIntelligencePanel;
