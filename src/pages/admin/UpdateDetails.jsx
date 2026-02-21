import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import activityLogService from '../../services/activityLog.service';
import { CMS_PAGE_UPDATED } from '../../utils/eventBus';

const PAGE_META = {
  'Home Page': { title: 'Update Home', description: 'Manage home page content' },
  'About Page': { title: 'Update About', description: 'Manage about page content' },
  'History Page': { title: 'Update History', description: 'Manage history page content' },
  'Events Page': { title: 'Update Events', description: 'Manage events page content' },
  'Gallery Page': { title: 'Update Gallery', description: 'Manage gallery page content' },
  'Results Page': { title: 'Update Results', description: 'Manage results page content' }
};

const UpdateDetails = () => {
  const { pageName: rawPageName } = useParams();
  const pageName = decodeURIComponent(rawPageName || '');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const meta = useMemo(() => {
    return PAGE_META[pageName] || { title: `Update ${pageName}`, description: 'Manage page content' };
  }, [pageName]);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const res = await activityLogService.getPageActivityLogs(pageName, 50);
        setLogs(res?.data || []);
      } catch (error) {
        console.error('Failed to load update details logs:', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    if (pageName) {
      loadLogs();
    }

    const onHomeUpdated = (event) => {
      const updatedPageName = event?.detail?.pageName;
      if (!updatedPageName || updatedPageName === pageName) {
        loadLogs();
      }
    };

    window.addEventListener(CMS_PAGE_UPDATED, onHomeUpdated);
    window.addEventListener('HOME_UPDATED', onHomeUpdated);
    return () => {
      window.removeEventListener(CMS_PAGE_UPDATED, onHomeUpdated);
      window.removeEventListener('HOME_UPDATED', onHomeUpdated);
    };
  }, [pageName]);

  return (
    <AdminLayout>
      <div style={{ padding: 20, color: '#000' }}>
        <h2 style={{ marginBottom: 8 }}>Welcome to {meta.title}</h2>
        <p style={{ marginTop: 0, marginBottom: 6 }}>{meta.description}</p>
        <p style={{ marginTop: 0 }}>Here you can see all changes for <b>{pageName}</b>.</p>

        <hr style={{ border: '1px solid #ddd', margin: '16px 0' }} />

        {loading ? (
          <p>Loading changes...</p>
        ) : logs.length === 0 ? (
          <p>No changes yet</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {logs.map((log) => (
              <div
                key={log._id}
                style={{
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 12
                }}
              >
                <p style={{ margin: '0 0 6px 0' }}>Changes: {log.details || log.action}</p>
                <p style={{ margin: '0 0 6px 0' }}>
                  Updated By: {log.adminName || 'Admin'} ({log.adminEmail || 'No email'})
                </p>
                <p style={{ margin: 0 }}>
                  Updated At: {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UpdateDetails;


