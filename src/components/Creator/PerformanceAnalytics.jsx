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

export default function PerformanceAnalytics() {
  const [players, setPlayers] = useState([]);
  const [results, setResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerDetails, setPlayerDetails] = useState(null);

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
          if (diplomaYear === "1") player.firstYearPoints += points;
          if (diplomaYear === "2") player.secondYearPoints += points;
          if (diplomaYear === "3") player.thirdYearPoints += points;
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

            const medalPoints = INDIVIDUAL_POINTS[result.medal] || 0;
            const resultYear = parseInt(result.year);
            const diplomaYear = String(result.diplomaYear || player.yearDetails[resultYear]?.diplomaYear || "");

            // Store individual result
            player.individualResults.push({
              year: resultYear,
              event: result.event,
              medal: result.medal,
              points: medalPoints,
              imageUrl: result.imageUrl
            });

            // Add points to appropriate year
            if (diplomaYear) {
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

              const medalPoints = (GROUP_POINTS[group.medal] || 0) / memberIds.length;
              const resultYear = parseInt(group.year);
              const diplomaYear = String(player.yearDetails[resultYear]?.diplomaYear || "");

              // Store group result
              player.groupResults.push({
                year: resultYear,
                event: group.event,
                medal: group.medal,
                points: medalPoints,
                teamName: group.teamName,
                members: group.members
              });

              // Add points to appropriate year
              if (diplomaYear) {
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
        
        setPlayers(Object.values(playersMap));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load performance data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setPlayerDetails(player);
  };

  const handleCloseModal = () => {
    setSelectedPlayer(null);
    setPlayerDetails(null);
  };

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

      {/* EMPTY STATE */}
      {players.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No Performance Data Available</h2>
          <p>
            No students have participated in
            <br />
            <b>Karnataka State Inter-Polytechnic Meets</b>
          </p>
        </div>
      ) : (
        <div className="player-grid">
          {players.map((player, index) => (
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
          ))}
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
