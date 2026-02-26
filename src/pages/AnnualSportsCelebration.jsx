import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const initialForm = {
  playerName: '',
  branch: '',
  year: '1',
  sem: '1',
  registerNumber: '',
  eventId: '',
};

const normalizeEvent = (item) => ({
  ...item,
  id: item._id || item.id,
  eventName: item.eventName || item.event_title || '',
  category: item.category || '',
  sportType: item.sportType || 'Athletics',
  eventType: item.eventType || 'Individual',
  level: item.level || 'Open',
  gender: item.gender || 'Mixed',
  venue: item.venue || 'TBA',
  date: item.date || 'TBA',
});

const normalizeRegistration = (item) => ({
  ...item,
  id: item._id || item.id,
  status: item.status || 'Locked',
});

const AnnualSportsCelebration = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [showReg, setShowReg] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitState, setSubmitState] = useState(false);

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await api.get('/events');
      const list = Array.isArray(res.data) ? res.data.map(normalizeEvent) : [];
      setEvents(list);
      setForm((prev) => ({
        ...prev,
        eventId: prev.eventId || list[0]?.id || '',
      }));
    } catch {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      setLoadingRegs(true);
      const res = await api.get('/registrations');
      const list = Array.isArray(res.data) ? res.data.map(normalizeRegistration) : [];
      setRegistrations(list);
    } catch {
      setRegistrations([]);
    } finally {
      setLoadingRegs(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (showReg) {
      loadRegistrations();
    }
  }, [showReg]);

  const indoor = useMemo(() => events.filter((item) => item.category === 'Indoor'), [events]);
  const outdoor = useMemo(() => events.filter((item) => item.category === 'Outdoor'), [events]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitState(true);

    const payload = {
      playerName: form.playerName.trim(),
      branch: form.branch.trim(),
      year: form.year,
      sem: form.sem,
      registerNumber: form.registerNumber.trim(),
      eventId: form.eventId,
    };

    if (!payload.playerName || !payload.branch || !payload.registerNumber || !payload.eventId) {
      setError('Fill all required fields.');
      setSubmitState(false);
      return;
    }

    try {
      await api.post('/registrations', payload);
      setForm((prev) => ({
        ...prev,
        playerName: '',
        branch: '',
        registerNumber: '',
      }));
      await loadRegistrations();
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Registration failed.');
    } finally {
      setSubmitState(false);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.headerCard}>
        <h1 style={styles.title}>Annual Sports Celebration (College Sports Meet)</h1>
        <p style={styles.subtitle}>
          Indoor and outdoor events are managed in CreatorDashboard. Registration is <strong>Free</strong>.
        </p>
        <button onClick={() => setShowReg((value) => !value)} style={styles.primaryBtn}>
          {showReg ? 'Hide Registration' : 'Sports Registration'}
        </button>
      </header>

      <section style={styles.grid}>
        <EventBlock title="Indoor Games" items={indoor} loading={loadingEvents} />
        <EventBlock title="Outdoor Games" items={outdoor} loading={loadingEvents} />
      </section>

      {showReg ? (
        <section style={styles.registrationSection}>
          <div style={styles.registrationGrid}>
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Player Registration</h3>
              <form onSubmit={submit} style={styles.formGrid}>
                <input
                  name="playerName"
                  value={form.playerName}
                  onChange={onChange}
                  placeholder="Player Name"
                  style={styles.input}
                  required
                />
                <input
                  name="branch"
                  value={form.branch}
                  onChange={onChange}
                  placeholder="Branch (CSE / ECE)"
                  style={styles.input}
                  required
                />
                <div style={styles.inlineGrid}>
                  <select name="year" value={form.year} onChange={onChange} style={styles.input}>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                  <select name="sem" value={form.sem} onChange={onChange} style={styles.input}>
                    {['1', '2', '3', '4', '5', '6', '7', '8'].map((value) => (
                      <option key={value} value={value}>
                        Sem {value}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  name="registerNumber"
                  value={form.registerNumber}
                  onChange={onChange}
                  placeholder="Register Number"
                  style={styles.input}
                  required
                />
                <select name="eventId" value={form.eventId} onChange={onChange} style={styles.input} required>
                  {events.length === 0 ? <option value="">No events available</option> : null}
                  {events.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.category} - {item.eventName}
                    </option>
                  ))}
                </select>
                <div style={styles.helpText}>
                  Fee: <strong>Free</strong> | Status after submit: <strong>Locked</strong>
                </div>
                <button type="submit" style={styles.primaryBtn} disabled={submitState}>
                  {submitState ? 'Submitting...' : 'Submit Registration'}
                </button>
                {error ? <div style={styles.error}>{error}</div> : null}
              </form>
            </div>

            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Registrations (Locked List)</h3>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>#</th>
                      <th style={styles.th}>Player</th>
                      <th style={styles.th}>Branch</th>
                      <th style={styles.th}>Year</th>
                      <th style={styles.th}>Sem</th>
                      <th style={styles.th}>Register No</th>
                      <th style={styles.th}>Event</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingRegs ? (
                      <tr>
                        <td style={styles.td} colSpan={8}>
                          Loading registrations...
                        </td>
                      </tr>
                    ) : registrations.length === 0 ? (
                      <tr>
                        <td style={styles.td} colSpan={8}>
                          No registrations yet
                        </td>
                      </tr>
                    ) : (
                      registrations.map((item, index) => (
                        <tr key={item.id}>
                          <td style={styles.td}>{index + 1}</td>
                          <td style={styles.td}>{item.playerName}</td>
                          <td style={styles.td}>{item.branch}</td>
                          <td style={styles.td}>{item.year}</td>
                          <td style={styles.td}>{item.sem}</td>
                          <td style={styles.td}>{item.registerNumber}</td>
                          <td style={styles.td}>{item.eventName}</td>
                          <td style={styles.td}>
                            <span style={styles.lockedBadge}>{item.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p style={styles.note}>Locked records cannot be edited by participants. Contact admin for corrections.</p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

const EventBlock = ({ title, items, loading }) => (
  <div style={styles.card}>
    <h3 style={styles.sectionTitle}>{title}</h3>
    {loading ? <p style={styles.note}>Loading events...</p> : null}
    {!loading && items.length === 0 ? <p style={styles.note}>No events available</p> : null}
    {!loading &&
      items.map((item) => (
        <div key={item.id} style={styles.eventRow}>
          <div style={styles.eventName}>{item.eventName}</div>
          <div style={styles.eventMeta}>
            {item.sportType} | {item.eventType} | {item.gender}
          </div>
          <div style={styles.eventMeta}>
            Fee: <strong>Free</strong> | Venue: {item.venue || 'TBA'} | Date: {item.date || 'TBA'}
          </div>
        </div>
      ))}
  </div>
);

const styles = {
  page: { padding: 16, maxWidth: 1120, margin: '0 auto' },
  headerCard: { border: '1px solid #d1d5db', borderRadius: 14, padding: 14, background: '#fff' },
  title: { margin: 0, fontSize: '1.8rem', color: '#111827' },
  subtitle: { marginTop: 8, color: '#374151' },
  grid: {
    marginTop: 16,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 16,
  },
  registrationSection: { marginTop: 18 },
  registrationGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)',
    gap: 16,
  },
  card: { border: '1px solid #d1d5db', borderRadius: 14, padding: 14, background: '#fff' },
  sectionTitle: { marginTop: 0, marginBottom: 10, color: '#111827' },
  eventRow: { padding: '10px 0', borderBottom: '1px solid #e5e7eb' },
  eventName: { fontWeight: 700, color: '#111827' },
  eventMeta: { fontSize: 12, color: '#4b5563', marginTop: 2 },
  formGrid: { display: 'grid', gap: 10 },
  inlineGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  input: { padding: 10, borderRadius: 10, border: '1px solid #d1d5db' },
  helpText: { fontSize: 12, color: '#4b5563' },
  primaryBtn: {
    marginTop: 2,
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #111827',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
  },
  error: { color: '#b91c1c', fontSize: 13 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 820 },
  th: { textAlign: 'left', padding: 10, borderBottom: '1px solid #d1d5db', fontSize: 13, color: '#374151' },
  td: { padding: 10, borderBottom: '1px solid #e5e7eb', fontSize: 13, color: '#1f2937' },
  lockedBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 999,
    border: '1px solid #334155',
    fontSize: 12,
    color: '#0f172a',
  },
  note: { marginTop: 10, fontSize: 12, color: '#6b7280' },
};

export default AnnualSportsCelebration;
