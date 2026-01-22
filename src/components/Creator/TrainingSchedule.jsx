
import { useState } from "react";
import { useEditableTable } from "../../hooks/useEditableTable";

const TrainingSchedule = ({ isStudent = false }) => {
  const {
    rows,
    isEditMode,
    setIsEditMode,
    saveStatus,
    lastSavedAt,
    dirty,
    updateRow,
    addRow,
    deleteRow,
    save,
  } = useEditableTable({
    storageKey: "trainingSchedule",
    initialRow: { slNo: 1, date: "", session: "Morning", time: "" },
  });

  const [confirmIndex, setConfirmIndex] = useState(null);

  const toggleEditMode = () => {
    if (isEditMode && dirty) {
      save();
    }
    setIsEditMode(p => !p);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <h1 style={styles.pageTitle}>Training Schedule</h1>

      {/* Section Title */}
      <div style={styles.sectionTitle}>Training Schedule</div>

      {/* Top Buttons */}
      {!isStudent && (
        <div style={styles.topButtons}>
          <button onClick={toggleEditMode} style={styles.editBtn} aria-label="Toggle edit mode">
            <img
              src="/Edit button.png"
              width={20}
              height={20}
              alt="Edit"
              style={{ marginRight: 6 }}
            />
            {isEditMode ? "Done Editing" : "Edit"}
          </button>

          {isEditMode && (
            <>
              <button
                onClick={addRow}
                style={{
                  ...styles.addBtn,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <img
                  src="/Add button.png"
                  alt="Add"
                  style={{ width: 16, height: 16 }}
                />
                Add Row
              </button>

              <button
                onClick={save}
                disabled={!dirty}
                style={{
                  ...styles.saveBtn,
                  opacity: dirty ? 1 : 0.6,
                  cursor: dirty ? "pointer" : "not-allowed",
                }}
                aria-label="Save training schedule"
              >
                <img src="/Save button.png" width={20} height={20} alt="Save" style={{ marginRight: 8 }} />
                Save
              </button>
            </>
          )}
        </div>
      )}

      {isEditMode && (
        <div style={styles.statusText}>
          {saveStatus === "saving" && "Saving…"}
          {saveStatus === "saved" && "All changes saved"}
          {lastSavedAt && saveStatus !== "saved" &&
            `Last saved at ${lastSavedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
        </div>
      )}

      {/* Table */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={{ width: "10%" }}>SL.NO</th>
            <th style={{ width: isStudent ? "30%" : "25%" }}>DATE</th>
            <th style={{ width: isStudent ? "30%" : "25%" }}>SESSION</th>
            {!isStudent && <th style={{ width: "25%" }}>TIME</th>}
            <th style={{ width: isStudent ? "30%" : "15%" }}>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan="5" style={styles.emptyState}>
                No training schedules added
              </td>
            </tr>
          )}
          {rows.map((schedule, index) => (
            <tr key={index} style={styles.bodyRow}>
              <td>{schedule.slNo}</td>

              <td>
                <label htmlFor={`date-${index}`} style={{ display: 'none' }}>Training Date for Schedule {schedule.slNo}</label>
                <input
                  id={`date-${index}`}
                  name={`date-${index}`}
                  type="date"
                  value={schedule.date}
                  onChange={(e) => !isStudent && isEditMode && updateRow(index, 'date', e.target.value)}
                  readOnly={isStudent || !isEditMode}
                  style={{ ...styles.input, backgroundColor: (isStudent || !isEditMode) ? '#f8f9fa' : '#fff' }}
                />
              </td>

              <td>
                <label htmlFor={`session-${index}`} style={{ display: 'none' }}>Training Session for Schedule {schedule.slNo}</label>
                <select
                  id={`session-${index}`}
                  name={`session-${index}`}
                  value={schedule.session}
                  onChange={(e) => !isStudent && isEditMode && updateRow(index, 'session', e.target.value)}
                  disabled={isStudent || !isEditMode}
                  style={{ ...styles.select, backgroundColor: (isStudent || !isEditMode) ? '#f8f9fa' : '#fff' }}
                >
                  <option>Morning</option>
                  <option>Evening</option>
                </select>
              </td>

              {!isStudent && (
                <td>
                  <label htmlFor={`time-${index}`} style={{ display: 'none' }}>Training Time for Schedule {schedule.slNo}</label>
                  <input
                    id={`time-${index}`}
                    name={`time-${index}`}
                    type="text"
                    value={schedule.time}
                    onChange={(e) => isEditMode && updateRow(index, 'time', e.target.value)}
                    readOnly={!isEditMode}
                    style={{ ...styles.input, backgroundColor: !isEditMode ? '#f8f9fa' : '#fff' }}
                    placeholder="e.g. 6:00 AM"
                  />
                </td>
              )}

              <td style={styles.actionCell}>
                {!isStudent && isEditMode && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    {/* Save Row */}
                    <button
                      onClick={save}
                      style={styles.iconBtn}
                      aria-label="Save schedule"
                      title="Save schedule"
                    >
                      <img
                        src="/Save button.png"
                        width={20}
                        height={20}
                        alt="Save"
                      />
                    </button>

                    {/* Delete Row */}
                    <button
                      onClick={() => setConfirmIndex(index)}
                      style={styles.iconBtn}
                      aria-label="Delete schedule"
                      title="Delete schedule"
                    >
                      <img
                        src="/Delete button.png"
                        width={20}
                        height={20}
                        alt="Delete"
                      />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      {confirmIndex !== null && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3>Delete Schedule</h3>
            <p>This action cannot be undone.</p>

            <div style={styles.modalActions}>
              <button onClick={() => setConfirmIndex(null)}>
                Cancel
              </button>
              <button style={styles.dangerBtn} onClick={() => {
                deleteRow(confirmIndex);
                setConfirmIndex(null);
              }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
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
    padding: "15px",
    boxSizing: "border-box",
    color: "#fff",
  },

  pageTitle: {
    fontSize: "34px",
    fontWeight: "700",
    marginBottom: "10px",
  },

  sectionTitle: {
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "15px",
  },

  topButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },

  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#0d6efd",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  addBtn: {
    backgroundColor: "#198754",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    fontSize: "15px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  saveBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#198754",
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    minWidth: "140px",
    fontSize: "15px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  table: {
    width: "100%",
    backgroundColor: "#ffffff",
    color: "#000",
    borderCollapse: "separate",
    borderSpacing: "0",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "30px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },

  headerRow: {
    background: "linear-gradient(90deg, #0d6efd, #0a58ca)",
    color: "#fff",
    height: "52px",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  bodyRow: {
    height: "56px",
    fontSize: "15px",
    borderBottom: "1px solid #eee",
    transition: "background-color 0.2s ease",
  },

  input: {
    width: "100%",
    height: "38px",
    padding: "0 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s",
  },

  select: {
    width: "100%",
    height: "38px",
    padding: "0 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
    outline: "none",
    cursor: "pointer",
    transition: "border 0.2s, box-shadow 0.2s",
  },

  actionCell: {
    padding: "10px 16px",
    verticalAlign: "middle",
    textAlign: "center",
    width: "15%",
  },

  iconBtn: {
    background: "transparent",
    border: "none",
    padding: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.15s ease",
  },

  statusText: {
    fontSize: "13px",
    marginTop: "6px",
    color: "#6c757d",
  },

  emptyState: {
    textAlign: "center",
    padding: "20px",
    fontSize: "14px",
    color: "#6c757d",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modalBox: {
    background: "#fff",
    color: "#000",
    padding: "20px",
    borderRadius: "12px",
    width: "320px",
    textAlign: "center",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  dangerBtn: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "6px",
  },

  footer: {
    marginTop: "40px",
    textAlign: "center",
    fontSize: "14px",
    color: "#fff",
  },
};
