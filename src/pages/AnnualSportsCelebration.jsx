import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const initialForm = {
  eventId: '',
  teamName: '',
  teamHeadName: '',
};

const blankMember = () => ({ name: '', branch: '', registerNumber: '', year: '1', sem: '1' });

const TEAM_EVENT_KEYWORDS = ['relay', 'cricket', 'kabaddi', 'volleyball', 'march past', 'marchpast'];

const getSemOptionsForYear = (year) => {
  if (year === '1') return ['1', '2'];
  if (year === '2') return ['3', '4'];
  if (year === '3') return ['5', '6'];
  return ['1', '2'];
};

const normalizeEvent = (item) => ({
  id: item._id || item.id,
  eventName: item.eventName || item.event_title || '',
  category: item.category || '',
  sportType: item.sportType || 'Athletics',
  eventType: item.eventType || 'Individual',
  level: item.level || item.event_level || 'Open',
  gender: item.gender || 'Mixed',
  venue: item.venue || 'TBA',
  date: item.date || item.event_date || 'TBA',
  teamSizeMin: item.teamSizeMin ?? null,
  teamSizeMax: item.teamSizeMax ?? null,
  registrationStatus: item.registrationStatus || item.status || 'Open',
});

const normalizeRegistration = (item) => {
  const members = Array.isArray(item.members)
    ? item.members
    : item.playerName
      ? [
          {
            name: item.playerName || '',
            branch: item.branch || '',
            registerNumber: item.registerNumber || '',
            year: item.year || '1',
            sem: item.sem || '1',
          },
        ]
      : [];

  return {
    id: item._id || item.id,
    eventName: item.eventName || '',
    teamName: item.teamName || '',
    teamHeadName: item.teamHeadName || '',
    year: item.year || '',
    sem: item.sem || '',
    status: item.status || 'Locked',
    members,
  };
};

const inferTeamEvent = (event) => {
  const byType = (event.eventType || '').toLowerCase() === 'team';
  if (byType) return true;
  const name = (event.eventName || '').toLowerCase();
  return TEAM_EVENT_KEYWORDS.some((keyword) => name.includes(keyword));
};

const getTeamSizeRules = (event) => {
  if (!event) return { min: 1, max: 1, isTeam: false };
  const isTeam = inferTeamEvent(event);
  if (!isTeam) return { min: 1, max: 1, isTeam: false };

  let min = Number(event.teamSizeMin);
  let max = Number(event.teamSizeMax);
  if (!Number.isFinite(min) || min < 2) min = 2;
  if (!Number.isFinite(max) || max < min) max = min;
  if (max > 30) max = 30;

  const name = (event.eventName || '').toLowerCase();
  if (!event.teamSizeMin && !event.teamSizeMax) {
    if (name.includes('4x100') || name.includes('4 x 100') || name.includes('4x400') || name.includes('4 x 400')) {
      min = 4;
      max = 4;
    } else if (name.includes('cricket')) {
      min = 11;
      max = 16;
    } else if (name.includes('march past') || name.includes('marchpast')) {
      min = 10;
      max = 30;
    }
  }

  return { min, max, isTeam: true };
};

