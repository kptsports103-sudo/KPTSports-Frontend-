import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { FaEye } from 'react-icons/fa';
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
          (p.branch && p.branch.toLowerCase().includes(searchLower)) ||
          (p.competition && p.competition.toLowerCase().includes(searchLower))
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

  return (
    <div className="player-intelligence">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          ðŸŽ¯ Player Intelligence
        </h2>
        <p className="text-gray-600">
          View and analyze player data across all years
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Year Filter */}
        <select
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
        <input
          type="text"
          placeholder="Search by name, KPM No, department, competition..."
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
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Sl No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Year</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">KPM No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Department</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Semester</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Competition</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Position</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPlayers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No players found
                </td>
              </tr>
            ) : (
              paginatedPlayers.map((player, index) => (
                <tr key={`${player.year}-${player.id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    {player.year}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    {player.kpmNo || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                    {player.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    {player.branch || player.department || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    {player.semester || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    {player.competition || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    {player.position || '-'}
                  </td>
                  <td className="px-4 py-3 text-center border-b">
                    <button
                      onClick={() => handleViewPlayer(player)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      <FaEye size={12} />
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

