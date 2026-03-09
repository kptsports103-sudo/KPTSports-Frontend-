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
  eventDate: '',
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
  level: item.level || item.event_level || 'Open',
  gender: item.gender || 'Mixed',
  venue: item.venue || '',
  eventDate: item.eventDate || item.date || item.event_date || '',
  eventTime: item.eventTime || '',
  registrationStartDate: item.registrationStartDate || '',
  registrationEndDate: item.registrationEndDate || '',
  registrationStatus: item.registrationStatus || item.status || 'Open',
});

const formatValue = (value, fallback = 'TBA') => {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
};

const getTeamSizeText = (item) => {
  if (item.eventType !== 'Team') return '-';
  return `${formatValue(item.teamSizeMin, '-')} - ${formatValue(item.teamSizeMax, '-')}`;
};

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
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'eventType' && value === 'Individual') {
        updated.teamSizeMin = '';
        updated.teamSizeMax = '';
      }

      return updated;
    });
  };

  const reset = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const buildPayload = () => ({
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
    eventDate: form.eventDate,
    date: form.eventDate,
    event_date: form.eventDate,
    eventTime: form.eventTime,
    registrationStartDate: form.registrationStartDate,
    registrationEndDate: form.registrationEndDate,
    registrationStatus: form.registrationStatus,
    status: form.registrationStatus,
  });

  const validateForm = (payload) => {
    if (!payload.eventName) return 'Event name is required.';

    if (
      payload.eventType === 'Team' &&
      (payload.teamSizeMin === null ||
        payload.teamSizeMax === null ||
        payload.teamSizeMin < 2 ||
        payload.teamSizeMax < 2 ||
        payload.teamSizeMin > payload.teamSizeMax)
    ) {
      return 'Please enter a valid team size range.';
    }

    if (
      payload.registrationStartDate &&
      payload.registrationEndDate &&
      payload.registrationStartDate > payload.registrationEndDate
    ) {
      return 'Registration end date must be after registration start date.';
    }

    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = buildPayload();
    const validationError = validateForm(payload);

    if (validationError) {
      setError(validationError);
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
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save event.');
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
      eventDate: item.eventDate || '',
      eventTime: item.eventTime || '',
      registrationStartDate: item.registrationStartDate || '',
      registrationEndDate: item.registrationEndDate || '',
      registrationStatus: item.registrationStatus || 'Open',
    });

    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    const confirmed = window.confirm('Delete this event?');
    if (!confirmed) return;

    try {
      setError('');
      await api.delete(`/events/${id}`);
      await loadEvents();

      if (editingId === id) reset();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete event.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerBlock}>
        <h2 style={styles.heading}>Annual Sports Celebration Data Entry</h2>
        <p style={styles.subHeading}>Add, update, and manage indoor and outdoor events.</p>
      </div>

      <form onSubmit={onSubmit} style={styles.form}>
        <div style={styles.formTop}>
          <div>
            <h3 style={styles.formTitle}>{editingId ? 'Edit Event' : 'Create New Event'}</h3>
            <p style={styles.formHint}>Fill in the event details below.</p>
          </div>

          {editingId ? <span style={styles.editBadge}>Editing mode</span> : null}
        </div>

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

        {form.eventType === 'Team' && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>Team Details</div>
            <div style={styles.grid2}>
              <input
                style={styles.input}
                type="number"
                min="2"
                name="teamSizeMin"
                value={form.teamSizeMin}
                onChange={onChange}
                placeholder="Minimum team size"
                required
              />
              <input
                style={styles.input}
                type="number"
                min={form.teamSizeMin || 2}
                name="teamSizeMax"
                value={form.teamSizeMax}
                onChange={onChange}
                placeholder="Maximum team size"
                required
              />
            </div>
          </div>
        )}

        <div style={styles.grid2}>
          <input style={styles.input} name="venue" value={form.venue} onChange={onChange} placeholder="Venue" />
          <input style={styles.input} type="date" name="eventDate" value={form.eventDate} onChange={onChange} />
        </div>

        <div style={styles.grid3}>
          <input style={styles.input} type="time" name="eventTime" value={form.eventTime} onChange={onChange} />
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
          <select style={styles.input} name="registrationStatus" value={form.registrationStatus} onChange={onChange}>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>

          <div style={styles.freeBox}>Entry Fee: Free</div>
        </div>

        {error ? <div style={styles.errorBox}>{error}</div> : null}

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
      </form>

      {loading ? <div style={styles.statusBox}>Loading events...</div> : null}

      {!loading && events.length === 0 ? (
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>No events yet</h3>
          <p style={styles.emptyText}>Create your first event using the form above.</p>
        </div>
      ) : (
        <div style={styles.tableGrid}>
          <EventsTable title="Indoor Events" items={grouped.indoor} onEdit={onEdit} onDelete={onDelete} />
          <EventsTable title="Outdoor Events" items={grouped.outdoor} onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
};

const EventsTable = ({ title, items, onEdit, onDelete }) => (
  <section style={styles.tableWrap}>
    <div style={styles.tableHeader}>
      <h3 style={styles.tableTitle}>{title}</h3>
      <span style={styles.countBadge}>{items.length}</span>
    </div>

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
              <tr key={item.id} style={styles.row}>
                <td style={styles.td}>
                  <strong>{formatValue(item.eventName, 'Untitled Event')}</strong>
                  <div style={styles.meta}>{formatValue(item.sportType, 'General')}</div>
                </td>
                <td style={styles.td}>{formatValue(item.eventType, '-')}</td>
                <td style={styles.td}>{formatValue(item.level, '-')}</td>
                <td style={styles.td}>{getTeamSizeText(item)}</td>
                <td style={styles.td}>{formatValue(item.eventDate)}</td>
                <td style={styles.td}>{formatValue(item.eventTime, '-')}</td>
                <td style={styles.td}>{formatValue(item.registrationStartDate, '-')}</td>
                <td style={styles.td}>{formatValue(item.registrationEndDate, '-')}</td>
                <td style={styles.td}>{formatValue(item.venue)}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusPill,
                      ...(item.registrationStatus === 'Closed' ? styles.statusClosed : styles.statusOpen),
                    }}
                  >
                    {formatValue(item.registrationStatus, 'Open')}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.inlineActions}>
                    <button type="button" style={styles.inlineBtn} onClick={() => onEdit(item)}>
                      Edit
                    </button>
                    <button type="button" style={styles.inlineDangerBtn} onClick={() => onDelete(item.id)}>
                      Delete
                    </button>
                  </div>
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
  page: {
    padding: '8px 0 16px',
  },

  headerBlock: {
    marginBottom: 16,
  },

  heading: {
    fontSize: '1.9rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },

  subHeading: {
    marginTop: 8,
    marginBottom: 0,
    color: '#64748b',
    fontSize: '0.98rem',
  },

  form: {
    padding: 18,
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    marginBottom: 18,
    background: '#f8fafc',
    display: 'grid',
    gap: 12,
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
  },

  formTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },

  formTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#0f172a',
  },

  formHint: {
    margin: '4px 0 0',
    color: '#64748b',
    fontSize: '0.92rem',
  },

  editBadge: {
    background: '#fff7ed',
    color: '#c2410c',
    border: '1px solid #fdba74',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },

  card: {
    border: '1px dashed #cbd5e1',
    borderRadius: 12,
    background: '#ffffff',
    padding: 14,
  },

  cardTitle: {
    fontWeight: 700,
    marginBottom: 10,
    color: '#334155',
    fontSize: '0.95rem',
  },

  grid2: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  },

  grid3: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  },

  grid4: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  },

  input: {
    border: '1px solid #cbd5e1',
    borderRadius: 12,
    padding: '12px 14px',
    background: '#fff',
    outline: 'none',
    fontSize: '0.96rem',
    color: '#0f172a',
  },

  freeBox: {
    border: '1px solid #cbd5e1',
    borderRadius: 12,
    padding: '12px 14px',
    background: '#fff',
    color: '#0f172a',
    fontWeight: 700,
  },

  errorBox: {
    border: '1px solid #fecaca',
    background: '#fff1f2',
    color: '#be123c',
    borderRadius: 12,
    padding: '10px 12px',
    fontSize: '0.95rem',
  },

  actions: {
    display: 'flex',
    gap: 10,
    marginTop: 2,
    flexWrap: 'wrap',
  },

  primaryBtn: {
    border: 'none',
    background: '#0f172a',
    color: '#fff',
    borderRadius: 12,
    padding: '11px 16px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.95rem',
  },

  secondaryBtn: {
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#0f172a',
    borderRadius: 12,
    padding: '11px 16px',
    cursor: 'pointer',
    fontWeight: 600,
  },

  statusBox: {
    border: '1px solid #e2e8f0',
    background: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    color: '#475569',
  },

  emptyState: {
    border: '1px dashed #cbd5e1',
    background: '#fff',
    borderRadius: 16,
    padding: 28,
    textAlign: 'center',
  },

  emptyTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '1.1rem',
  },

  emptyText: {
    margin: '8px 0 0',
    color: '#64748b',
  },

  tableGrid: {
    display: 'grid',
    gap: 14,
    gridTemplateColumns: '1fr',
  },

  tableWrap: {
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    background: '#fff',
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
  },

  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 14px 0',
  },

  tableTitle: {
    fontSize: '1.08rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },

  countBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 999,
    background: '#e2e8f0',
    color: '#334155',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    padding: '0 8px',
  },

  scrollX: {
    overflowX: 'auto',
    padding: 14,
  },

  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    minWidth: 760,
  },

  th: {
    textAlign: 'left',
    fontSize: 12,
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
    padding: '10px 8px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 800,
    background: '#fff',
  },

  row: {
    background: '#fff',
  },

  td: {
    borderBottom: '1px solid #f1f5f9',
    padding: '12px 8px',
    verticalAlign: 'top',
    color: '#0f172a',
    fontSize: '0.95rem',
  },

  empty: {
    padding: 18,
    textAlign: 'center',
    color: '#64748b',
  },

  meta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },

  inlineActions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },

  inlineBtn: {
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#0f172a',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    fontWeight: 600,
  },

  inlineDangerBtn: {
    border: '1px solid #fecdd3',
    background: '#fff1f2',
    color: '#be123c',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    fontWeight: 600,
  },

  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },

  statusOpen: {
    background: '#dcfce7',
    color: '#166534',
  },

  statusClosed: {
    background: '#fee2e2',
    color: '#991b1b',
  },
};

export default SportsMeetDataEntry;
