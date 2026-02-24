import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { FaEye } from 'react-icons/fa';
import { MdInsights } from 'react-icons/md';
import PlayerIntelligencePanel from './PlayerIntelligencePanel';

const PlayerIntelligence = () => {
  const [data, setData] = useState([]);
  const [individualResults, setIndividualResults] = useState([]);
  const [teamResults, setTeamResults] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const currentYear = new Date().getFullYear();
  const ITEMS_PER_PAGE = 10;
  const srOnlyStyle = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const [playersRes, individualRes, groupRes] = await Promise.all([
          api.get('/home/players'),
          api.get('/results'),
          api.get('/group-results')
        ]);

        const grouped = playersRes.data;
        const dataArray = Object.keys(grouped).map(year => ({
          year: parseInt(year),
          players: grouped[year].map(p => ({
            ...p,
            id: p.id || p.playerId || crypto.randomUUID(),
            masterId: p.masterId || '',
            semester: p.semester || '1',
            kpmNo: p.kpmNo || '',
            events: Array.isArray(p.events) ? p.events : [],
          })),
        }));
        
        // Sort by year descending
        dataArray.sort((a, b) => b.year - a.year);
        setData(dataArray);

        // Auto-select current year or latest
        const years = dataArray.map(d => d.year);
        if (years.includes(currentYear)) {
          setSelectedYear(String(currentYear));
        } else if (years.length > 0) {
          setSelectedYear(String(Math.max(...years)));
        }

        setIndividualResults(Array.isArray(individualRes?.data) ? individualRes.data : []);
        setTeamResults(Array.isArray(groupRes?.data) ? groupRes.data : []);
      } catch (error) {
        console.error('Error fetching players:', error);
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

  // Get available years
  const availableYears = useMemo(() => {
    return data.map(d => d.year).sort((a, b) => b - a);
  }, [data]);

  // Filter data
  const filteredData = useMemo(() => {
    let result = data;

    // Filter by year
    if (selectedYear !== "all") {
      result = result.filter(d => d.year === parseInt(selectedYear));
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.map(yearData => ({
        ...yearData,
        players: yearData.players.filter(p => 
          (p.name && p.name.toLowerCase().includes(searchLower)) ||
          (p.kpmNo && p.kpmNo.toLowerCase().includes(searchLower)) ||
          (p.branch && p.branch.toLowerCase().includes(searchLower))
        )
      })).filter(yearData => yearData.players.length > 0);
    }

    return result;
  }, [data, selectedYear, search]);

  // Get all players for table
  const allPlayers = useMemo(() => {
    return filteredData.flatMap(yearData => 
      yearData.players.map(p => ({
        ...p,
        year: yearData.year
      }))
    );
  }, [filteredData]);

  // Paginate
  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allPlayers.slice(start, start + ITEMS_PER_PAGE);
  }, [allPlayers, currentPage]);

  const totalPages = Math.ceil(allPlayers.length / ITEMS_PER_PAGE);

  const handleViewPlayer = (player) => {
    setSelectedPlayer(player);
  };

  const closeModal = () => {
    setSelectedPlayer(null);
  };

  const tableStyles = {
    pageShell: {
      background: "linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%)",
      border: "1px solid #dbeafe",
      borderRadius: "16px",
      padding: "18px",
      boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    },
    headerPanel: {
      textAlign: "center",
      fontSize: "20px",
      fontWeight: 700,
      marginBottom: "14px",
      color: "#0f172a",
      background: "linear-gradient(90deg, #dbeafe, #e0f2fe)",
      border: "1px solid #bfdbfe",
      borderRadius: "10px",
      padding: "12px 16px",
      boxShadow: "0 6px 16px rgba(37, 99, 235, 0.12)",
    },
    filterCard: {
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "12px",
      marginBottom: "14px",
      boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
      position: "sticky",
      top: 0,
      zIndex: 3,
    },
    selectBox: {
      height: "42px",
      border: "1px solid #cbd5e1",
      borderRadius: "10px",
      background: "#f8fafc",
      color: "#0f172a",
      fontSize: "14px",
      fontWeight: 600,
      padding: "0 12px",
      minWidth: "130px",
    },
    searchBox: {
      flex: 1,
      minWidth: "260px",
      height: "42px",
      border: "1px solid #cbd5e1",
      borderRadius: "10px",
      background: "#ffffff",
      color: "#0f172a",
      fontSize: "14px",
      padding: "0 14px",
      outline: "none",
    },
    statsCard: {
      background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
      border: "1px solid #93c5fd",
      borderRadius: "10px",
      padding: "10px 14px",
      minWidth: "160px",
      textAlign: "center",
    },
    tableShell: {
      border: "1px solid #dbe3ef",
      borderRadius: "12px",
      overflow: "hidden",
      background: "#ffffff",
      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
    },
    paginationShell: {
      background: "linear-gradient(135deg, #ffffff, #f8fbff)",
      border: "1px solid #dbe3ef",
      borderRadius: "12px",
      padding: "10px 14px",
      boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
    },
    paginationBtn: (disabled) => ({
      minWidth: "96px",
      height: "38px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      background: disabled ? "#f1f5f9" : "linear-gradient(135deg, #e0ecff, #dbeafe)",
      color: "#1e3a8a",
      fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
    }),
    paginationMeta: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      border: "1px solid #dbe3ef",
      borderRadius: "9px",
      background: "#f8fafc",
      color: "#334155",
      fontWeight: 700,
      padding: "7px 12px",
      lineHeight: 1,
    },
    paginationBadge: {
      background: "#1d4ed8",
      color: "#ffffff",
      borderRadius: "999px",
      minWidth: "26px",
      height: "26px",
      padding: "0 8px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "13px",
      fontWeight: 800,
    },
    table: {
      width: "100%",
      backgroundColor: "#ffffff",
      color: "#000",
      borderCollapse: "separate",
      borderSpacing: "0",
      borderRadius: "0px",
      overflow: "hidden",
      marginBottom: "30px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    },
    stickyHeader: {
      position: "sticky",
      top: 0,
      zIndex: 2,
      background: "linear-gradient(90deg, #0d6efd, #0a58ca)",
    },
    headerRow: {
      color: "#ffffff",
      height: "52px",
      fontSize: "13px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    bodyRow: {
      height: "56px",
      fontSize: "15px",
      borderBottom: "1px solid #eee",
      transition: "background-color 0.2s ease",
      display: "table-row",
    },
    actionCell: {
      padding: "10px 16px",
      verticalAlign: "middle",
      textAlign: "center",
    },
    actionBtn: {
      background: "transparent",
      border: "none",
      padding: "4px 8px",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#0d6efd",
      fontSize: "13px",
      fontWeight: 600,
      gap: "6px",
      borderRadius: "6px",
    },
    emptyState: {
      textAlign: "center",
      padding: "20px",
      fontSize: "14px",
      color: "#6c757d",
    },
  };

  return (
    <div className="player-intelligence" style={tableStyles.pageShell}>
      {/* Header */}
      <div className="mb-6">
        <div style={tableStyles.headerPanel}>
          KPT Sports Player Intelligence
        </div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <MdInsights size={30} color="#0d6efd" />
          Player Intelligence
        </h2>
        <p className="text-gray-600 text-lg">
          View and analyze player data across all years
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center" style={tableStyles.filterCard}>
        {/* Year Filter */}
        <label htmlFor="player-intelligence-year" style={srOnlyStyle}>
          Filter players by year
        </label>
        <select
          id="player-intelligence-year"
          name="player-intelligence-year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={tableStyles.selectBox}
        >
          <option value="all">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        {/* Search */}
        <label htmlFor="player-intelligence-search" style={srOnlyStyle}>
          Search players by name, KPM, or department
        </label>
        <input
          id="player-intelligence-search"
          name="player-intelligence-search"
          type="text"
          placeholder="Search by name, KPM No, department..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={tableStyles.searchBox}
        />

        {/* Stats */}
        <div className="flex gap-4 items-center">
          <div style={tableStyles.statsCard}>
            <span className="text-blue-700 font-medium">Total Players: </span>
            <span className="text-blue-900 font-bold">{allPlayers.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={tableStyles.tableShell}>
        <table style={tableStyles.table}>
          <thead style={tableStyles.stickyHeader}>
            <tr style={tableStyles.headerRow}>
              <th style={{ width: "70px", padding: "12px 16px", textAlign: "left" }}>Sl No</th>
              <th style={{ width: "90px", padding: "12px 16px", textAlign: "left" }}>Year</th>
              <th style={{ width: "140px", padding: "12px 16px", textAlign: "left" }}>KPM No</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Name</th>
              <th style={{ width: "160px", padding: "12px 16px", textAlign: "left" }}>Department</th>
              <th style={{ width: "130px", padding: "12px 16px", textAlign: "left" }}>Diploma Year</th>
              <th style={{ width: "110px", padding: "12px 16px", textAlign: "left" }}>Semester</th>
              <th style={{ width: "120px", padding: "12px 16px", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPlayers.length === 0 ? (
              <tr>
                <td colSpan={8} style={tableStyles.emptyState}>
                  No players found
                </td>
              </tr>
            ) : (
              paginatedPlayers.map((player, index) => (
                <tr
                  key={`${player.year}-${player.id}-${index}`}
                  style={{
                    ...tableStyles.bodyRow,
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fb",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5faff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = index % 2 === 0 ? "#ffffff" : "#f8f9fb")}
                >
                  <td style={{ padding: "10px 16px", color: "#374151" }}>
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td style={{ padding: "10px 16px", color: "#374151" }}>
                    {player.year}
                  </td>
                  <td style={{ padding: "10px 16px", fontWeight: 600, color: "#0d6efd" }}>
                    {player.kpmNo || '-'}
                  </td>
                  <td style={{ padding: "10px 16px", color: "#111827", fontWeight: 500 }}>
                    {player.name || '-'}
                  </td>
                  <td style={{ padding: "10px 16px", color: "#374151" }}>
                    {player.branch || player.department || '-'}
                  </td>
                  <td style={{ padding: "10px 16px", color: "#374151" }}>
                    {player.diplomaYear || '-'}
                  </td>
                  <td style={{ padding: "10px 16px", color: "#374151" }}>
                    {player.semester || '-'}
                  </td>
                  <td style={tableStyles.actionCell}>
                    <button
                      onClick={() => handleViewPlayer(player)}
                      style={tableStyles.actionBtn}
                      title="View Player Intelligence"
                    >
                      <FaEye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6" style={tableStyles.paginationShell}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={tableStyles.paginationBtn(currentPage === 1)}
          >
            Previous
          </button>
          <div style={tableStyles.paginationMeta}>
            <span>Page</span>
            <span style={tableStyles.paginationBadge}>{currentPage}</span>
            <span>of</span>
            <span style={{ ...tableStyles.paginationBadge, background: "#0f172a" }}>{totalPages}</span>
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={tableStyles.paginationBtn(currentPage === totalPages)}
          >
            Next
          </button>
        </div>
      )}

      {/* Intelligence Panel */}
      {selectedPlayer && (
        <PlayerIntelligencePanel
          player={selectedPlayer}
          data={data}
          individualResults={individualResults}
          teamResults={teamResults}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default PlayerIntelligence;

