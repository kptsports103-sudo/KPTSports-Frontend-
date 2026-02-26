import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const initialForm = {
  eventName: '',
  category: 'Outdoor',
  sportType: 'Athletics',
  eventType: 'Individual',
  teamSizeMin: '',
  teamSizeMax: '',
  level: 'Open',
  gender: 'Mixed',
  venue: '',
  date: '',
  eventTime: '',
  registrationStartDate: '',
  registrationEndDate: '',
  registrationStatus: 'Open',
};

const sportsTypeOptions = ['Athletics', 'Team Sport', 'Mind Sport', 'Fitness'];
const levelOptions = ['Open', 'Beginner', 'Intermediate', 'Advanced'];
const genderOptions = ['Male', 'Female', 'Mixed'];

const normalizeEvent = (item) => ({
  ...item,
  id: item._id || item.id,
  eventName: item.eventName || item.event_title || '',
  category: item.category || 'Outdoor',
  sportType: item.sportType || 'Athletics',
  eventType: item.eventType || 'Individual',
  teamSizeMin: item.teamSizeMin ?? '',
  teamSizeMax: item.teamSizeMax ?? '',
  level: item.level || 'Open',
  gender: item.gender || 'Mixed',
  venue: item.venue || '',
  date: item.date || '',
  eventTime: item.eventTime || '',
  registrationStartDate: item.registrationStartDate || '',
  registrationEndDate: item.registrationEndDate || '',
  registrationStatus: item.registrationStatus || item.status || 'Open',
});

