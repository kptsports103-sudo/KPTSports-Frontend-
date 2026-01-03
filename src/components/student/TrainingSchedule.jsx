import { useState, useEffect } from 'react';

const TrainingSchedule = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("trainingSchedule");
    if (saved) {
      setSchedules(JSON.parse(saved));
    } else {
      setSchedules([{ slNo: 1, date: '', session: 'Morning', time: '' }]);
    }
  }, []);

  return (
    <div style={styles.page}>
      
      <div style={styles.sectionTitle}>Training Schedule</div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th>SL.NO</th>
            <th>DATE</th>
            <th>SESSION</th>
            <th>TIME</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {schedules.map((schedule, index) => (
            <tr key={index} style={styles.bodyRow}>
              <td>{schedule.slNo}</td>

              <td>
                <input
                  type="date"
                  value={schedule.date}
                  readOnly
                  style={{
                    ...styles.input,
                    backgroundColor: "#f8f9fa",
                  }}
                />
              </td>

              <td>
                <select
                  value={schedule.session}
                  disabled
                  style={{
                    ...styles.select,
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <option>Morning</option>
                  <option>Evening</option>
                </select>
              </td>

              <td>
                <input
                  type="text"
                  value={schedule.time}
                  readOnly
                  style={{
                    ...styles.input,
                    backgroundColor: "#f8f9fa",
                  }}
                />
              </td>

              <td style={styles.actionCell}>
                {/* Actions hidden for students - read-only view */}
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

export default TrainingSchedule;

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

  input: {
    width: "100%",
    height: "38px",
    padding: "0 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
  },

  select: {
    width: "100%",
    height: "38px",
    padding: "0 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
  },

  actionCell: {
    textAlign: "center",
  },

  footer: {
    marginTop: "40px",
    textAlign: "center",
    fontSize: "14px",
    opacity: 0.9,
  },
};