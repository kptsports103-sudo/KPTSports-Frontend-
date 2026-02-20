import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { FaEye } from 'react-icons/fa';
import { MdInsights } from 'react-icons/md';
import PlayerIntelligencePanel from './PlayerIntelligencePanel';

const PlayerIntelligence = () => {
  const [data, setData] = useState([]);
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
        const res = await api.get('/home/players');
        const grouped = res.data;
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
    <div className="player-intelligence">
      {/* Header */}
      <div className="mb-6">
        <div
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "10px",
            color: "#0f172a",
            background: "linear-gradient(90deg, #dbeafe, #e0f2fe)",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            padding: "10px 14px",
          }}
        >
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
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Year Filter */}
        <label htmlFor="player-intelligence-year" style={srOnlyStyle}>
          Filter players by year
        </label>
        <select
          id="player-intelligence-year"
          name="player-intelligence-year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Stats */}
        <div className="flex gap-4 items-center">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-blue-700 font-medium">Total Players: </span>
            <span className="text-blue-900 font-bold">{allPlayers.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default PlayerIntelligence;

