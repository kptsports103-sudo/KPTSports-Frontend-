import { useState, useEffect } from 'react';
import api from '../../services/api';
import "../../admin.css";

// Medal points configuration
const INDIVIDUAL_POINTS = {
  Gold: 5,
  Silver: 3,
  Bronze: 1,
};

const GROUP_POINTS = {
  Gold: 10,
  Silver: 7,
  Bronze: 4,
};

// Normalize name for legacy matching
const normalizeName = (name) => {
  return (name || '').toLowerCase().trim().replace(/\s+/g, ' ');
};

// Normalize medal key
const normalizeMedal = (medal) =>
  medal ? medal.charAt(0).toUpperCase() + medal.slice(1).toLowerCase() : '';

// Get academic year bucket (1/2/3) for a result.
// Priority:
// 1) Player's saved year-wise diplomaYear from Players section
// 2) diplomaYear present on result payload
// 3) fallback calculation using player's base year mapping
const getAcademicYear = (player, resultYear, resultDiplomaYear) => {
  const ry = Number(resultYear);

  // 1) Exact year mapping from Players data
  const mappedYear = Number(player?.yearDetails?.[ry]?.diplomaYear);
  if ([1, 2, 3].includes(mappedYear)) {
    return mappedYear;
  }

  // 2) Use diplomaYear coming from the result
  const directYear = Number(resultDiplomaYear);
  if ([1, 2, 3].includes(directYear)) {
    return directYear;
  }

  // 3) Fallback to base-year progression calculation
  const baseYear = Number(player?.baseYear);
  const baseDiplomaYear = Number(player?.baseDiplomaYear);

  if (!Number.isFinite(ry) || !Number.isFinite(baseYear) || !Number.isFinite(baseDiplomaYear)) {
    return null;
  }

  const calculated = baseDiplomaYear + (ry - baseYear);
  return [1, 2, 3].includes(calculated) ? calculated : null;
};

