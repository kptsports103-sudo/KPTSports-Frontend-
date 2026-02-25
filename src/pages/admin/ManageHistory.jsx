import { useEffect, useState } from 'react';
import api from '../../services/api';
import activityLogService from '../../services/activityLog.service';
import AdminLayout from './AdminLayout';
import PageLatestChangeCard from '../../components/PageLatestChangeCard';

const ManageHistory = () => {
  const [timeline, setTimeline] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/home/about-timeline');
      setTimeline(Array.isArray(data.timeline) ? data.timeline : []);
    } catch (e) {
      alert('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const saveTimeline = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/home/about-timeline', { timeline });
      alert('Timeline updated');
      setIsEditing(false);
      loadTimeline();
      
      // Log the activity
      activityLogService.logActivity(
        'Updated History Page Content',
        'History Page',
        `Updated ${timeline.length} timeline entries`,
        [
          { field: 'Timeline Entries', after: String(timeline.length) },
          { field: 'Year Range', after: timeline.length ? `${timeline[0]?.year || '-'} to ${timeline[timeline.length - 1]?.year || '-'}` : '-' }
        ]
      );
    } catch {
      alert('Save failed');
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (i, field, value) => {
    const copy = [...timeline];
    copy[i] = { ...copy[i], [field]: value };
    setTimeline(copy);
  };

  const addRow = () => {
    setTimeline([...timeline, { year: '', host: '', venue: '' }]);
  };

  const removeRow = (i) => {
    setTimeline(timeline.filter((_, idx) => idx !== i));
  };

  return (
    <AdminLayout>
      <div style={page}>
        <PageLatestChangeCard pageName="History Page" />
        <header style={header}>
          <div>
            <h2 style={{ ...title, margin: 0 }}>📜 Update History</h2>
            <p style={{ margin: '6px 0 0 0', color: '#000' }}>Manage history page content</p>
          </div>
          <button
            onClick={() => setIsEditing(v => !v)}
            style={{
              ...(isEditing ? btnCancel : btnEdit),
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            disabled={loading}
          >
            {!isEditing ? (
              <>
                <img
                  src="/Edit button.png"
                  alt="Edit"
                  style={{ width: '16px', height: '16px' }}
                />
                Edit
              </>
            ) : (
              <>
                ❌ Cancel
              </>
            )}
          </button>
        </header>

        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <table style={table}>
            <thead>
              <tr style={thead}>
                <th style={th}>#</th>
                <th style={th}>Academic Year</th>
                <th style={th}>Host Polytechnic</th>
                <th style={th}>Venue</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((row, i) => (
                <tr key={i} style={i % 2 === 0 ? rowEven : rowOdd}>
                  <td style={tdCenter}>{i + 1}</td>
                  <td style={td}>{row.year}</td>
                  <td style={tdHost}>{row.host}</td>
                  <td style={tdVenue}>{row.venue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* ================= EDIT MODE ================= */
          <form onSubmit={saveTimeline}>
            <table style={table}>
              <thead>
                <tr style={thead}>
                  <th style={th}>#</th>
                  <th style={th}>Academic Year</th>
                  <th style={th}>Host Polytechnic</th>
                  <th style={th}>Venue</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((row, i) => (
                  <tr key={i} style={i % 2 === 0 ? rowEven : rowOdd}>
                    <td style={tdCenter}>{i + 1}</td>
                    <td style={td}>
                      <input
                        value={row.year}
                        onChange={e => updateRow(i, 'year', e.target.value)}
                        style={input}
                      />
                    </td>
                    <td style={td}>
                      <input
                        value={row.host}
                        onChange={e => updateRow(i, 'host', e.target.value)}
                        style={input}
                      />
                    </td>
                    <td style={td}>
                      <input
                        value={row.venue}
                        onChange={e => updateRow(i, 'venue', e.target.value)}
                        style={input}
                      />
                    </td>
                    <td style={tdCenter}>
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        style={btnRemove}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={actions}>
              <button
                type="button"
                onClick={addRow}
                style={{
                  ...btnAdd,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <img
                  src="/Add button.png"
                  alt="Add"
                  style={{ width: '18px', height: '18px' }}
                />
                Add Row
              </button>
              <button
                type="submit"
                style={{
                  ...btnSave,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                disabled={loading}
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <img
                      src="/Save button.png"
                      alt="Save"
                      style={{ width: '18px', height: '18px' }}
                    />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

/* ===================== STYLES ===================== */

const page = {
  background: '#f4f6f8',
  minHeight: '100vh',
  padding: '20px'
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px'
};

const title = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#0b3ea8'
};

const table = {
  width: '100%',
  maxWidth: '1100px',
  margin: '0 auto',
  borderCollapse: 'collapse',
  background: '#ffffff',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)',
  border: '1px solid #cfd6df'
};

const thead = {
  background: 'linear-gradient(135deg, #eef2f6 0%, #d6dde5 100%)'
};

const th = {
  padding: '16px',
  textAlign: 'left',
  fontWeight: '700',
  color: '#000'
};

const td = {
  padding: '14px',
  fontSize: '18px',
  color: '#000'
};

const tdCenter = {
  ...td,
  textAlign: 'center',
  fontWeight: '600'
};

const tdHost = { ...td };
const tdVenue = { ...td };

const rowEven = { background: '#ffffff' };
const rowOdd = { background: '#f5f7fa' };

/* 🔥 FIXED INPUT STYLE 🔥 */
const input = {
  width: '100%',
  padding: '6px 8px',
  border: '1px solid #000',
  borderRadius: '4px',
  color: '#000000f0',              // ✅ TEXT COLOR BLACK
  backgroundColor: '#fff',    // ✅ WHITE BACKGROUND
  fontSize: '18px'
};

const actions = {
  maxWidth: '1100px',
  margin: '20px auto',
  display: 'flex',
  justifyContent: 'space-between'
};

const btnEdit = {
  padding: '8px 16px',
  background: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const btnCancel = {
  ...btnEdit,
  background: '#6c757d'
};

const btnAdd = {
  padding: '10px 18px',
  background: '#17a2b8',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const btnSave = {
  padding: '10px 20px',
  background: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  fontWeight: '600',
  cursor: 'pointer'
};

const btnRemove = {
  padding: '6px 10px',
  background: '#dc3545',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default ManageHistory;

