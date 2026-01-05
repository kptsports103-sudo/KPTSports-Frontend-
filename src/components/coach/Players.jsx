
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAutoSave } from '../../hooks/useAutoSave';

const Players = ({ isStudent = false }) => {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedData, setLastSavedData] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
  const [dirtyRows, setDirtyRows] = useState(new Set());
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const currentYear = new Date().getFullYear();
  const ITEMS_PER_PAGE = 5;

  const isOffline = !navigator.onLine;

  const queueOfflineSave = (payload) => {
    const queue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
    queue.push(payload);
    localStorage.setItem("offlineQueue", JSON.stringify(queue));
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await api.get('/home/players');
        const grouped = res.data;
        const dataArray = Object.keys(grouped).map(year => ({
          year: parseInt(year),
          players: grouped[year]
        }));
        setData(dataArray);
        setDirtyRows(new Set());

        // Auto-select current year or latest
        const years = dataArray.map(d => d.year);
        if (years.includes(currentYear)) {
          setSelectedYear(String(currentYear));
        } else if (years.length > 0) {
          setSelectedYear(String(Math.max(...years)));
        }
      } catch (error) {
        console.error('Error fetching players:', error);
        // Fallback to localStorage if API fails
        const saved = localStorage.getItem("playersData");
        if (saved) {
          const parsed = JSON.parse(saved);
          setData(parsed);
          setDirtyRows(new Set());

          const years = parsed.map(d => d.year);
          if (years.includes(currentYear)) {
            setSelectedYear(String(currentYear));
          } else if (years.length > 0) {
            setSelectedYear(String(Math.max(...years)));
          }
        }
      }
    };
    fetchPlayers();
  }, [currentYear]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedYear]);

  useEffect(() => {
    const syncOfflineQueue = async () => {
      const queue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
      if (queue.length === 0) return;

      for (const payload of queue) {
        await api.post('/home/players', { data: payload });
      }

      localStorage.removeItem("offlineQueue");
      console.log("Offline data synced");
    };

    window.addEventListener("online", syncOfflineQueue);
    return () => window.removeEventListener("online", syncOfflineQueue);
  }, []);

  const addYear = () => {
    const yearInput = prompt("Enter the year to add:");
    if (!yearInput) return;

    const year = parseInt(yearInput);
    if (isNaN(year) || year < 1900 || year > 2100) {
      alert("Please enter a valid year between 1900 and 2100");
      return;
    }

    if (data.some(d => d.year === year)) {
      alert("Year already exists");
      return;
    }

    setData([...data, { year, players: [] }]);
    setDirtyRows(prev => {
      const next = new Set(prev);
      next.add('structure');
      return next;
    });
  };


  const addPlayerRow = (year) => {
    const newData = data.map(d =>
      d.year === year
        ? { ...d, players: [...d.players, { name: '', branch: '', diplomaYear: '1' }] }
        : d
    );
    setData(newData);
    setDirtyRows(prev => {
      const next = new Set(prev);
      next.add('structure');
      return next;
    });
  };

  const updatePlayer = (year, playerIndex, field, value) => {
    setData(prev =>
      prev.map(d =>
        d.year === year
          ? {
              ...d,
              players: d.players.map((p, i) =>
                i === playerIndex ? { ...p, [field]: value } : p
              ),
            }
          : d
      )
    );

    setDirtyRows(prev => {
      const next = new Set(prev);
      next.add(`${year}-${playerIndex}`);
      return next;
    });
  };

  const deleteRow = (year, playerIndex) => {
    const newData = data.map(d =>
      d.year === year
        ? { ...d, players: d.players.filter((_, i) => i !== playerIndex) }
        : d
    );
    setData(newData);
    setDirtyRows(prev => {
      const next = new Set(prev);
      next.add('structure');
      return next;
    });
  };

  // Removed confirmation modal - direct delete with feedback

  const autoSave = async () => {
    if (isSaving) return;

    // Check if there are any valid players to save
    const hasValidPlayers = data.some(yearData =>
      yearData.players.some(player =>
        player.name && player.name.trim() &&
        player.branch && player.branch.trim()
      )
    );

    if (!hasValidPlayers) {
      // No valid players, skip autosave
      setDirtyRows(new Set());
      return;
    }

    setAutoSaveStatus("saving");

    try {
      await saveAll(false); // Don't show alert for autosave
      setAutoSaveStatus("saved");

      setTimeout(() => {
        setAutoSaveStatus("idle");
      }, 1500);
    } catch {
      setAutoSaveStatus("error");
    }
  };

  // Disabled autosave for admin/coach dashboard - saves should be explicit
  // useAutoSave({
  //   enabled: isEditMode,
  //   dirty: dirtyRows,
  //   isSaving,
  //   onSave: autoSave,
  // });

  const deleteYear = (year) => {
    const newData = data.filter(d => d.year !== year);
    setData(newData);
    setDirtyRows(prev => {
      const next = new Set(prev);
      next.add('structure');
      return next;
    });
  };

  const savePlayerRow = (year, index) => {
    const yearData = data.find(d => d.year === year);
    const player = yearData?.players[index];

    if (!player?.name) {
      alert("Player name is required before saving");
      return;
    }

    // Future: call backend for single-row save
    console.log("Saved player row:", { year, player });

    alert(`Saved Row ${index + 1}`);
  };

  const saveAll = async (showFeedback = true) => {
    if (isSaving) return;

    // Filter out invalid players (missing name or branch)
    const validData = data.map(yearData => ({
      ...yearData,
      players: yearData.players.filter(player =>
        player.name && player.name.trim() &&
        player.branch && player.branch.trim()
      )
    })).filter(yearData => yearData.players.length > 0);

    console.log("Original data:", data);
    console.log("Valid data to save:", validData);

    if (validData.length === 0) {
      alert("No valid players to save. Please fill in names and branches for at least one player.");
      return;
    }

    // Backup last known good state
    setLastSavedData(JSON.parse(JSON.stringify(data)));
    setIsSaving(true);

    try {
      // Optimistically assume success
      localStorage.setItem("playersData", JSON.stringify(validData));

      // Background API save
      await api.post('/home/players', { data: validData });

      // Success feedback
      console.log("Saved successfully");
      if (showFeedback) {
        alert("Players saved successfully!");
      }
      setLastSavedAt(new Date());
      setDirtyRows(new Set());
    } catch (error) {
      console.error("Save failed:", error);

      if (isOffline) {
        queueOfflineSave(validData);
        console.warn("Offline: changes queued");
      } else {
        // Rollback UI
        if (lastSavedData) {
          setData(lastSavedData);
        }

        alert("Save failed. Changes were reverted.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <h1 style={styles.pageTitle}>{isStudent ? '' : 'Coach Dashboard'}</h1>

      {/* Section Title */}
      <div style={styles.sectionTitle}>Players List</div>

      {/* Year Selector */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid #2f6f5f',
            fontSize: '14px',
            backgroundColor: '#123f33',
            color: '#ffffff',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all" style={{ backgroundColor: '#123f33', color: '#fff' }}>
            All Years
          </option>
          {[...data]
            .map(d => d.year)
            .sort((a, b) => b - a)
            .map(year => (
              <option
                key={year}
                value={year}
                style={{ backgroundColor: '#123f33', color: '#fff' }}
              >
                {year}
              </option>
            ))}
        </select>
      </div>

      {/* Top Buttons */}
      {!isStudent && (
        <div style={styles.topButtons}>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            style={styles.editBtn}
          >
            <img
              src="/Edit button.png"
              alt="Edit"
              style={{ width: 16, height: 16 }}
            />
            {isEditMode ? "Done Editing" : "Edit"}
          </button>

          {isEditMode && (
            <button
              onClick={saveAll}
              disabled={isSaving}
              style={{
                ...styles.saveAllBtn,
                opacity: isSaving ? 0.6 : 1,
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
            >
              <img
                src="/Save button.png"
                alt="Save"
                style={{ width: 20, height: 20, marginRight: 6 }}
              />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}

          {isEditMode && (
            <button
              onClick={addYear}
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
              Add New Year
            </button>
          )}
        </div>
      )}

      {isEditMode && (
        <div style={styles.autoSaveStatus}>
          {autoSaveStatus === "saving" && "Saving changes..."}
          {autoSaveStatus === "saved" && "All changes saved"}
          {autoSaveStatus === "error" && "Autosave failed"}
        </div>
      )}

      {lastSavedAt && (
        <div style={styles.saveTimestamp}>
          Last saved at{" "}
          {lastSavedAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      {isSaving && (
        <div style={styles.savingIndicator}>
          Saving changes...
        </div>
      )}

      {/* Content */}
      {(() => {
        const displayedData =
          selectedYear === "all"
            ? [...data].sort((a, b) => b.year - a.year)
            : data.filter(d => d.year === Number(selectedYear));
        return displayedData.map((yearData) => (
          <div key={yearData.year} style={styles.yearCard}>
            <div
              style={{
                height: "4px",
                width: "100%",
                background: "linear-gradient(to right, #0d6efd, #20c997)",
                borderRadius: "10px",
                marginBottom: "12px",
              }}
            />
            <h3 style={styles.yearTitle}>
              Year: {yearData.year}
              <span style={styles.countBadge}>
                {yearData.players.length} Players
              </span>
            </h3>

            <div style={styles.tableToolbar}>
              <input
                type="text"
                placeholder="Search by name or branch..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={styles.searchInput}
              />

              <div style={styles.resultCount}>
                Showing {(() => {
                  const filteredPlayers = yearData.players.filter(player =>
                    player.name.toLowerCase().includes(search.toLowerCase()) ||
                    player.branch.toLowerCase().includes(search.toLowerCase())
                  );
                  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
                  const paginatedPlayers = filteredPlayers.slice(
                    (currentPage - 1) * ITEMS_PER_PAGE,
                    currentPage * ITEMS_PER_PAGE
                  );
                  return `${paginatedPlayers.length} of ${filteredPlayers.length}`;
                })()} players
              </div>
            </div>

            {(() => {
              const filteredPlayers = yearData.players.filter(player =>
                player.name.toLowerCase().includes(search.toLowerCase()) ||
                player.branch.toLowerCase().includes(search.toLowerCase())
              );
              const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
              const paginatedPlayers = filteredPlayers.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE
              );

              return (
                <>
                  <table style={styles.table}>
                    <thead style={styles.stickyHeader}>
                      <tr style={styles.headerRow}>
                        <th style={{ width: "60px", padding: "12px 16px", textAlign: "left" }}>SL.NO</th>
                        <th style={{ width: "90px", padding: "12px 16px", textAlign: "left" }}>YEAR</th>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>PLAYER NAME</th>
                        <th style={{ width: "160px", padding: "12px 16px", textAlign: "left" }}>BRANCH</th>
                        <th style={{ width: "140px", padding: "12px 16px", textAlign: "left" }}>DIPLOMA YEAR</th>
                        {!isStudent && <th style={{ width: "100px", padding: "12px 16px", textAlign: "left" }}>ACTIONS</th>}
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedPlayers.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={styles.emptyState}>
                            No players found
                          </td>
                        </tr>
                      ) : (
                        paginatedPlayers.map((player, playerIndex) => {
                          const isEditable = !isStudent && isEditMode;
                          return (
                            <tr
                              key={playerIndex}
                              style={{
                                ...styles.bodyRow,
                                backgroundColor: playerIndex % 2 === 0 ? "#ffffff" : "#f8f9fb",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5faff")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = playerIndex % 2 === 0 ? "#ffffff" : "#f8f9fb")}
                            >
                              <td style={{ padding: "10px 16px" }}>{(currentPage - 1) * ITEMS_PER_PAGE + playerIndex + 1}</td>
                              <td style={{ padding: "10px 16px" }}>{yearData.year}</td>
                              <td style={{ padding: "10px 16px" }}>
                                <input
                                  type="text"
                                  value={player.name}
                                  onChange={(e) => updatePlayer(yearData.year, playerIndex, 'name', e.target.value)}
                                  readOnly={!isEditable}
                                  style={{ ...styles.input, backgroundColor: !isEditable ? '#f8f9fa' : '#fff' }}
                                  onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px rgba(13,110,253,.25)"}
                                  onBlur={(e) => e.target.style.boxShadow = "none"}
                                />
                              </td>
                              <td style={{ padding: "10px 16px" }}>
                                <input
                                  type="text"
                                  value={player.branch}
                                  onChange={(e) => updatePlayer(yearData.year, playerIndex, 'branch', e.target.value)}
                                  readOnly={!isEditable}
                                  style={{ ...styles.input, backgroundColor: !isEditable ? '#f8f9fa' : '#fff' }}
                                  onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px rgba(13,110,253,.25)"}
                                  onBlur={(e) => e.target.style.boxShadow = "none"}
                                />
                              </td>
                              <td style={{ padding: "10px 16px" }}>
                                <select
                                  value={player.diplomaYear}
                                  onChange={(e) => updatePlayer(yearData.year, playerIndex, 'diplomaYear', e.target.value)}
                                  disabled={!isEditable}
                                  style={{ ...styles.select, backgroundColor: !isEditable ? '#f8f9fa' : '#fff' }}
                                  onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px rgba(13,110,253,.25)"}
                                  onBlur={(e) => e.target.style.boxShadow = "none"}
                                >
                                  <option>1</option>
                                  <option>2</option>
                                  <option>3</option>
                                </select>
                              </td>
                              {!isStudent && (
                                <td style={styles.actionCell}>
                                  {isEditable && (
                                    <>
                                      <button
                                        onClick={() => savePlayerRow(yearData.year, playerIndex)}
                                        style={styles.actionBtn}
                                        title="Save Row"
                                      >
                                        <img
                                          src="/Save button.png"
                                          width={20}
                                          height={20}
                                          alt="Save Row"
                                        />
                                      </button>
                                      <button
                                        onClick={() => {
                                          deleteRow(yearData.year, playerIndex);
                                          alert(`Deleted Row ${playerIndex + 1}`);
                                        }}
                                        style={styles.actionBtn}
                                        title="Delete Row"
                                      >
                                        <img
                                          src="/Delete button.png"
                                          width={20}
                                          height={20}
                                          alt="Delete Row"
                                        />
                                      </button>
                                    </>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {totalPages > 1 && (
                    <div style={styles.pagination}>
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        style={styles.pageBtn}
                      >
                        Prev
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          style={{
                            ...styles.pageBtn,
                            backgroundColor: currentPage === i + 1 ? "#0d6efd" : "#fff",
                            color: currentPage === i + 1 ? "#fff" : "#000",
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        style={styles.pageBtn}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              );
            })()}

            {!isStudent && isEditMode && (
              <div style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => deleteYear(yearData.year)}
                  style={styles.deleteYearBtn}
                >
                  Delete Year
                </button>
              </div>
            )}

            {!isStudent && isEditMode && (
              <div style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => addPlayerRow(yearData.year)}
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
                  Add Player
                </button>
              </div>
            )}
          </div>
        ));
      })()}


      {/* Footer */}
      <div style={styles.footer}>
        © 2023 KPT Sports. All rights reserved.
      </div>
    </div>
  );
};

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

  yearCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "28px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },

  yearTitle: {
    marginTop: "20px",
    fontSize: "20px",
    fontWeight: "600",
  },

  countBadge: {
    marginLeft: "10px",
    backgroundColor: "#e7f1ff",
    color: "#0d6efd",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
  },

  topButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },

  stickyHeader: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    background: "linear-gradient(90deg, #0d6efd, #0a58ca)",
  },

  addBtn: {
    backgroundColor: "#198754",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    fontSize: "15px",
    borderRadius: "6px",
    marginRight: "10px",
    cursor: "pointer",
  },

  saveAllBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#198754",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
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
    display: "table-row",
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
  },

  actionBtn: {
    background: "transparent",
    border: "none",
    padding: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.15s ease",
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

  saveBtn: {
    backgroundColor: "#495057",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    fontSize: "14px",
    borderRadius: "6px",
    marginRight: "8px",
    cursor: "pointer",
  },

  deleteBtn: {
    backgroundColor: "#b02a37",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    fontSize: "13px",
    borderRadius: "20px",
    cursor: "pointer",
  },

  deleteYearBtn: {
    backgroundColor: "transparent",
    color: "#dc3545",
    border: "1px solid #dc3545",
    padding: "6px 14px",
    fontSize: "13px",
    borderRadius: "20px",
    cursor: "pointer",
  },

  tableToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    gap: "10px",
    flexWrap: "wrap",
  },

  searchInput: {
    width: "260px",
    height: "36px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
    fontSize: "14px",
    color: "#000",
  },

  resultCount: {
    fontSize: "13px",
    color: "#6c757d",
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    marginTop: "14px",
  },

  pageBtn: {
    border: "1px solid #ced4da",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    background: "#fff",
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

  autoSaveStatus: {
    fontSize: "13px",
    marginTop: "6px",
    color: "#6c757d",
  },

  savingIndicator: {
    fontSize: "13px",
    color: "#0d6efd",
    marginTop: "8px",
  },

  saveTimestamp: {
    fontSize: "12px",
    color: "#6c757d",
    marginTop: "4px",
  },

  footer: {
    marginTop: "40px",
    textAlign: "center",
    fontSize: "14px",
    color: "#fff",
  },
};

export default Players;
