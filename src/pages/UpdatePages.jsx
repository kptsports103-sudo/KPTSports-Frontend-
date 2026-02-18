import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import activityLogService from '../services/activityLog.service';

const UPDATE_CARDS = [
  { title: 'Update Home', icon: '🏠', description: 'Manage home page content', pageName: 'Home Page' },
  { title: 'Update About', icon: 'ℹ️', description: 'Manage about page content', pageName: 'About Page' },
  { title: 'Update History', icon: '📜', description: 'Manage history page content', pageName: 'History Page' },
  { title: 'Update Events', icon: '📅', description: 'Manage events page content', pageName: 'Events Page' },
  { title: 'Update Gallery', icon: '🖼️', description: 'Manage gallery page content', pageName: 'Gallery Page' },
  { title: 'Update Results', icon: '🏆', description: 'Manage results page content', pageName: 'Results Page' }
];

const UpdatePages = () => {
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(new Date());
  const [changeCountByPage, setChangeCountByPage] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadPageChangeCounts = async () => {
      try {
        const responses = await Promise.all(
          UPDATE_CARDS.map((card) => activityLogService.getPageActivityLogs(card.pageName, 20))
        );

        const next = {};
        UPDATE_CARDS.forEach((card, index) => {
          next[card.pageName] = Array.isArray(responses[index]?.data) ? responses[index].data.length : 0;
        });
        setChangeCountByPage(next);
      } catch (error) {
        console.error('Failed to load page change counts:', error);
        setChangeCountByPage({});
      }
    };

    loadPageChangeCounts();
    window.addEventListener('HOME_UPDATED', loadPageChangeCounts);
    return () => window.removeEventListener('HOME_UPDATED', loadPageChangeCounts);
  }, []);

  return (
    <AdminLayout>
      <div style={styles.page}>
        <h1 style={styles.title}>Content Management Dashboard</h1>
        <p style={styles.subtitle}>Monitor, manage, and track all website content updates in one place.</p>

        <div style={styles.clockWrap}>
          <div>Date: {dateTime.toLocaleDateString()}</div>
          <div>Time: {dateTime.toLocaleTimeString()}</div>
        </div>

        <div style={styles.grid}>
          {UPDATE_CARDS.map((card) => {
            const count = changeCountByPage[card.pageName] || 0;
            const hasChanges = count > 0;
            return (
              <div
                key={card.pageName}
                onClick={() => navigate(`/admin/update-details/${encodeURIComponent(card.pageName)}`)}
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 14px 26px rgba(15, 23, 42, 0.18)';
                  e.currentTarget.style.borderColor = '#93c5fd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(15, 23, 42, 0.08)';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <div style={styles.notifyWrap}>
                  <span style={{ ...styles.bell, color: hasChanges ? '#dc2626' : '#6b7280' }}>🔔</span>
                  {hasChanges ? (
                    <span style={styles.badge}>{count > 9 ? '9+' : count}</span>
                  ) : null}
                </div>

                <h3 style={styles.cardTitle}>
                  <span style={styles.icon}>{card.icon}</span>
                  {card.title}
                </h3>
                <p style={styles.cardDescription}>{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

const styles = {
  page: {
    padding: '24px',
    color: '#111827',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  title: {
    margin: 0,
    fontSize: '38px',
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: '-0.5px'
  },
  subtitle: {
    marginTop: '8px',
    marginBottom: '14px',
    color: '#374151',
    fontSize: '16px',
    fontWeight: 500
  },
  clockWrap: {
    margin: '8px 0 18px',
    fontWeight: 700,
    fontSize: '20px',
    color: '#111827',
    display: 'grid',
    gap: '4px'
  },
  grid: {
    marginTop: '10px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px'
  },
  card: {
    position: 'relative',
    background: '#ffffff',
    borderRadius: '14px',
    padding: '22px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  notifyWrap: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    minWidth: '30px',
    height: '30px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6'
  },
  bell: {
    fontSize: '18px',
    lineHeight: 1
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    minWidth: '20px',
    height: '20px',
    borderRadius: '999px',
    padding: '0 6px',
    background: '#dc2626',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff'
  },
  cardTitle: {
    margin: '0 0 10px 0',
    color: '#111827',
    fontSize: '22px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  icon: {
    fontSize: '20px'
  },
  cardDescription: {
    margin: 0,
    color: '#1f2937',
    fontSize: '15px',
    lineHeight: 1.3,
    fontWeight: 500
  }
};

export default UpdatePages;