const SportsMeetDataEntry = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const grouped = useMemo(
    () => ({
      indoor: events.filter((item) => item.category === 'Indoor'),
      outdoor: events.filter((item) => item.category === 'Outdoor'),
    }),
    [events]
  );

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/events');
      const list = Array.isArray(res.data) ? res.data.map(normalizeEvent) : [];
      setEvents(list);
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Unable to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      eventName: form.eventName.trim(),
      event_title: form.eventName.trim(),
      category: form.category,
      sportType: form.sportType,
      eventType: form.eventType,
      teamSizeMin: form.eventType === 'Team' && form.teamSizeMin !== '' ? Number(form.teamSizeMin) : null,
      teamSizeMax: form.eventType === 'Team' && form.teamSizeMax !== '' ? Number(form.teamSizeMax) : null,
      level: form.level,
      event_level: form.level,
      gender: form.gender,
      venue: form.venue.trim(),
      date: form.date,
      event_date: form.date,
      eventTime: form.eventTime,
      registrationStartDate: form.registrationStartDate,
      registrationEndDate: form.registrationEndDate,
      registrationStatus: form.registrationStatus,
      status: form.registrationStatus,
    };

    if (!payload.eventName) {
      setError('Event Name is required.');
      setSaving(false);
      return;
    }

    if (
      payload.eventType === 'Team' &&
      (payload.teamSizeMin === null || payload.teamSizeMax === null || payload.teamSizeMin > payload.teamSizeMax)
    ) {
      setError('Team size range is invalid.');
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, payload);
      } else {
        await api.post('/events', payload);
      }
      reset();
      await loadEvents();
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setForm({
      eventName: item.eventName || '',
      category: item.category || 'Outdoor',
      sportType: item.sportType || 'Athletics',
      eventType: item.eventType || 'Individual',
      teamSizeMin: item.teamSizeMin ?? '',
      teamSizeMax: item.teamSizeMax ?? '',
      level: item.level || 'Open',
      gender: item.gender || 'Mixed',
      venue: item.venue || '',
      date: item.date || '',
      eventTime: item.eventTime || '',
      registrationStartDate: item.registrationStartDate || '',
      registrationEndDate: item.registrationEndDate || '',
      registrationStatus: item.registrationStatus || item.status || 'Open',
    });
    setError('');
  };

  const onDelete = async (id) => {
    try {
      setError('');
      await api.delete(`/events/${id}`);
      await loadEvents();
      if (editingId === id) reset();
    } catch (deleteError) {
      setError(deleteError.response?.data?.error || 'Delete failed.');
    }
  };

  return (
    <div>
      <h2 style={styles.heading}>Annual Sports Celebration Data Entry</h2>
      <p style={styles.subHeading}>CreatorDashboard-managed events loaded from database.</p>

      <form onSubmit={onSubmit} style={styles.form}>
        <div style={styles.grid2}>
          <input
            style={styles.input}
            name="eventName"
            value={form.eventName}
            onChange={onChange}
            placeholder="Event Name"
            required
          />
          <select style={styles.input} name="category" value={form.category} onChange={onChange}>
            <option value="Indoor">Indoor</option>
            <option value="Outdoor">Outdoor</option>
          </select>
        </div>

        <div style={styles.grid4}>
          <select style={styles.input} name="sportType" value={form.sportType} onChange={onChange}>
            {sportsTypeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select style={styles.input} name="eventType" value={form.eventType} onChange={onChange}>
            <option value="Individual">Individual</option>
            <option value="Team">Team</option>
          </select>
          <select style={styles.input} name="level" value={form.level} onChange={onChange}>
            {levelOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select style={styles.input} name="gender" value={form.gender} onChange={onChange}>
            {genderOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {form.eventType === 'Team' ? (
          <div style={styles.grid2}>
            <input
              style={styles.input}
              type="number"
              min="2"
              name="teamSizeMin"
              value={form.teamSizeMin}
              onChange={onChange}
              placeholder="Team Size Min"
              required
            />
            <input
              style={styles.input}
              type="number"
              min={form.teamSizeMin || 2}
              name="teamSizeMax"
              value={form.teamSizeMax}
              onChange={onChange}
              placeholder="Team Size Max"
              required
            />
          </div>
        ) : null}

        <div style={styles.grid2}>
          <input
            style={styles.input}
            name="venue"
            value={form.venue}
            onChange={onChange}
            placeholder="Venue"
          />
          <input style={styles.input} type="date" name="date" value={form.date} onChange={onChange} />
        </div>

        <div style={styles.grid3}>
          <input
            style={styles.input}
            type="time"
            name="eventTime"
            value={form.eventTime}
            onChange={onChange}
            placeholder="Event Time"
          />
          <input
            style={styles.input}
            type="date"
            name="registrationStartDate"
            value={form.registrationStartDate}
            onChange={onChange}
          />
          <input
            style={styles.input}
            type="date"
            name="registrationEndDate"
            value={form.registrationEndDate}
            onChange={onChange}
          />
        </div>

        <div style={styles.grid2}>
          <select
            style={styles.input}
            name="registrationStatus"
            value={form.registrationStatus}
            onChange={onChange}
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
          <div style={styles.freeBox}>Entry Fee: Free</div>
        </div>

        <div style={styles.actions}>
          <button type="submit" style={styles.primaryBtn} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Event' : 'Add Event'}
          </button>
          {editingId && (
            <button type="button" style={styles.secondaryBtn} onClick={reset}>
              Cancel
            </button>
          )}
        </div>
        {error ? <p style={styles.error}>{error}</p> : null}
      </form>

      {loading ? <p style={styles.loading}>Loading events...</p> : null}

      <div style={styles.tableGrid}>
        <EventsTable title="Indoor Events" items={grouped.indoor} onEdit={onEdit} onDelete={onDelete} />
        <EventsTable title="Outdoor Events" items={grouped.outdoor} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
};

const EventsTable = ({ title, items, onEdit, onDelete }) => (
  <section style={styles.tableWrap}>
    <h3 style={styles.tableTitle}>{title}</h3>
    <div style={styles.scrollX}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Event</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Level</th>
            <th style={styles.th}>Team Size</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Time</th>
            <th style={styles.th}>Reg Start</th>
            <th style={styles.th}>Reg End</th>
            <th style={styles.th}>Venue</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td style={styles.empty} colSpan={11}>
                No events added
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td style={styles.td}>
                  <strong>{item.eventName}</strong>
                  <div style={styles.meta}>{item.sportType}</div>
                </td>
                <td style={styles.td}>{item.eventType}</td>
                <td style={styles.td}>{item.level}</td>
                <td style={styles.td}>
                  {item.eventType === 'Team'
                    ? `${item.teamSizeMin || '-'} - ${item.teamSizeMax || '-'}`
                    : '-'}
                </td>
                <td style={styles.td}>{item.date || 'TBA'}</td>
                <td style={styles.td}>{item.eventTime || '-'}</td>
                <td style={styles.td}>{item.registrationStartDate || '-'}</td>
                <td style={styles.td}>{item.registrationEndDate || '-'}</td>
                <td style={styles.td}>{item.venue || 'TBA'}</td>
                <td style={styles.td}>{item.registrationStatus}</td>
                <td style={styles.td}>
                  <button type="button" style={styles.inlineBtn} onClick={() => onEdit(item)}>
                    Edit
                  </button>
                  <button type="button" style={styles.inlineDangerBtn} onClick={() => onDelete(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </section>
);

const styles = {
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#111827' },
  subHeading: { marginTop: 6, marginBottom: 16, color: '#6b7280' },
  form: {
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    marginBottom: 18,
    background: '#f9fafb',
    display: 'grid',
    gap: 10,
  },
  grid2: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' },
  grid3: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' },
  grid4: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' },
  input: { border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', background: '#fff' },
  freeBox: {
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '10px 12px',
    background: '#fff',
    color: '#111827',
    fontWeight: 600,
  },
  actions: { display: 'flex', gap: 10, marginTop: 4 },
  primaryBtn: {
    border: '1px solid #111827',
    background: '#111827',
    color: '#fff',
    borderRadius: 8,
    padding: '10px 14px',
    cursor: 'pointer',
  },
  secondaryBtn: {
    border: '1px solid #9ca3af',
    background: '#fff',
    color: '#111827',
    borderRadius: 8,
    padding: '10px 14px',
    cursor: 'pointer',
  },
  error: { color: '#b91c1c', margin: 0 },
  loading: { color: '#4b5563', marginBottom: 12 },
  tableGrid: { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' },
  tableWrap: { border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff' },
  tableTitle: { fontSize: '1.1rem', fontWeight: 700, padding: '12px 12px 0 12px', color: '#111827' },
  scrollX: { overflowX: 'auto', padding: 12 },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 620 },
  th: {
    textAlign: 'left',
    fontSize: 12,
    color: '#6b7280',
    borderBottom: '1px solid #e5e7eb',
    padding: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  td: { borderBottom: '1px solid #f3f4f6', padding: 8, verticalAlign: 'top' },
  empty: { padding: 12, textAlign: 'center', color: '#6b7280' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  inlineBtn: {
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    borderRadius: 6,
    padding: '4px 8px',
    marginRight: 6,
    cursor: 'pointer',
  },
  inlineDangerBtn: {
    border: '1px solid #fecaca',
    background: '#fff1f2',
    color: '#be123c',
    borderRadius: 6,
    padding: '4px 8px',
    cursor: 'pointer',
  },
};

export default SportsMeetDataEntry;