export default function PerformanceAnalysis() {
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [results, setResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerDetails, setPlayerDetails] = useState(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableYears, setAvailableYears] = useState([]);

  const srOnlyStyle = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch players
        const playersRes = await api.get('/home/players');
        const playersGrouped = playersRes.data;
        const playersArray = Object.keys(playersGrouped).map(year => ({
          year: parseInt(year),
          players: playersGrouped[year]
        }));
        
        // Fetch individual results
        const resultsRes = await api.get('/results');
        const resultsData = resultsRes.data || [];
        setResults(resultsData);
        
        // Fetch group results
        const groupRes = await api.get('/group-results');
        const groupResultsData = groupRes.data || [];
        setGroupResults(groupResultsData);
        
        // Flatten all players with their year info
        const allPlayers = [];
        playersArray.forEach(yearData => {
          yearData.players.forEach(player => {
            allPlayers.push({
              id: player.id || player.playerId,
              masterId: player.masterId || "",
              kpmNo: player.kpmNo || "",
              name: player.name,
              branch: player.branch,
              diplomaYear: player.diplomaYear,
              participationYear: yearData.year
            });
          });
        });
        
        console.log('='.repeat(60));
        console.log('🔍 DIAGNOSTIC: Players Data Sample');
        console.log('='.repeat(60));
        console.log('Total players loaded:', allPlayers.length);
        allPlayers.slice(0, 5).forEach((p, i) => {
          console.log(`  [${i}] ID: "${p.id}" | Name: "${p.name}" | Branch: "${p.branch}" | diplomaYear: "${p.diplomaYear}" | participationYear: ${p.participationYear}`);
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('🔍 DIAGNOSTIC: Results Data Sample');
        console.log('='.repeat(60));
        console.log('Total results loaded:', resultsData.length);
        resultsData.slice(0, 5).forEach((r, i) => {
          console.log(`  [${i}] Name: "${r.name}" | playerId: "${r.playerId}" | medal: "${r.medal}" | year: ${r.year} | diplomaYear: "${r.diplomaYear}"`);
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('🔍 DIAGNOSTIC: Group Results Data Sample');
        console.log('='.repeat(60));
        console.log('Total group results loaded:', groupResultsData.length);
        groupResultsData.slice(0, 3).forEach((g, i) => {
          const memberNamesSample = (g.members || [])
            .map(m => (typeof m === 'string' ? m : m?.name))
            .filter(Boolean)
            .slice(0, 3)
            .join(', ');
          console.log(`  [${i}] Event: "${g.event}" | teamName: "${g.teamName}" | members: [${memberNamesSample}${(g.members?.length || 0) > 3 ? '...' : ''}] | medal: "${g.medal}" | year: ${g.year}`);
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('🔍 DIAGNOSTIC: Player-to-Result Matching Process');
        console.log('='.repeat(60));
        
        // Deduplicate players across years and id drift:
        // canonical key priority: masterId -> playerId -> name+branch.
        const kpmToKey = {};
        const playersMap = {};
        const masterIdToKey = {};
        const playerIdToKey = {};
        const nameBranchToKey = {};

        allPlayers.forEach((player) => {
          const safeName = normalizeName(player.name);
          const safeBranch = normalizeName(player.branch);
          if (!safeName) return;

          const nameBranchKey = `${safeName}|${safeBranch}`;
          const playerId = player.id ? String(player.id).trim() : '';
          const masterId = player.masterId ? String(player.masterId).trim() : '';

          let key = masterId ? (masterIdToKey[masterId] || masterId) : null;
          if (!key && playerId) key = playerIdToKey[playerId] || null;
          if (!key && nameBranchToKey[nameBranchKey]) key = nameBranchToKey[nameBranchKey];
          if (!key) key = nameBranchKey;

          if (!playersMap[key]) {
            playersMap[key] = {
              id: playerId || key,
              masterId: masterId || key,
              kpmNo: player.kpmNo || "",
              aliasIds: new Set(),
              name: player.name,
              branch: player.branch,
              years: new Set(),
              yearDetails: {},
              baseYear: Number(player.participationYear) || null,
              baseDiplomaYear: Number(player.diplomaYear) || 1,
              firstYearPoints: 0,
              secondYearPoints: 0,
              thirdYearPoints: 0,
              totalPoints: 0,
              totalMeets: 0,
              individualResults: [],
              groupResults: []
            };
          }

          const entry = playersMap[key];
          if (masterId) {
            masterIdToKey[masterId] = key;
            if (!entry.masterId || entry.masterId === key) entry.masterId = masterId;
          }
          if (playerId) {
            entry.aliasIds.add(playerId);
            playerIdToKey[playerId] = key;
            if (!entry.id || entry.id === key) entry.id = playerId;
          }
          if (!entry.kpmNo && player.kpmNo) {
            entry.kpmNo = player.kpmNo;
          }
          nameBranchToKey[nameBranchKey] = key;
          if (player.kpmNo) {
            kpmToKey[player.kpmNo] = key;
          }

          const py = Number(player.participationYear);
          if (Number.isFinite(py)) {
            entry.years.add(py);
            entry.yearDetails[py] = {
              branch: player.branch,
              diplomaYear: player.diplomaYear
            };
          }

          if (Number.isFinite(py) && (entry.baseYear === null || py < entry.baseYear)) {
            entry.baseYear = py;
            entry.baseDiplomaYear = Number(player.diplomaYear) || 1;
          }
        });

        const resolveByName = (name, year) => {
          const nameKey = normalizeName(name);
          if (!nameKey) return null;

          const candidates = Object.keys(playersMap).filter((k) => normalizeName(playersMap[k].name) === nameKey);
          if (candidates.length === 1) return candidates[0];
          if (candidates.length > 1 && Number.isFinite(year)) {
            const byYear = candidates.filter((k) => playersMap[k].yearDetails[year]);
            if (byYear.length === 1) return byYear[0];
          }
          return null;
        };

        const addPointsToBucket = (player, academicYear, points) => {
          if (academicYear === 1) player.firstYearPoints += points;
          if (academicYear === 2) player.secondYearPoints += points;
          if (academicYear === 3) player.thirdYearPoints += points;
          player.totalPoints += points;
        };

        // Individual results: assign each result to one canonical player only.
        resultsData.forEach((result) => {
          const resultYear = Number(result.year);
          const resultPlayerId = result.playerId ? String(result.playerId).trim() : '';
          const resultKpmNo = result.kpmNo ? String(result.kpmNo).trim() : '';

          let key = null;

          // 1) Match by KPM NO (highest priority)
          if (resultKpmNo && kpmToKey[resultKpmNo]) {
            key = kpmToKey[resultKpmNo];
          }

          // 2) Match by playerId
          if (!key && resultPlayerId && playerIdToKey[resultPlayerId]) {
            key = playerIdToKey[resultPlayerId];
          }

          // 3) Fallback to name match
          if (!key) key = resolveByName(result.name, resultYear);
          if (!key || !playersMap[key]) return;

          const player = playersMap[key];
          const medalKey = normalizeMedal(result.medal);
          const medalPoints = INDIVIDUAL_POINTS[medalKey] || 0;
          const academicYear = getAcademicYear(player, resultYear, result.diplomaYear);
          if (!academicYear) return;

          player.individualResults.push({
            year: resultYear,
            event: result.event,
            medal: result.medal,
            points: medalPoints,
            imageUrl: result.imageUrl
          });
          addPointsToBucket(player, academicYear, medalPoints);
        });

        // Group results: assign members to unique canonical keys only.
        groupResultsData.forEach((group) => {
          const resultYear = Number(group.year);
          const medalKey = normalizeMedal(group.medal);
          const medalPoints = GROUP_POINTS[medalKey] || 0;

          let memberIds = Array.isArray(group.memberIds) ? group.memberIds.filter(Boolean) : [];
          const rawMembers = Array.isArray(group.members) ? group.members : [];
          const memberNames = rawMembers
            .map((m) => (typeof m === 'string' ? m : m?.name))
            .filter(Boolean);

          if (!memberIds.length && rawMembers.length) {
            memberIds = rawMembers
              .map((m) => (typeof m === 'object' ? m?.playerId : null))
              .filter(Boolean);
          }

          const memberKeys = new Set();

          // Match group members by KPM first
          if (Array.isArray(group.memberKpmNos)) {
            group.memberKpmNos.forEach((kpm) => {
              const trimmedKpm = String(kpm || '').trim();
              if (trimmedKpm && kpmToKey[trimmedKpm]) {
                memberKeys.add(kpmToKey[trimmedKpm]);
              }
            });
          }

          memberIds.forEach((memberId) => {
            const id = String(memberId).trim();
            if (playerIdToKey[id]) memberKeys.add(playerIdToKey[id]);
          });

          if (!memberKeys.size) {
            memberNames.forEach((memberName) => {
              const key = resolveByName(memberName, resultYear);
              if (key) memberKeys.add(key);
            });
          }

          memberKeys.forEach((key) => {
            const player = playersMap[key];
            if (!player) return;
            const academicYear = getAcademicYear(player, resultYear, group.diplomaYear || null);
            if (!academicYear) return;

            player.groupResults.push({
              year: resultYear,
              event: group.event,
              medal: group.medal,
              points: medalPoints,
              teamName: group.teamName,
              members: group.members
            });
            addPointsToBucket(player, academicYear, medalPoints);
          });
        });

        // Finalize & normalize player aggregates
        Object.keys(playersMap).forEach((key) => {
          const player = playersMap[key];
          player.years = Array.from(player.years).sort((a, b) => a - b);
          player.totalMeets = player.years.length;
          player.individualResults.sort((a, b) => a.year - b.year);
          player.groupResults.sort((a, b) => a.year - b.year);
          player.firstYearPoints = Number(player.firstYearPoints.toFixed(2));
          player.secondYearPoints = Number(player.secondYearPoints.toFixed(2));
          player.thirdYearPoints = Number(player.thirdYearPoints.toFixed(2));
          player.totalPoints = Number(player.totalPoints.toFixed(2));
          player.aliasIds = Array.from(player.aliasIds);
        });
        
        // Get available years from players + results for full year coverage.
        const allYears = [];
        Object.values(playersMap).forEach(player => {
          player.years.forEach(year => {
            if (!allYears.includes(year)) {
              allYears.push(year);
            }
          });
        });
        resultsData.forEach((result) => {
          const year = Number(result?.year);
          if (Number.isFinite(year) && !allYears.includes(year)) {
            allYears.push(year);
          }
        });
        groupResultsData.forEach((result) => {
          const year = Number(result?.year);
          if (Number.isFinite(year) && !allYears.includes(year)) {
            allYears.push(year);
          }
        });
        const sortedYears = Array.from(new Set(allYears)).sort((a, b) => b - a);
        setAvailableYears(sortedYears);

        if (sortedYears.length > 0) {
          const currentYear = new Date().getFullYear();
          if (sortedYears.includes(currentYear)) {
            setSelectedYear(String(currentYear));
          } else {
            setSelectedYear(String(sortedYears[0]));
          }
        } else {
          setSelectedYear('all');
        }
        
        setPlayers(Object.values(playersMap));
        setAllPlayers(Object.values(playersMap));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load performance data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter players based on year and search term
  useEffect(() => {
    let filtered = allPlayers;
    
    // Filter by year (show players who participated in that year)
    if (selectedYear !== 'all') {
      const year = parseInt(selectedYear);
      filtered = filtered.filter(player => 
        player.years.includes(year)
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(term) ||
        player.branch.toLowerCase().includes(term) ||
        (player.kpmNo && player.kpmNo.includes(term))
      );
    }
    
    setPlayers(filtered);
  }, [selectedYear, searchTerm, allPlayers]);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setPlayerDetails(player);
  };

  const handleCloseModal = () => {
    setSelectedPlayer(null);
    setPlayerDetails(null);
  };

  const getPlayerStatusBadge = (player) => {
    const years = Array.isArray(player?.years) ? player.years.length : 0;

    if (years >= 3) {
      return { text: "Senior Player", color: "#28a745" };
    }

    if (years === 2) {
      return { text: "Returning", color: "#0d6efd" };
    }

    return { text: "New", color: "#6c757d" };
  };

  const selectedYearNumber = selectedYear === 'all' ? null : parseInt(selectedYear);

  const visiblePlayerRows = players.flatMap((player) => {
    const yearsToShow = selectedYearNumber
      ? player.years.filter((year) => year === selectedYearNumber)
      : player.years;
    return yearsToShow.map((year) => ({
      year,
      name: player.name,
      branch: player.yearDetails[year]?.branch || player.branch || '',
      diplomaYear: player.yearDetails[year]?.diplomaYear || ''
    }));
  });

  const medalRows = [
    ...(results || []).map((result) => ({
      year: parseInt(result.year),
      medal: result.medal,
      type: 'Individual',
      name: result.name,
      playerName: result.name,
      points: INDIVIDUAL_POINTS[normalizeMedal(result.medal)] || 0
    })),
    ...(groupResults || []).map((result) => ({
      year: parseInt(result.year),
      medal: result.medal,
      type: 'Group',
      name: result.teamName,
      teamName: result.teamName,
      points: GROUP_POINTS[normalizeMedal(result.medal)] || 0
    }))
  ]
    .filter((row) => !selectedYearNumber || row.year === selectedYearNumber)
    .sort((a, b) => b.year - a.year);

  if (loading) {
    return (
      <div className="performance-page">
        <h1 className="page-title">Performance Analysis</h1>
        <p className="page-subtitle">Loading performance data...</p>
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-page">
        <h1 className="page-title">Performance Analysis</h1>
        <p className="page-subtitle">Player participation & year-wise performance overview</p>
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-page">
      <div
        style={{
          fontSize: "14px",
          fontWeight: 700,
          marginBottom: "10px",
          color: "#0f172a",
          background: "linear-gradient(90deg, #dbeafe, #e0f2fe)",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
          padding: "10px 14px",
          display: "inline-block"
        }}
      >
        KPT Sports Performance Analysis
      </div>
      <h1 className="page-title">Performance Analysis</h1>
      <p className="page-subtitle">Player participation & year-wise performance overview</p>

      {/* FILTERS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* Year Select */}
        <div>
          <label htmlFor="analytics-year-select" style={srOnlyStyle}>Select Year</label>
          <select
            id="analytics-year-select"
            name="analytics-year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '2px solid #ddd',
              fontSize: '14px',
              backgroundColor: '#fff',
              color: '#111827',
              cursor: 'pointer',
              minWidth: '120px'
            }}
          >
            <option value="all" style={{ color: '#111827' }}>All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year} style={{ color: '#111827' }}>{year}</option>
            ))}
          </select>
        </div>
        
        {/* Search Input */}
        <div>
          <label htmlFor="analytics-search" style={srOnlyStyle}>Search players</label>
          <input
            id="analytics-search"
            name="analytics-search"
            type="text"
            placeholder="Search by name, branch, or KPM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '2px solid #ddd',
              fontSize: '14px',
              width: '250px',
              outline: 'none',
              color: '#111827'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0d6efd'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>
        
        {/* Results Count */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#111827' }}>
          Showing {players.length} player{players.length !== 1 ? 's' : ''}
        </div>
      </div>


      {/* EMPTY STATE */}
      {allPlayers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No Performance Data Available</h2>
          <p>
            No students have participated in
            <br />
            <b>Karnataka State Inter-Polytechnic Meets</b>
          </p>
        </div>
      ) : players.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h2>No Players Found</h2>
          <p>
            {selectedYear !== 'all' || searchTerm ? (
              <>Try adjusting your filters to find more players</>
            ) : (
              <>No players match your criteria</>
            )}
          </p>
        </div>
      ) : (
        <div className="player-grid">
          {players.map((player, index) => {
            const totalMedals = player.individualResults.length + player.groupResults.length;
            const allResults = [...player.individualResults, ...player.groupResults];
            const goldCount = allResults.filter(r => normalizeMedal(r.medal) === 'Gold').length;
            const silverCount = allResults.filter(r => normalizeMedal(r.medal) === 'Silver').length;
            const bronzeCount = allResults.filter(r => normalizeMedal(r.medal) === 'Bronze').length;
            
            return (
              <div 
                key={index} 
                className="player-card player-clickable"
                onClick={() => handlePlayerClick(player)}
              >
                <div className="player-header">
                  <h2>{player.name}</h2>
                  <div style={{ fontSize: "12px", color: "#6c757d" }}>
                    KPM: {player.kpmNo || "Not Assigned"}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: getPlayerStatusBadge(player).color,
                    }}
                  >
                    {getPlayerStatusBadge(player).text}
                  </div>
                  <span className="dept">{player.branch}</span>
                </div>

                <div className="player-body">
                  {/* Medals Row */}
                  {(totalMedals > 0) && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      marginBottom: '12px',
                      justifyContent: 'center'
                    }}>
                      {goldCount > 0 && (
                        <span style={{ 
                          background: '#fff3cd', 
                          color: '#856404',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>🥇 {goldCount}</span>
                      )}
                      {silverCount > 0 && (
                        <span style={{ 
                          background: '#e2e3e5', 
                          color: '#383d41',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>🥈 {silverCount}</span>
                      )}
                      {bronzeCount > 0 && (
                        <span style={{ 
                          background: '#ffe8cc', 
                          color: '#663c00',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>🥉 {bronzeCount}</span>
                      )}
                    </div>
                  )}

                  {/* Year-wise Points */}
                  <div className="info-row">
                    <strong>1st Year</strong>
                    <span className="points-badge">{player.firstYearPoints} pts</span>
                  </div>

                  <div className="info-row">
                    <strong>2nd Year</strong>
                    <span className="points-badge">{player.secondYearPoints} pts</span>
                  </div>

                  <div className="info-row">
                    <strong>3rd Year</strong>
                    <span className="points-badge">{player.thirdYearPoints} pts</span>
                  </div>

                  <div className="info-row">
                    <strong>Total Meets</strong>
                    <span className="meets-badge">{player.totalMeets}</span>
                  </div>

                  <div className="info-row total-row">
                    <strong>Total Points</strong>
                    <span className="total-badge">{player.totalPoints} pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PLAYER DETAIL MODAL */}
      {selectedPlayer && playerDetails && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            
            <div className="modal-header">
              <div className="player-avatar">
                {playerDetails.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2>{playerDetails.name}</h2>
                <p>{playerDetails.branch}</p>
              </div>
            </div>

            {playerDetails.individualResults.some(r => r.imageUrl) && (
              <img
                src={playerDetails.individualResults.find(r => r.imageUrl)?.imageUrl}
                alt={playerDetails.name}
                className="modal-player-image"
              />
            )}

            <div className="modal-stats">
              <div className="modal-stat">
                <span className="stat-value">{playerDetails.totalPoints}</span>
                <span className="stat-label">Total Points</span>
              </div>
              <div className="modal-stat">
                <span className="stat-value">{playerDetails.totalMeets}</span>
                <span className="stat-label">Meets</span>
              </div>
            </div>

            <div className="modal-section">
              <h3>🏅 Individual Results</h3>
              {playerDetails.individualResults.length === 0 ? (
                <p className="no-results">No individual results</p>
              ) : (
                <div className="results-list">
                  {playerDetails.individualResults.map((result, idx) => (
                    <div key={idx} className="result-item">
                      <div className="result-year">{result.year}</div>
                      <div className="result-event">{result.event}</div>
                      <span className={`medal-badge medal-${result.medal.toLowerCase()}`}>
                        {result.medal}
                      </span>
                      <span className="result-points">+{result.points}</span>
                      {result.imageUrl && (
                        <a href={result.imageUrl} target="_blank" rel="noreferrer" className="result-image">
                          📷
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-section">
              <h3>👥 Group/Team Results</h3>
              {playerDetails.groupResults.length === 0 ? (
                <p className="no-results">No group results</p>
              ) : (
                <div className="results-list">
                  {playerDetails.groupResults.map((result, idx) => (
                    <div key={idx} className="result-item">
                      <div className="result-year">{result.year}</div>
                      <div className="result-event">{result.event}</div>
                      <span className={`medal-badge medal-${result.medal.toLowerCase()}`}>
                        {result.medal}
                      </span>
                      <span className="result-points">+{result.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-year-summary">
              <h3>📊 Year-wise Summary</h3>
              <div className="year-summary-grid">
                <div className="year-summary">
                  <span className="year-label">1st Year</span>
                  <span className="year-points">{playerDetails.firstYearPoints} pts</span>
                </div>
                <div className="year-summary">
                  <span className="year-label">2nd Year</span>
                  <span className="year-points">{playerDetails.secondYearPoints} pts</span>
                </div>
                <div className="year-summary">
                  <span className="year-label">3rd Year</span>
                  <span className="year-points">{playerDetails.thirdYearPoints} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
