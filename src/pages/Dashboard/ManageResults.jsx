import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const YEARS = ['all', ...Array.from({ length: 15 }, (_, i) => 2011 + i)];
const MEDALS = ['Gold', 'Silver', 'Bronze'];

const ManageResults = () => {
  const [results, setResults] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    event: '',
    year: '',
    medal: '',
    imageUrl: ''
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get('/results');
      setResults(res.data || []);
    } catch {
      console.error('Failed to fetch results');
    }
  };

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/results/${editingId}`, form);
      } else {
        await api.post('/results', form);
      }
      resetForm();
      setIsEditing(false);
      fetchResults();
    } catch {
      alert('Failed to save result');
    }
  };

  /* ================= HELPERS ================= */
  const handleEdit = (item) => {
    setForm({
      name: item.name,
      event: item.event,
      year: item.year,
      medal: item.medal,
      imageUrl: item.imageUrl || ''
    });
    setEditingId(item._id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await api.delete(`/results/${id}`);
      fetchResults();
    } catch {
      alert('Delete failed');
    }
  };

  const resetForm = () => {
    setForm({ name: '', event: '', year: '', medal: '', imageUrl: '' });
    setEditingId(null);
  };

  /* ================= GROUP BY YEAR ================= */
  const groupedResults = results.reduce((acc, item) => {
    if (selectedYear !== 'all' && String(item.year) !== String(selectedYear)) {
      return acc;
    }
    acc[item.year] = acc[item.year] || [];
    acc[item.year].push(item);
    return acc;
  }, {});

  /* ================= UI ================= */
  return (
    <AdminLayout>
      <div style={page}>
        <h3 style={{ fontSize: 28, fontWeight: 700 }}>Manage Results</h3>

        {/* TOP ACTION */}
        <div style={{ marginBottom: 12 }}>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={btnPrimary}>
              ➕ Add / Edit Result
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false);
                resetForm();
              }}
              style={btnSecondary}
            >
              ❌ Cancel
            </button>
          )}
        </div>

        {!isEditing ? (
          /* ============== VIEW MODE ============== */
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead style={theadSticky}>
                <tr>
                  <th>Name</th>
                  <th>Event</th>

                  {/* YEAR SELECT IN HEADER */}
                  <th>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>Year</span>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        style={yearSelect}
                      >
                        {YEARS.map(y => (
                          <option key={y} value={y}>
                            {y === 'all' ? 'All Years' : y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>

                  <th>Medal</th>
                  <th>Image</th>
                  <th>Move</th>
                </tr>
              </thead>

              <tbody>
                {Object.keys(groupedResults).length === 0 && (
                  <tr>
                    <td colSpan="6" style={emptyCell}>
                      No records found
                    </td>
                  </tr>
                )}

                {Object.entries(groupedResults).map(([year, items]) => (
                  <React.Fragment key={year}>
                    {/* YEAR ROW */}
                    <tr>
                      <td colSpan="6" style={yearRow}>
                        Year: {year}
                      </td>
                    </tr>

                    {items.map(item => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.event}</td>
                        <td>{item.year}</td>
                        <td>{item.medal}</td>
                        <td>
                          {item.imageUrl ? (
                            <a href={item.imageUrl} target="_blank" rel="noreferrer">
                              View
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleEdit(item)}
                            style={btnEdit}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            style={btnDelete}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ============== EDIT MODE ============== */
          <form onSubmit={handleSubmit}>
            <table style={tableStyle}>
              <tbody>
                <tr style={theadStyle}>
                  <th width="30%">Field</th>
                  <th>Value</th>
                </tr>

                <Field label="Name">
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Field>

                <Field label="Event">
                  <input
                    value={form.event}
                    onChange={e => setForm({ ...form, event: e.target.value })}
                    required
                  />
                </Field>

                <Field label="Select Year">
                  <select
                    value={form.year}
                    onChange={e => setForm({ ...form, year: e.target.value })}
                    required
                  >
                    <option value="">Select Year</option>
                    {YEARS.filter(y => y !== 'all').map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Medal">
                  <select
                    value={form.medal}
                    onChange={e => setForm({ ...form, medal: e.target.value })}
                    required
                  >
                    <option value="">Select Medal</option>
                    {MEDALS.map(m => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Image URL">
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  />
                </Field>
              </tbody>
            </table>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button type="submit" style={btnSave}>
                💾 Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

/* ================= REUSABLE ================= */
const Field = ({ label, children }) => (
  <tr>
    <td style={fieldLabel}>{label}</td>
    <td style={fieldValue}>{children}</td>
  </tr>
);

/* ================= STYLES ================= */
const page = {
  background: '#0f3b2e',
  minHeight: '100vh',
  padding: 15,
  color: '#fff'
};

const tableWrapper = {
  overflowX: 'auto',
  background: '#fff',
  borderRadius: 6
};

const tableStyle = {
  width: '100%',
  background: '#fff',
  color: '#000',
  borderCollapse: 'collapse'
};

const theadStyle = {
  background: '#007bff',
  color: '#fff'
};

const theadSticky = {
  background: '#007bff',
  color: '#fff',
  position: 'sticky',
  top: 0,
  zIndex: 10
};

const yearSelect = {
  marginTop: 4,
  padding: 4,
  fontSize: 12,
  borderRadius: 4
};

const yearRow = {
  background: '#e9f5ff',
  fontWeight: 700,
  color: '#0056b3',
  padding: 10
};

const fieldLabel = { padding: 14, fontWeight: 600 };
const fieldValue = { padding: 14 };
const emptyCell = { padding: 20, textAlign: 'center' };

const btnPrimary = { padding: '8px 14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 5 };
const btnSecondary = { padding: '8px 14px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 5 };
const btnEdit = { marginRight: 6, padding: '6px 10px', background: '#ffc107', border: 'none', borderRadius: 4 };
const btnDelete = { padding: '6px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4 };
const btnSave = { padding: '12px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16 };

export default ManageResults;
