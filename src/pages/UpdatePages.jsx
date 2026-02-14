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
  const [latestLogsByPage, setLatestLogsByPage] = useState({});
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadLatestLogs = async () => {
      try {
        setLoadingLogs(true);
        const responses = await Promise.all(
          UPDATE_CARDS.map((card) => activityLogService.getPageActivityLogs(card.pageName, 1))
        );

        const next = {};
        UPDATE_CARDS.forEach((card, index) => {
          next[card.pageName] = responses[index]?.data?.[0] || null;
        });
        setLatestLogsByPage(next);
      } catch (error) {
        console.error('Failed to load update page summaries:', error);
        setLatestLogsByPage({});
      } finally {
        setLoadingLogs(false);
      }
    };

    loadLatestLogs();
  }, []);

  return (
    <AdminLayout>
      <div style={{ padding: '20px', color: '#000' }}>
        <h1 style={{ marginBottom: 6 }}>Update Pages</h1>
        <p style={{ marginTop: 0 }}>Changes are shown here in text format only.</p>

        <div style={{ margin: '10px 0', fontWeight: 700 }}>
          Date: {dateTime.toLocaleDateString()} <br />
          Time: {dateTime.toLocaleTimeString()}
        </div>

        <div
          style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}
        >
          {UPDATE_CARDS.map((card) => {
            const latest = latestLogsByPage[card.pageName];
            return (
              <div
                key={card.pageName}
                onClick={() => navigate(`/admin/update-details/${encodeURIComponent(card.pageName)}`)}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  color: '#000',
                  cursor: 'pointer'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>
                  {card.icon} {card.title}
                </h3>
                <p style={{ margin: 0 }}>{card.description}</p>

                <div style={{ marginTop: '12px', fontSize: '13px' }}>
                  {loadingLogs ? (
                    <p style={{ margin: 0 }}>Changes: Loading...</p>
                  ) : latest ? (
                    <>
                      <p style={{ margin: '0 0 6px 0' }}>Changes: {latest.details || latest.action}</p>
                      <p style={{ margin: '0 0 6px 0' }}>
                        Updated By: {latest.adminName || 'Admin'} ({latest.adminEmail || 'No email'})
                      </p>
                      <p style={{ margin: 0 }}>
                        Updated At: {latest.createdAt ? new Date(latest.createdAt).toLocaleString() : '-'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ margin: '0 0 6px 0' }}>Changes: No changes yet</p>
                      <p style={{ margin: '0 0 6px 0' }}>Updated By: -</p>
                      <p style={{ margin: 0 }}>Updated At: -</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UpdatePages;
