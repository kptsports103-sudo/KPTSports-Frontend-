import React from 'react';

const CreatorDashboard = ({ onNavigate }) => {
  const cards = [
    {
      id: 1,
      title: "Players Management",
      description: "Manage and organize players by year, add new players, and maintain player records",
      icon: "👥",
      color: "#3b82f6", // blue
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      id: 2,
      title: "Attendance Tracking",
      description: "Track daily attendance, monitor presence, and generate attendance reports",
      icon: "📊",
      color: "#10b981", // green
      gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
    },
    {
      id: 3,
      title: "Performance Analytics",
      description: "Analyze player performance, view statistics, and track progress over time",
      icon: "🏆",
      color: "#ec4899", // pink
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    }
  ];

  const handleViewDetails = (cardId) => {
    // Handle navigation based on card ID
    if (onNavigate) {
      switch(cardId) {
        case 1:
          // Navigate to Players Management
          onNavigate('players');
          break;
        case 2:
          // Navigate to Attendance
          onNavigate('attendance');
          break;
        case 3:
          // Navigate to Performance Analytics
          onNavigate('analytics');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Creator Dashboard</h1>
        <p style={styles.pageSubtitle}>Manage your sports academy efficiently</p>
      </div>

      {/* Cards Grid */}
      <div style={styles.cardsContainer}>
        {cards.map((card) => (
          <div key={card.id} style={styles.card}>
            {/* Card Header with Icon */}
            <div style={{ ...styles.cardHeader, background: card.gradient }}>
              <div style={styles.iconContainer}>
                <span style={styles.icon}>{card.icon}</span>
              </div>
            </div>

            {/* Card Content */}
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardDescription}>{card.description}</p>
              
              {/* View Details Button */}
              <button
                style={{ ...styles.viewButton, backgroundColor: card.color }}
                onClick={() => handleViewDetails(card.id)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorDashboard;

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5", // light grey background
    padding: "20px",
    boxSizing: "border-box",
  },

  header: {
    textAlign: "center",
    marginBottom: "40px",
  },

  pageTitle: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "8px",
  },

  pageSubtitle: {
    fontSize: "16px",
    color: "#6b7280",
    margin: 0,
  },

  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
  },

  cardHeader: {
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  iconContainer: {
    width: "80px",
    height: "80px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },

  icon: {
    fontSize: "36px",
  },

  cardContent: {
    padding: "24px",
    textAlign: "center",
  },

  cardTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "12px",
    margin: "0 0 12px 0",
  },

  cardDescription: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.5",
    marginBottom: "20px",
    margin: "0 0 20px 0",
  },

  viewButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    width: "100%",
  },
};
