import React, { useState, useEffect } from 'react';

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

  topButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginBottom: "14px",
  },

  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#0d6efd",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    fontSize: "14px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  successBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#198754",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    fontSize: "14px",
    borderRadius: "6px",
    cursor: "pointer",
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

  iconBtn: {
    background: "transparent",
    border: "none",
    padding: "6px",
    cursor: "pointer",
    transition: "transform 0.15s ease",
  },

  footer: {
    marginTop: "40px",
    textAlign: "center",
    fontSize: "14px",
    opacity: 0.9,
  },
};

const Performance = ({ isStudent = false }) => {
  const [players, setPlayers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("performanceData");
    setPlayers(
      saved
        ? JSON.parse(saved)
        : [
            { id: 1, name: "Athlete A", status: "High Performance" },
            { id: 2, name: "Athlete B", status: "Progressing Well" },
            { id: 3, name: "Athlete C", status: "In Development" },
          ]
    );
  }, []);

  const addRow = () => {
    const id = Math.max(...players.map(p => p.id), 0) + 1;
    setPlayers([...players, { id, name: "", status: "In Development" }]);
  };

  const saveAll = () => {
    localStorage.setItem("performanceData", JSON.stringify(players));
    alert("Performance saved");
  };

  const savePlayer = (player) => {
    alert(`Saved ${player.name}`);
  };

  const deleteRow = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>
        {isStudent ? "Student Dashboard" : "Coach Dashboard"}
      </h1>

      <div style={styles.sectionTitle}>Performance Reports</div>

      {!isStudent && (
        <div style={styles.topButtons}>
          <button
            onClick={() => setIsEditMode(p => !p)}
            style={styles.primaryBtn}
          >
            <img
              src="/Edit button.png"
              width={20}
              height={20}
              alt="Edit"
            />
            {isEditMode ? "Done Editing" : "Edit"}
          </button>

          {isEditMode && (
            <>
              <button
                onClick={addRow}
                style={{
                  ...styles.successBtn,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <img
                  src="/Add button.png"
                  width={20}
                  height={20}
                  alt="Add"
                />
                Add Row
              </button>

              <button onClick={saveAll} style={styles.primaryBtn}>
                <img src="/Save button.png" width={20} height={20} alt="Save" />
                Save All
              </button>
            </>
          )}
        </div>
      )}

      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th>SL.NO</th>
            <th>ATHLETE NAME</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {players.map((player, i) => (
            <tr key={player.id} style={styles.bodyRow}>
              <td>{i + 1}</td>

              <td>
                <input
                  value={player.name}
                  onChange={e =>
                    isEditMode &&
                    setPlayers(p =>
                      p.map(x =>
                        x.id === player.id ? { ...x, name: e.target.value } : x
                      )
                    )
                  }
                  readOnly={!isEditMode}
                  style={{
                    ...styles.input,
                    backgroundColor: !isEditMode ? "#f8f9fa" : "#fff",
                  }}
                />
              </td>

              <td>
                <select
                  value={player.status}
                  onChange={e =>
                    isEditMode &&
                    setPlayers(p =>
                      p.map(x =>
                        x.id === player.id
                          ? { ...x, status: e.target.value }
                          : x
                      )
                    )
                  }
                  disabled={!isEditMode}
                  style={{
                    ...styles.select,
                    backgroundColor: !isEditMode ? "#f8f9fa" : "#fff",
                  }}
                >
                  <option>High Performance</option>
                  <option>Progressing Well</option>
                  <option>In Development</option>
                </select>
              </td>

              <td style={styles.actionCell}>
                {!isStudent && isEditMode && (
                  <>
                    <button
                      onClick={() => savePlayer(player)}
                      style={styles.iconBtn}
                      title="Save"
                    >
                      <img src="/Save button.png" width={20} height={20} alt="Save" />
                    </button>

                    <button
                      onClick={() => deleteRow(player.id)}
                      style={styles.iconBtn}
                      title="Delete"
                    >
                      <img src="/Delete button.png" width={20} height={20} alt="Delete" />
                    </button>
                  </>
                )}
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

export default Performance;
