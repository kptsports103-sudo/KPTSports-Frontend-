import { useMemo, useState } from 'react';
import { readSportsMeetEvents, writeSportsMeetEvents } from '../../data/sportsMeetEvents';

const initialForm = {
  eventName: '',
  category: 'Outdoor',
  sportType: 'Athletics',
  entryFee: '',
  level: 'Open',
  gender: 'Mixed',
  eventType: 'Individual',
  maxParticipants: '',
  maxTeams: '',
  date: '',
  time: '',
  venue: '',
  status: 'Open',
};

const sportsTypeOptions = ['Athletics', 'Team Sport', 'Mind Sport', 'Fitness'];
const levelOptions = ['Open', 'Beginner', 'Intermediate', 'Advanced'];
const genderOptions = ['Male', 'Female', 'Mixed'];

const normalizeText = (value) => value.trim().toLowerCase();

const SportsMeetDataEntry = () => {
  const [events, setEvents] = useState(() => readSportsMeetEvents());
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const grouped = useMemo(
    () => ({
      indoor: events.filter((item) => item.category === 'Indoor'),
      outdoor: events.filter((item) => item.category === 'Outdoor'),
    }),
    [events]
  );

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.eventName.trim()) {
      setError('Event Name is required.');
      return;
    }

    const duplicate = events.some(
      (item) =>
        item.id !== editingId &&
        item.category === form.category &&
        normalizeText(item.eventName) === normalizeText(form.eventName)
    );
    if (duplicate) {
      setError('This event already exists in the selected category.');
      return;
    }

    const payload = {
      ...form,
      eventName: form.eventName.trim(),
      venue: form.venue.trim(),
      entryFee: form.entryFee === '' ? '' : Number(form.entryFee),
      maxParticipants: form.eventType === 'Individual' ? form.maxParticipants : '',
      maxTeams: form.eventType === 'Team' ? form.maxTeams : '',
    };

    let next;
    if (editingId) {
      next = events.map((item) => (item.id === editingId ? { ...item, ...payload } : item));
    } else {
      next = [
        ...events,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ...payload,
        },
      ];
    }

    setEvents(next);
    writeSportsMeetEvents(next);
    reset();
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setForm({
      eventName: item.eventName ?? '',
      category: item.category ?? 'Outdoor',
      sportType: item.sportType ?? 'Athletics',
      entryFee: item.entryFee ?? '',
      level: item.level ?? 'Open',
      gender: item.gender ?? 'Mixed',
      eventType: item.eventType ?? 'Individual',
      maxParticipants: item.maxParticipants ?? '',
      maxTeams: item.maxTeams ?? '',
      date: item.date ?? '',
      time: item.time ?? '',
      venue: item.venue ?? '',
      status: item.status ?? 'Open',
    });
    setError('');
  };

  const onDelete = (id) => {
    const next = events.filter((item) => item.id !== id);
    setEvents(next);
    writeSportsMeetEvents(next);
    if (editingId === id) reset();
  };

  return (
    <div>
      <h2 style={styles.heading}>Annual Sports Celebration Data Entry</h2>
      <p style={styles.subHeading}>Add, edit, and delete indoor and outdoor events for the public page.</p>

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

          <input
            style={styles.input}
            type="number"
            min="0"
            name="entryFee"
            value={form.entryFee}
            onChange={onChange}
            placeholder="Entry Fee"
          />

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

        <div style={styles.grid4}>
          <select style={styles.input} name="eventType" value={form.eventType} onChange={onChange}>
            <option value="Individual">Individual</option>
            <option value="Team">Team</option>
          </select>

          {form.eventType === 'Individual' ? (
            <input
              style={styles.input}
              type="number"
              min="1"
              name="maxParticipants"
              value={form.maxParticipants}
              onChange={onChange}
              placeholder="Max Participants"
            />
          ) : (
            <input
              style={styles.input}
              type="number"
              min="1"
              name="maxTeams"
              value={form.maxTeams}
              onChange={onChange}
              placeholder="Max Teams"
            />
          )}

          <input style={styles.input} type="date" name="date" value={form.date} onChange={onChange} />
          <input style={styles.input} type="time" name="time" value={form.time} onChange={onChange} />
        </div>

        <div style={styles.grid2}>
          <input
            style={styles.input}
            name="venue"
            value={form.venue}
            onChange={onChange}
            placeholder="Venue"
          />
          <select style={styles.input} name="status" value={form.status} onChange={onChange}>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div style={styles.actions}>
          <button type="submit" style={styles.primaryBtn}>
            {editingId ? 'Update Event' : 'Add Event'}
          </button>
          {editingId && (
            <button type="button" style={styles.secondaryBtn} onClick={reset}>
              Cancel
            </button>
          )}
        </div>
        {error ? <p style={styles.error}>{error}</p> : null}
      </form>

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
            <th style={styles.th}>Fee</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Venue</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td style={styles.empty} colSpan={7}>
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
                <td style={styles.td}>{item.entryFee === '' ? '-' : `Rs. ${item.entryFee}`}</td>
                <td style={styles.td}>{item.eventType}</td>
                <td style={styles.td}>{item.date || '-'}</td>
                <td style={styles.td}>{item.venue || '-'}</td>
                <td style={styles.td}>{item.status}</td>
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
  grid4: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' },
  input: { border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', background: '#fff' },
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
