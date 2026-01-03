import { useState, useEffect } from 'react';

const Attendance = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [rows, setRows] = useState([
    { slNo: 1, playerName: '', morning: 'Present', evening: 'Present' }
  ]);
  const [playerNames, setPlayerNames] = useState([]);

  useEffect(() => {
    const savedPlayers = localStorage.getItem("playersData");
    if (!savedPlayers) return;

    const playersData = JSON.parse(savedPlayers);
    let names = [];

    playersData.forEach(yearData => {
      // If current year → show all
      if (selectedYear === currentYear || yearData.year === selectedYear) {
        yearData.players.forEach(player => {
          if (player.name && !names.includes(player.name)) {
            names.push(player.name);
          }
        });
      }
    });

    setPlayerNames(names);
  }, [selectedYear, currentYear]);

  useEffect(() => {
    const saved = localStorage.getItem("attendanceData");
    if (saved) {
      setRows(JSON.parse(saved));
    } else {
      setRows([{ slNo: 1, playerName: '', morning: 'Present', evening: 'Present' }]);
    }
  }, []);

  return (
    <div style={styles.page}>
      
      <div style={styles.sectionTitle}>Attendance</div>

      <div style={styles.filterRow}>
        <div style={styles.filterGroup}>
          <label>Year</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={styles.filterGroupInput}
          >
            <option value={currentYear}>{currentYear} (All)</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th>SL.NO</th>
            <th>PLAYER</th>
            <th>MORNING</th>
            <th>EVENING</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index} style={styles.bodyRow}>
              <td>{row.slNo}</td>

              <td>
                <select
                  value={row.playerName}
                  disabled
                  style={{
                    ...styles.select,
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <option value="">Select Player</option>
                  {playerNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </td>

              <td>
                <select
                  value={row.morning}
                  disabled
                  style={{
                    ...styles.select,
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <option>Present</option>
                  <option>Absent</option>
                  <option>Late</option>
                  <option>Excused</option>
                </select>
              </td>

              <td>
                <select
                  value={row.evening}
                  disabled
                  style={{
                    ...styles.select,
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <option>Present</option>
                  <option>Absent</option>
                  <option>Late</option>
                  <option>Excused</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.footer}>
        © 2023 KPT Sports. All rights reserved.
      </div>
    </div>
  );
};

export default Attendance;

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f3b2e",
    padding: "20px",
    boxSizing: "border-box",
    color: "#fff",
  },

  pageTitle: {
    fontSize: "34px",
    fontWeight: 700,
    marginBottom: "6px",
  },

  sectionTitle: {
    textAlign: "center",
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "20px",
    opacity: 0.95,
  },

  filterRow: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-end",
    marginBottom: "18px",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "13px",
    fontWeight: 500,
  },

  filterGroupInput: {
    height: "38px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
    fontSize: "14px",
    color: "#000",
    backgroundColor: "#fff",
  },

  table: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    background: "#fff",
    color: "#000",
    borderCollapse: "separate",
    borderSpacing: 0,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
  },

  headerRow: {
    background: "linear-gradient(90deg, #0d6efd, #0a58ca)",
    color: "#fff",
    height: "52px",
    fontSize: "13px",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
  },

  bodyRow: {
    height: "56px",
    fontSize: "15px",
    borderBottom: "1px solid #eee",
  },

  select: {
    width: "100%",
    height: "38px",
    padding: "0 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
  },

  footer: {
    marginTop: "40px",
    textAlign: "center",
    fontSize: "14px",
    opacity: 0.9,
  },
};