import "../../admin.css";

export default function PerformanceAnalytics({ players = [] }) {
  return (
    <div className="performance-page">
      <h1 className="page-title">📊 Performance Analytics</h1>
      <p className="page-subtitle">
        Player participation & year-wise performance overview
      </p>

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
                <span className="dept">{player.department}</span>
              </div>

              <div className="player-body">
                <div className="info-row">
                  <strong>Years</strong>
                  <span>{player.years.join(", ")}</span>
                </div>

                <div className="info-row">
                  <strong>Participations</strong>
                  <span className="badge">{player.participations}</span>
                </div>

                <div className="info-row">
                  <strong>Meet</strong>
                  <span>Karnataka State Inter-Polytechnic</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
