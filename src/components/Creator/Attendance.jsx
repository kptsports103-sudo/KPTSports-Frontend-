import { useState, useEffect } from 'react';

const Attendance = ({ isStudent = false }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [date, setDate] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [rows, setRows] = useState([
    { slNo: 1, playerName: '', morning: 'Present', evening: 'Present' }
  ]);
  const [playerNames, setPlayerNames] = useState([]);

  useEffect(() => {
    const savedPlayers = localStorage.getItem("playersData");
    if (!savedPlayers) {
      setPlayerNames([]);
      return;
    }

    const playersData = JSON.parse(savedPlayers);

    const yearData = playersData.find(
      y => Number(y.year) === Number(selectedYear)
    );

    if (yearData && Array.isArray(yearData.players)) {
      setPlayerNames(
        yearData.players
          .map(p => p.name)
          .filter(Boolean)
      );
    } else {
      setPlayerNames([]);
    }
  }, [selectedYear]);

  useEffect(() => {
    setRows([
      { slNo: 1, playerName: '', morning: 'Present', evening: 'Present' }
    ]);
  }, [selectedYear]);

  useEffect(() => {
    const saved = localStorage.getItem("attendanceData");
    if (saved) {
      setRows(JSON.parse(saved));
    } else {
      setRows([{ slNo: 1, playerName: '', morning: 'Present', evening: 'Present' }]);
    }
  }, []);

  const addRow = () => {
    const newSlNo = rows.length + 1;
    setRows([...rows, { slNo: newSlNo, playerName: '', morning: 'Present', evening: 'Present' }]);
  };

  const deleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    const updated = newRows.map((row, i) => ({ ...row, slNo: i + 1 }));
    setRows(updated);
  };

  const updateField = (index, field, value) => {
    if (!isEditMode) return;
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const saveAttendance = () => {
    if (!date) {
      alert("Please select a date");
      return;
    }
    localStorage.setItem("attendanceData", JSON.stringify(rows));
    alert("Attendance saved for " + date);
    setIsEditMode(false);
  };

  const saveRow = (index) => {
    const row = rows[index];

    if (!row.playerName) {
      alert("Please select a player before saving the row");
      return;
    }

    // Here you can later call backend for single-row save
    console.log("Saved row:", row);

    alert(`Saved Row ${row.slNo}`);
  };

  const getSelectedPlayers = (currentIndex) =>
    rows
      .filter((_, i) => i !== currentIndex)
      .map(r => r.playerName)
      .filter(Boolean);

  const addYear = () => {
    const yearInput = prompt("Enter year (e.g. 2026):");
    if (!yearInput) return;

    const year = Number(yearInput);
    if (isNaN(year)) {
      alert("Invalid year");
      return;
    }

    setSelectedYear(year);
  };

  return (
    <div style={styles.page}>
   

      {/* Section Title */}
      <div style={styles.sectionTitle}>Attendance List</div>

      {/* White Card Container */}
      <div style={styles.card}>
        {/* Card Header with Edit Button */}
        {!isStudent && (
          <div style={styles.cardHeader}>
            <button
              onClick={() => setIsEditMode(p => !p)}
              style={styles.primaryBtn}
            >
              <img src="/Edit button.png" width={20} height={20} alt="Edit" />
              {isEditMode ? "Done Editing" : "Edit"}
            </button>

            {isEditMode && (
              <>
                <button onClick={addRow} style={styles.successBtn}>
                  <img src="/Add button.png" width={20} height={20} alt="Add" />
                  Add Row
                </button>

                <button onClick={saveAttendance} style={styles.primaryBtn}>
                  <img src="/Save button.png" width={20} height={20} alt="Save" />
                  Save All
                </button>
              </>
            )}
          </div>
        )}

        {!isStudent && (
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label htmlFor="attendance-year">Year</label>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <select
                  id="attendance-year"
                  name="attendance-year"
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  style={styles.filterGroupInput}
                >
                  <option value={currentYear}>{currentYear} (All)</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>

                {isEditMode && (
                  <button
                    onClick={addYear}
                    style={{
                      ...styles.addYearBtn,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    title="Add Year"
                  >
                    <img
                      src="/Add button.png"
                      width={16}
                      height={16}
                      alt="Add"
                    />
                    Add Year
                  </button>
                )}
              </div>
            </div>

            <div style={styles.filterGroup}>
              <label htmlFor="attendance-date">Date</label>
              <input
                id="attendance-date"
                name="attendance-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                disabled={!isEditMode}
                style={styles.filterGroupInput}
              />
            </div>
          </div>
        )}

        {/* Table */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={{ textAlign: 'center' }}>SL.NO</th>
              <th style={{ textAlign: 'left' }}>PLAYER</th>
              <th style={{ textAlign: 'center' }}>MORNING</th>
              <th style={{ textAlign: 'center' }}>EVENING</th>
              <th style={{ textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index} style={styles.bodyRow}>
                <td style={{ textAlign: 'center' }}>{row.slNo}</td>

                <td style={{ textAlign: 'left' }}>
                  <select
                    id={`player-select-${index}`}
                    name={`player-select-${index}`}
                    value={row.playerName}
                    onChange={e => updateField(index, 'playerName', e.target.value)}
                    disabled={!isEditMode}
                  >
                    <option value="">Select Player</option>
                    {playerNames.map(name => {
                      const alreadySelected = getSelectedPlayers(index).includes(name);
                      return (
                        <option
                          key={name}
                          value={name}
                          disabled={alreadySelected}
                        >
                          {name}{alreadySelected ? " (Already selected)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </td>

                <td style={{ textAlign: 'center' }}>
                  <select
                    id={`morning-select-${index}`}
                    name={`morning-select-${index}`}
                    value={row.morning}
                    onChange={e => updateField(index, 'morning', e.target.value)}
                    disabled={!isEditMode}
                  >
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Late</option>
                    <option>Excused</option>
                  </select>
                </td>

                <td style={{ textAlign: 'center' }}>
                  <select
                    id={`evening-select-${index}`}
                    name={`evening-select-${index}`}
                    value={row.evening}
                    onChange={e => updateField(index, 'evening', e.target.value)}
                    disabled={!isEditMode}
                  >
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Late</option>
                    <option>Excused</option>
                  </select>
                </td>

                <td style={styles.actionCell}>
                  {isEditMode && (
                    <>
                      <button
                        onClick={() => saveRow(index)}
                        style={styles.iconBtn}
                        title="Save Row"
                      >
                        <img src="/Save button.png" width={20} height={20} alt="Save Row" />
                      </button>
                      <button
                        onClick={() => {
                          deleteRow(index);
                          alert(`Deleted Row ${rows[index].slNo}`);
                        }}
                        style={styles.iconBtn}
                        title="Delete Row"
                      >
                        <img src="/Delete button.png" width={20} height={20} alt="Delete Row" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#e5e7eb", // Silver / light gray
    padding: "15px",
    boxSizing: "border-box",
    color: "#111827", // Dark professional text
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

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    padding: "16px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    position: "relative",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "12px",
  },

  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    color: "#111827",
    border: "1px solid #d1d5db",
    padding: "8px 14px",
    fontSize: "14px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  successBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    color: "#111827",
    border: "1px solid #d1d5db",
    padding: "8px 14px",
    fontSize: "14px",
    borderRadius: "6px",
    cursor: "pointer",
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
    borderRadius: "2px", // sharp
    border: "1px solid #d1d5db",
    fontSize: "14px",
    color: "#000",
    backgroundColor: "#fff",
  },

  addYearBtn: {
    backgroundColor: "#ffffff",
    color: "#111827",
    border: "1px solid #d1d5db",
    padding: "8px 12px",
    fontSize: "13px",
    borderRadius: "6px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  table: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    background: "#fff",
    color: "#000",
    borderCollapse: "separate",
    borderSpacing: 0,
    borderRadius: "0px", // fully pointy
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },

  headerRow: {
    backgroundColor: "#f3f4f6",
    color: "#111827",
    height: "52px",
    fontSize: "13px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },

  bodyRow: {
    height: "56px",
    fontSize: "15px",
    borderBottom: "1px solid #eee",
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