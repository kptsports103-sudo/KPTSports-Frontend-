import { useEffect, useState } from 'react';
import activityLogService from '../services/activityLog.service';

const PageLatestChangeCard = ({ pageName }) => {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLatest = async () => {
      try {
        setLoading(true);
        const response = await activityLogService.getPageActivityLogs(pageName, 1);
        setLatest(response?.data?.[0] || null);
      } catch (error) {
        console.error(`Failed to load latest change for ${pageName}:`, error);
        setLatest(null);
      } finally {
        setLoading(false);
      }
    };

    loadLatest();
  }, [pageName]);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '12px 14px',
        marginBottom: '14px'
      }}
    >
      {loading ? (
        <p style={{ margin: 0, color: '#111827' }}>Changes: Loading...</p>
      ) : latest ? (
        <>
          <p style={{ margin: '0 0 6px 0', color: '#111827' }}>Changes: {latest.details || latest.action}</p>
          <p style={{ margin: '0 0 6px 0', color: '#111827' }}>
            Updated By: {latest.adminName || 'Admin'} ({latest.adminEmail || 'No email'})
          </p>
          <p style={{ margin: 0, color: '#111827' }}>
            Updated At: {latest.createdAt ? new Date(latest.createdAt).toLocaleString() : '-'}
          </p>
        </>
      ) : (
        <>
          <p style={{ margin: '0 0 6px 0', color: '#111827' }}>Changes: No changes yet</p>
          <p style={{ margin: '0 0 6px 0', color: '#111827' }}>Updated By: -</p>
          <p style={{ margin: 0, color: '#111827' }}>Updated At: -</p>
        </>
      )}
    </div>
  );
};

export default PageLatestChangeCard;
