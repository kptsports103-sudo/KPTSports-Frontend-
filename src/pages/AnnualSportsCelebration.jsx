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
  id: item._id || item.id,
  playerName: item.playerName || '',
  branch: item.branch || '',
  year: item.year || '',
  sem: item.sem || '',
  registerNumber: item.registerNumber || '',
  eventName: item.eventName || '',
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
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await api.get('/events');
      const list = Array.isArray(res.data) ? res.data.map(normalizeEvent) : [];
      setEvents(list);
      setForm((prev) => ({ ...prev, eventId: prev.eventId || list[0]?.id || '' }));
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
    if (showReg) loadRegistrations();
  }, [showReg]);

  const indoor = useMemo(() => events.filter((item) => item.category === 'Indoor'), [events]);
  const outdoor = useMemo(() => events.filter((item) => item.category === 'Outdoor'), [events]);

  const branchOptions = useMemo(() => {
    const set = new Set(registrations.map((r) => r.branch).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [registrations]);

  const filteredRegs = useMemo(() => {
    return registrations.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.playerName.toLowerCase().includes(q) ||
        item.registerNumber.toLowerCase().includes(q) ||
        item.eventName.toLowerCase().includes(q);
      const matchesBranch = branchFilter === 'all' || item.branch === branchFilter;
      const matchesYear = yearFilter === 'all' || item.year === yearFilter;
      return matchesSearch && matchesBranch && matchesYear;
    });
  }, [registrations, search, branchFilter, yearFilter]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

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
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/registrations', payload);
      setForm((prev) => ({ ...prev, playerName: '', branch: '', registerNumber: '' }));
      await loadRegistrations();
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div>
          <h1 style={styles.heroTitle}>Annual Sports Celebration</h1>
          <p style={styles.heroSub}>(College Sports Meet)</p>
          <p style={styles.heroMeta}>2026 | Registration Open</p>
        </div>
        <div style={styles.statsBar}>
          <Stat title="Total Events" value={events.length} />
          <Stat title="Total Registrations" value={registrations.length} />
          <Stat title="Indoor Events" value={indoor.length} sub={`Outdoor Events: ${outdoor.length}`} />
        </div>
      </section>

      <section style={styles.eventsGrid}>
        <EventCard title="Indoor Games" items={indoor} loading={loadingEvents} />
        <EventCard title="Outdoor Games" items={outdoor} loading={loadingEvents} />
      </section>

      <div style={styles.toggleRow}>
        <button onClick={() => setShowReg((v) => !v)} style={styles.regBtn}>
          {showReg ? 'Hide Registration' : 'Sports Registration'}
        </button>
      </div>

      {showReg ? (
        <section style={styles.regGrid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Player Registration</h3>
            <form onSubmit={submit} style={styles.form}>
              <select name="eventId" value={form.eventId} onChange={change} style={styles.input} required>
                {events.length === 0 ? <option value="">Select Event...</option> : null}
                {events.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.category} - {item.eventName}
                  </option>
                ))}
              </select>
              <input
                style={styles.input}
                name="playerName"
                placeholder="Player Name"
                value={form.playerName}
                onChange={change}
                required
              />
              <input
                style={styles.input}
                name="registerNumber"
                placeholder="Register Number"
                value={form.registerNumber}
                onChange={change}
                required
              />
              <div style={styles.sectionLine}>Player Details</div>
              <input
                style={styles.input}
                name="branch"
                placeholder="Branch (CSE / ECE)"
                value={form.branch}
                onChange={change}
                required
              />
              <div style={styles.inline2}>
                <select name="year" value={form.year} onChange={change} style={styles.input}>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
                <select name="sem" value={form.sem} onChange={change} style={styles.input}>
                  {['1', '2', '3', '4', '5', '6', '7', '8'].map((n) => (
                    <option key={n} value={n}>
                      Sem {n}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={submitting} style={styles.submitBtn}>
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
              <div style={styles.fee}>Fee: Free | Status after submit: <strong>Locked</strong></div>
              {error ? <div style={styles.error}>{error}</div> : null}
            </form>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Registrations (Locked List)</h3>
            <div style={styles.toolbar}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.search}
                placeholder="Search..."
              />
              <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} style={styles.filter}>
                <option value="all">All Branches</option>
                {branchOptions.filter((b) => b !== 'all').map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={styles.filter}>
                <option value="all">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>

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
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRegs ? (
                    <tr>
                      <td style={styles.td} colSpan={7}>Loading registrations...</td>
                    </tr>
                  ) : filteredRegs.length === 0 ? (
                    <tr>
                      <td style={styles.empty} colSpan={7}>
                        <div style={styles.emptyIcon}>📄</div>
                        <div style={styles.emptyTitle}>No registrations submitted yet.</div>
                        <div style={styles.emptyText}>Once you register, it will appear here.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredRegs.map((r, idx) => (
                      <tr key={r.id}>
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={styles.td}>{r.playerName}</td>
                        <td style={styles.td}>{r.branch}</td>
                        <td style={styles.td}>{r.year}</td>
                        <td style={styles.td}>{r.sem}</td>
                        <td style={styles.td}>{r.registerNumber}</td>
                        <td style={styles.td}>
                          <span style={styles.badge}>{r.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p style={styles.lockNote}>Locked records cannot be edited by participants. Contact admin for corrections.</p>
          </div>
        </section>
      ) : null}
    </div>
  );
};

const Stat = ({ title, value, sub }) => (
  <div style={styles.statItem}>
    <div style={styles.statValue}>{title}: {value}</div>
    <div style={styles.statSub}>{sub || title}</div>
  </div>
);

const EventCard = ({ title, items, loading }) => (
  <div style={styles.eventCard}>
    <div style={styles.eventHead}>
      <h3 style={styles.eventTitle}>{title}</h3>
      <span style={styles.count}>{items.length} Events</span>
    </div>
    {loading ? <p style={styles.eventNone}>Loading events...</p> : null}
    {!loading && items.length === 0 ? <p style={styles.eventNone}>No events available</p> : null}
    {!loading &&
      items.slice(0, 3).map((ev) => (
        <div key={ev.id} style={styles.eventRow}>
          <strong>{ev.eventName}</strong>
          <div style={styles.eventMeta}>{ev.level} | {ev.gender}</div>
        </div>
      ))}
  </div>
);

const styles = {
  page: { padding: 20, background: '#eef0f4', minHeight: '100vh' },
  hero: {
    background: 'linear-gradient(130deg, #2b4377 0%, #4f6fb2 60%, #7d95d5 100%)',
    color: '#fff',
    borderRadius: 18,
    padding: 28,
    display: 'grid',
    gap: 16,
    gridTemplateColumns: '1.2fr 1fr',
  },
  heroTitle: { margin: 0, fontSize: '2.6rem', fontWeight: 700, lineHeight: 1.05 },
  heroSub: { margin: '6px 0 0', fontSize: '1.6rem', fontWeight: 500 },
  heroMeta: { margin: '16px 0 0', fontSize: '1.1rem', opacity: 0.95 },
  statsBar: {
    alignSelf: 'end',
    background: 'rgba(255,255,255,0.9)',
    color: '#1e293b',
    borderRadius: 14,
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: 8,
    padding: 12,
  },
  statItem: { borderRight: '1px solid #d4d8e0', padding: '4px 12px' },
  statValue: { fontWeight: 700, fontSize: 16 },
  statSub: { fontSize: 12, color: '#64748b' },
  eventsGrid: { marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  eventCard: { background: '#fff', border: '1px solid #d1d5db', borderRadius: 16, padding: 16 },
  eventHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  eventTitle: { margin: 0, fontSize: '1.9rem', color: '#1e293b' },
  count: { fontSize: 14, color: '#475569', background: '#eef2f7', borderRadius: 999, padding: '6px 10px' },
  eventNone: { margin: '10px 0', color: '#64748b', fontSize: 16 },
  eventRow: { borderTop: '1px solid #edf0f5', paddingTop: 8, marginTop: 8 },
  eventMeta: { color: '#64748b', fontSize: 13, marginTop: 2 },
  toggleRow: { marginTop: 14, marginBottom: 10 },
  regBtn: {
    padding: '12px 18px',
    borderRadius: 10,
    border: '1px solid #27416f',
    background: '#27416f',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  regGrid: { display: 'grid', gap: 16, gridTemplateColumns: '0.85fr 1.15fr' },
  card: { background: '#fff', border: '1px solid #d1d5db', borderRadius: 16, padding: 16 },
  cardTitle: { margin: 0, fontSize: '1.9rem', color: '#1e293b' },
  form: { marginTop: 12, display: 'grid', gap: 10 },
  input: { border: '1px solid #c8d0dd', borderRadius: 10, padding: '12px 14px', fontSize: 16 },
  sectionLine: { fontSize: 16, fontWeight: 700, color: '#1f2937', paddingTop: 6, borderBottom: '1px solid #e5e7eb' },
  inline2: { display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' },
  submitBtn: {
    marginTop: 6,
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid #27416f',
    background: 'linear-gradient(180deg, #35558f, #2d4b80)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  fee: { color: '#334155', fontSize: 14 },
  error: { color: '#b91c1c', fontSize: 14 },
  toolbar: { display: 'grid', gap: 8, gridTemplateColumns: '1fr 220px 180px', margin: '12px 0' },
  search: { border: '1px solid #c8d0dd', borderRadius: 10, padding: '10px 12px', fontSize: 15 },
  filter: { border: '1px solid #c8d0dd', borderRadius: 10, padding: '10px 12px', fontSize: 15 },
  tableWrap: { border: '1px solid #d7dce6', borderRadius: 12, overflowX: 'auto' },
  table: { width: '100%', minWidth: 780, borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '12px 10px',
    background: '#f2f5fa',
    borderBottom: '1px solid #dde3ee',
    color: '#25324b',
    fontSize: 14,
  },
  td: { padding: '10px', borderBottom: '1px solid #edf1f7', color: '#1f2937', fontSize: 14 },
  empty: { padding: '40px 16px', textAlign: 'center' },
  emptyIcon: { fontSize: 42, opacity: 0.6 },
  emptyTitle: { marginTop: 8, fontSize: 20, fontWeight: 700, color: '#1f2d48' },
  emptyText: { marginTop: 6, color: '#64748b', fontSize: 16 },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 999,
    border: '1px solid #334155',
    fontSize: 12,
    fontWeight: 600,
  },
  lockNote: { marginTop: 12, fontSize: 14, color: '#526079' },
};

export default AnnualSportsCelebration;
