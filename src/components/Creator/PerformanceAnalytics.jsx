import { useState, useEffect } from 'react';
import api from '../../services/api';
import "../../admin.css";

// Medal points configuration
const MEDAL_POINTS = {
  'Gold': 10,
  'Silver': 7,
  'Bronze': 5
};

export default function PerformanceAnalytics() {
  const [players, setPlayers] = useState([]);
  const [results, setResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              name: player.name,
              branch: player.branch,
              diplomaYear: player.diplomaYear,
              participationYear: yearData.year
            });
          });
        });
        
        // Group players by name (merge same player across years)
        const playersMap = {};
        allPlayers.forEach(player => {
          const key = player.name.trim().toLowerCase();
          if (!playersMap[key]) {
            playersMap[key] = {
              name: player.name,
              branch: player.branch,
              years: [],
              firstYearPoints: 0,
              secondYearPoints: 0,
              thirdYearPoints: 0,
              totalPoints: 0,
              totalMeets: 0
            };
          }
          playersMap[key].years.push(player.participationYear);
        });
        
        // Calculate points for each player
        Object.keys(playersMap).forEach(key => {
          const player = playersMap[key];
          const years = player.years.sort((a, b) => a - b);
          player.totalMeets = years.length;
          
          // Individual results points
          results.forEach(result => {
            if (result.name && result.name.trim().toLowerCase() === key) {
              const medalPoints = MEDAL_POINTS[result.medal] || 0;
              const resultYear = parseInt(result.year);
              
              if (years.length >= 1 && resultYear === years[0]) {
                player.firstYearPoints += medalPoints;
              } else if (years.length >= 2 && resultYear === years[1]) {
                player.secondYearPoints += medalPoints;
              } else if (years.length >= 3 && resultYear === years[2]) {
                player.thirdYearPoints += medalPoints;
              }
            }
          });
          
          // Group results points (split among members)
          groupResults.forEach(group => {
            if (group.members && Array.isArray(group.members)) {
              group.members.forEach(member => {
                if (member && member.trim().toLowerCase() === key) {
                  const medalPoints = (MEDAL_POINTS[group.medal] || 0) / group.members.length;
                  const resultYear = parseInt(group.year);
                  
                  if (years.length >= 1 && resultYear === years[0]) {
                    player.firstYearPoints += medalPoints;
                  } else if (years.length >= 2 && resultYear === years[1]) {
                    player.secondYearPoints += medalPoints;
                  } else if (years.length >= 3 && resultYear === years[2]) {
                    player.thirdYearPoints += medalPoints;
                  }
                }
              });
            }
          });
          
          // Round points
          player.firstYearPoints = Math.round(player.firstYearPoints * 100) / 100;
          player.secondYearPoints = Math.round(player.secondYearPoints * 100) / 100;
          player.thirdYearPoints = Math.round(player.thirdYearPoints * 100) / 100;
          player.totalPoints = Math.round((player.firstYearPoints + player.secondYearPoints + player.thirdYearPoints) * 100) / 100;
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
            <div key={index} className="player-card">
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
    </div>
  );
}
