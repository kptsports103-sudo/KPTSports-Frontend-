import { useState, useEffect } from 'react';
import api from '../../services/api';
import "../../admin.css";

// Medal points configuration (aligned with Admin Dashboard)
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

// Fuzzy name matching helper (fallback for legacy results)
const normalizeName = (name) => {
  return (name || '').toLowerCase().trim().replace(/\s+/g, ' ');
};

// Normalize medal key (handle lowercase/uppercase from backend)
const normalizeMedal = (medal) =>
  medal ? medal.charAt(0).toUpperCase() + medal.slice(1).toLowerCase() : '';

export default function PerformanceAnalytics() {
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
        setResults(resultsRes.data || []);
        
        // Fetch group results
        const groupRes = await api.get('/group-results');
        setGroupResults(groupRes.data || []);
        
        // Flatten all players with their year info
        const allPlayers = [];
        playersArray.forEach(yearData => {
          yearData.players.forEach(player => {
            allPlayers.push({
              id: player.id || player.playerId,
              name: player.name,
              branch: player.branch,
              diplomaYear: player.diplomaYear,
              participationYear: yearData.year
            });
          });
        });
        
        // Group players by id (merge same player across years)
        const playersMap = {};
        const playersByName = {};
        allPlayers.forEach(player => {
          if (!player.id) return;
          const key = player.id;
          
          if (!playersMap[key]) {
            playersMap[key] = {
              id: player.id,
              originalName: player.name,
              name: player.name,
              branch: player.branch,
              years: [],
              yearDetails: {},
              firstYearPoints: 0,
              secondYearPoints: 0,
              thirdYearPoints: 0,
              totalPoints: 0,
              totalMeets: 0,
              individualResults: [],
              groupResults: []
            };
          }
          playersMap[key].years.push(player.participationYear);
          playersMap[key].yearDetails[player.participationYear] = {
            branch: player.branch,
            diplomaYear: player.diplomaYear
          };

          const nameKey = normalizeName(player.name);
          if (nameKey && !playersByName[nameKey]) {
            playersByName[nameKey] = player.id;
          }
        });
        
        const addPoints = (player, diplomaYear, points) => {
          const year = Number(diplomaYear);
          if (year === 1) player.firstYearPoints += points;
          if (year === 2) player.secondYearPoints += points;
          if (year === 3) player.thirdYearPoints += points;
        };

        // Calculate points for each player
        Object.keys(playersMap).forEach(key => {
          const player = playersMap[key];
          const years = player.years.sort((a, b) => a - b);
          player.totalMeets = Array.from(new Set(years)).length;
          
          // Individual results points
          results.forEach(result => {
            const resolvedId = result.playerId || playersByName[normalizeName(result.name)];
            if (!resolvedId || resolvedId !== player.id) return;

            const medalKey = normalizeMedal(result.medal);
            const medalPoints = INDIVIDUAL_POINTS[medalKey] || 0;
            const resultYear = parseInt(result.year);
            const diplomaYearRaw = result.diplomaYear ?? player.yearDetails[resultYear]?.diplomaYear ?? player.yearDetails[player.years[0]]?.diplomaYear;
            const diplomaYear = Number(diplomaYearRaw);

            // Store individual result
            player.individualResults.push({
              year: resultYear,
              event: result.event,
              medal: result.medal,
              points: medalPoints,
              imageUrl: result.imageUrl
            });

            // Add points to appropriate year (only if diplomaYear is 1, 2, or 3)
            if (diplomaYear >= 1 && diplomaYear <= 3) {
              addPoints(player, diplomaYear, medalPoints);
            }
          });
          
          // Group results points (split among members)
          groupResults.forEach(group => {
            const memberIds = Array.isArray(group.memberIds) && group.memberIds.length > 0
              ? group.memberIds
              : (group.members || [])
                  .map(name => playersByName[normalizeName(name)])
                  .filter(Boolean);

            if (!memberIds.length) return;

            memberIds.forEach(memberId => {
              if (memberId !== player.id) return;

              const medalKey = normalizeMedal(group.medal);
              const medalPoints = (GROUP_POINTS[medalKey] || 0) / memberIds.length;
              const resultYear = parseInt(group.year);
              const diplomaYearRaw = player.yearDetails[resultYear]?.diplomaYear ?? player.yearDetails[player.years[0]]?.diplomaYear;
              const diplomaYear = Number(diplomaYearRaw);

              // Store group result
              player.groupResults.push({
                year: resultYear,
                event: group.event,
                medal: group.medal,
                points: medalPoints,
                teamName: group.teamName,
                members: group.members
              });

              // Add points to appropriate year (only if diplomaYear is 1, 2, or 3)
              if (diplomaYear >= 1 && diplomaYear <= 3) {
                addPoints(player, diplomaYear, medalPoints);
              }
            });
          });
          
          // Sort results by year
          player.individualResults.sort((a, b) => a.year - b.year);
          player.groupResults.sort((a, b) => a.year - b.year);
          
          // Round points after accumulation
          player.firstYearPoints = Number(player.firstYearPoints.toFixed(2));
          player.secondYearPoints = Number(player.secondYearPoints.toFixed(2));
          player.thirdYearPoints = Number(player.thirdYearPoints.toFixed(2));
          player.totalPoints = Number((player.firstYearPoints + player.secondYearPoints + player.thirdYearPoints).toFixed(2));
        });
        
        // Get available years from players
        const allYears = [];
        Object.values(playersMap).forEach(player => {
          player.years.forEach(year => {
            if (!allYears.includes(year)) {
              allYears.push(year);
            }
          });
        });
        const sortedYears = Array.from(new Set(allYears)).sort((a, b) => b - a);
        setAvailableYears(sortedYears);
        
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
        player.branch.toLowerCase().includes(term)
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
        <h1 className="page-title">📊 Performance Analytics</h1>
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
        <h1 className="page-title">📊 Performance Analytics</h1>
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
      <h1 className="page-title">📊 Performance Analytics</h1>
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
            placeholder="Search by name or branch..."
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

      {/* PLAYERS LIST TABLE - Commented out for card-only view */}
      {/*
      {allPlayers.length > 0 && (
        <div className="analytics-table" style={{ marginBottom: '28px' }}>
          <h2 style={{ marginBottom: '12px' }}>Players List</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>YEAR</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>PLAYER NAME</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>BRANCH</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>DIPLOMA YEAR</th>
              </tr>
            </thead>
            <tbody>
              {visiblePlayerRows.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
                    No player data available
                  </td>
                </tr>
              ) : (
                visiblePlayerRows.map((row, idx) => (
                  <tr key={`${row.year}-${row.name}-${idx}`}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{row.year}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{row.name}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{row.branch}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{row.diplomaYear}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      */}

      {/* MEDAL ANALYTICS TABLE - Commented out for card-only view */}
      {/*
      {(results.length > 0 || groupResults.length > 0) && (
        <div className="analytics-table" style={{ marginBottom: '28px' }}>
          <h2 style={{ marginBottom: '12px' }}>Medal Performance</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>YEAR</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>PLAYER / TEAM</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>MEDAL</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>TYPE</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>POINTS</th>
              </tr>
            </thead>
            <tbody>
              {medalRows.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
                    No medal data available
                  </td>
                </tr>
              ) : (
                medalRows.map((row, idx) => {
                  const medalKey = normalizeMedal(row.medal);
                  const points = row.type === 'Group'
                    ? GROUP_POINTS[medalKey] || 0
                    : INDIVIDUAL_POINTS[medalKey] || 0;
                  return (
                    <tr key={`${row.type}-${row.year}-${idx}`}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{row.year}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{row.playerName || row.teamName || row.name || '-'}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
                        <span className={`medal-badge medal-${row.medal?.toLowerCase() || 'gold'}`}>
                          {row.medal}
                        </span>
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{row.type}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{points} pts</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      */}

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