const AnnualSportsCelebration = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [showReg, setShowReg] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [members, setMembers] = useState([blankMember()]);
  const [memberCount, setMemberCount] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');

  const selectedEvent = useMemo(() => events.find((item) => item.id === form.eventId) || null, [events, form.eventId]);
  const teamRule = useMemo(() => getTeamSizeRules(selectedEvent), [selectedEvent]);

  const indoor = useMemo(() => events.filter((item) => item.category === 'Indoor'), [events]);
  const outdoor = useMemo(() => events.filter((item) => item.category === 'Outdoor'), [events]);

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

  useEffect(() => {
    if (!selectedEvent) return;
    const nextCount = teamRule.isTeam ? teamRule.min : 1;
    setMemberCount(nextCount);
    setMembers(Array.from({ length: nextCount }, () => blankMember()));
    setForm((prev) => ({ ...prev, teamName: '' }));
  }, [form.eventId, selectedEvent, teamRule.isTeam, teamRule.min]);

  useEffect(() => {
    setMembers((prev) => {
      const next = [...prev];
      while (next.length < memberCount) next.push(blankMember());
      next.length = memberCount;
      return next;
    });
  }, [memberCount]);

  const filteredRegs = useMemo(() => {
    return registrations.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.eventName.toLowerCase().includes(q) ||
        item.teamName.toLowerCase().includes(q) ||
        item.teamHeadName.toLowerCase().includes(q) ||
        item.members.some(
          (m) => m.name.toLowerCase().includes(q) || m.registerNumber.toLowerCase().includes(q) || m.branch.toLowerCase().includes(q)
        );
      const matchYear =
        yearFilter === 'all' ||
        item.year === yearFilter ||
        item.members.some((member) => String(member.year || '') === yearFilter);
      return matchSearch && matchYear;
    });
  }, [registrations, search, yearFilter]);

  const changeForm = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateMember = (index, field, value) => {
    setMembers((prev) => {
      const next = [...prev];
      const current = { ...next[index], [field]: value };
      if (field === 'year') {
        const validSems = getSemOptionsForYear(value);
        if (!validSems.includes(String(current.sem || ''))) {
          current.sem = validSems[0];
        }
      }
      next[index] = current;
      return next;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    if (!form.eventId || !form.teamHeadName.trim()) {
      setError('Select event and enter Team Head Name.');
      setSubmitting(false);
      return;
    }

    if (teamRule.isTeam && !form.teamName.trim()) {
      setError('Team Name is required for team events.');
      setSubmitting(false);
      return;
    }

    const cleanedMembers = members.map((m) => ({
      name: m.name.trim(),
      branch: m.branch.trim(),
      registerNumber: m.registerNumber.trim(),
      year: String(m.year || '').trim(),
      sem: String(m.sem || '').trim(),
    }));

    for (let i = 0; i < cleanedMembers.length; i += 1) {
      const row = cleanedMembers[i];
      if (!row.name || !row.branch || !row.registerNumber || !row.year || !row.sem) {
        setError(`Row ${i + 1}: fill Name, Branch, Register Number, Year, Sem.`);
        setSubmitting(false);
        return;
      }
    }

    const duplicateReg = cleanedMembers.map((m) => m.registerNumber.toLowerCase());
    if (new Set(duplicateReg).size !== duplicateReg.length) {
      setError('Duplicate Register Number inside roster.');
      setSubmitting(false);
      return;
    }

    const payload = {
      eventId: form.eventId,
      teamName: teamRule.isTeam ? form.teamName.trim() : '',
      teamHeadName: form.teamHeadName.trim(),
      year: cleanedMembers[0]?.year || '',
      sem: cleanedMembers[0]?.sem || '',
      members: cleanedMembers,
    };

    try {
      await api.post('/registrations', payload);
      setForm((prev) => ({ ...prev, teamName: '', teamHeadName: '' }));
      setMembers(Array.from({ length: memberCount }, () => blankMember()));
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
            <h3 style={styles.cardTitle}>Unified Registration</h3>
            <form onSubmit={submit} style={styles.form}>
              <select name="eventId" value={form.eventId} onChange={changeForm} style={styles.input} required>
                {events.length === 0 ? <option value="">Select Event...</option> : null}
                {events.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.category} - {item.eventName}
                  </option>
                ))}
              </select>

              <div style={styles.infoRow}>
                Event Type: <strong>{teamRule.isTeam ? 'Team / Roster' : 'Individual'}</strong>
              </div>

              {teamRule.isTeam ? (
                <input
                  style={styles.input}
                  name="teamName"
                  value={form.teamName}
                  onChange={changeForm}
                  placeholder="Team Name (ex: CSE Team A)"
                  required
                />
              ) : null}

              <input
                style={styles.input}
                name="teamHeadName"
                value={form.teamHeadName}
                onChange={changeForm}
                placeholder={teamRule.isTeam ? 'Team Head Name' : 'Player Name'}
                required
              />

              {teamRule.isTeam ? (
                <select
                  value={memberCount}
                  onChange={(e) => setMemberCount(Number(e.target.value))}
                  style={styles.input}
                >
                  {Array.from({ length: teamRule.max - teamRule.min + 1 }, (_, i) => teamRule.min + i).map((n) => (
                    <option key={n} value={n}>
                      {n} Players
                    </option>
                  ))}
                </select>
              ) : null}

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>#</th>
                      <th style={styles.th}>Player Name</th>
                      <th style={styles.th}>Branch</th>
                      <th style={styles.th}>Register Number</th>
                      <th style={styles.th}>Year</th>
                      <th style={styles.th}>Sem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, i) => (
                      <tr key={`member-${i}`}>
                        <td style={styles.td}>{i + 1}</td>
                        <td style={styles.td}>
                          <input
                            style={styles.rowInput}
                            value={member.name}
                            onChange={(e) => updateMember(i, 'name', e.target.value)}
                            placeholder="Player name"
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            style={styles.rowInput}
                            value={member.branch}
                            onChange={(e) => updateMember(i, 'branch', e.target.value)}
                            placeholder="Branch"
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            style={styles.rowInput}
                            value={member.registerNumber}
                            onChange={(e) => updateMember(i, 'registerNumber', e.target.value)}
                            placeholder="Register number"
                          />
                        </td>
                        <td style={styles.td}>
                          <select
                            style={styles.rowInput}
                            value={member.year}
                            onChange={(e) => updateMember(i, 'year', e.target.value)}
                          >
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                          </select>
                        </td>
                        <td style={styles.td}>
                          <select
                            style={styles.rowInput}
                            value={member.sem}
                            onChange={(e) => updateMember(i, 'sem', e.target.value)}
                          >
                            {getSemOptionsForYear(String(member.year || '1')).map((n) => (
                              <option key={n} value={n}>
                                Sem {n}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button type="submit" disabled={submitting} style={styles.submitBtn}>
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
              <div style={styles.fee}>
                Fee: Free | Status after submit: <strong>Locked</strong>
              </div>
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
                placeholder="Search event / team / player..."
              />
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={styles.filter}>
                <option value="all">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
              </select>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Event</th>
                    <th style={styles.th}>Head / Team</th>
                    <th style={styles.th}>Roster Size</th>
                    <th style={styles.th}>Year/Sem</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRegs ? (
                    <tr>
                      <td style={styles.td} colSpan={6}>
                        Loading registrations...
                      </td>
                    </tr>
                  ) : filteredRegs.length === 0 ? (
                    <tr>
                      <td style={styles.empty} colSpan={6}>
                        <div style={styles.emptyTitle}>No registrations submitted yet.</div>
                        <div style={styles.emptyText}>Once submitted, records appear here.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredRegs.map((row, idx) => (
                      <tr key={row.id}>
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={styles.td}>{row.eventName}</td>
                        <td style={styles.td}>
                          <div>{row.teamHeadName || '-'}</div>
                          <div style={styles.miniText}>{row.teamName || 'Individual'}</div>
                        </td>
                        <td style={styles.td}>{row.members.length}</td>
                        <td style={styles.td}>
                          {Array.from(
                            new Set(
                              row.members
                                .map((member) =>
                                  member.year && member.sem ? `Y${member.year}-S${member.sem}` : ''
                                )
                                .filter(Boolean)
                            )
                          ).join(', ') || `${row.year} / ${row.sem}`}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.badge}>{row.status}</span>
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
    <div style={styles.statValue}>
      {title}: {value}
    </div>
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
          <div style={styles.eventMeta}>
            {ev.level} | {ev.gender} | {inferTeamEvent(ev) ? 'Team' : 'Individual'}
          </div>
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
  regGrid: { display: 'grid', gap: 16, gridTemplateColumns: '0.95fr 1.05fr' },
  card: { background: '#fff', border: '1px solid #d1d5db', borderRadius: 16, padding: 16 },
  cardTitle: { margin: 0, fontSize: '1.8rem', color: '#1e293b' },
  form: { marginTop: 12, display: 'grid', gap: 10 },
  infoRow: { color: '#1f2937', fontSize: 14, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px' },
  input: { border: '1px solid #c8d0dd', borderRadius: 10, padding: '12px 14px', fontSize: 16 },
  rowInput: { width: '100%', border: '1px solid #c8d0dd', borderRadius: 8, padding: '8px 10px', fontSize: 14 },
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
  toolbar: { display: 'grid', gap: 8, gridTemplateColumns: '1fr 180px', margin: '12px 0' },
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
  td: { padding: '10px', borderBottom: '1px solid #edf1f7', color: '#1f2937', fontSize: 14, verticalAlign: 'top' },
  miniText: { marginTop: 4, color: '#64748b', fontSize: 12 },
  empty: { padding: '28px 16px', textAlign: 'center' },
  emptyTitle: { marginTop: 8, fontSize: 18, fontWeight: 700, color: '#1f2d48' },
  emptyText: { marginTop: 6, color: '#64748b', fontSize: 14 },
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
