import { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

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
        <header style={header}>
          <h2 style={title}>Manage About – Timeline</h2>
          <button
            onClick={() => setIsEditing(v => !v)}
            style={isEditing ? btnCancel : btnEdit}
            disabled={loading}
          >
            {isEditing ? 'Cancel' : 'Edit'}
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
              <button type="button" onClick={addRow} style={btnAdd}>
                + Add Row
              </button>
              <button type="submit" style={btnSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
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
  background: '#fffbe6',
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
  background: '#fff',
  borderRadius: '12px',
  overflow: 'hidden'
};

const thead = {
  background: 'linear-gradient(90deg,#c7ddff,#dffcff)'
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

const rowEven = { background: '#f7fcff' };
const rowOdd = { background: '#fff4f8' };

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
