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
  date: item.date || item.event_date || '',
  eventTime: item.eventTime || '',
  registrationStartDate: item.registrationStartDate || '',
  registrationEndDate: item.registrationEndDate || '',
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
  return { min, max, isTeam: true };
};

const AnnualSportsCelebration = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [showReg, setShowReg] = useState(false);
  const [activeSection, setActiveSection] = useState('games');
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

  const notifications = useMemo(() => buildNotifications(events), [events]);
  const scheduleRows = useMemo(
    () => events.filter((item) => item.date || item.eventTime).sort((a, b) => String(a.date).localeCompare(String(b.date))),
    [events]
  );

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

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoadingEvents(true);
        const res = await api.get('/events');
        const list = Array.isArray(res.data) ? res.data.map(normalizeEvent) : [];
        setEvents(list);
        setForm((prev) => ({ ...prev, eventId: prev.eventId || list[0]?.id || '' }));
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (!showReg && activeSection !== 'registration') return;
    const loadRegistrations = async () => {
      try {
        setLoadingRegs(true);
        const res = await api.get('/registrations');
        const list = Array.isArray(res.data) ? res.data.map(normalizeRegistration) : [];
        setRegistrations(list);
      } finally {
        setLoadingRegs(false);
      }
    };
    loadRegistrations();
  }, [showReg, activeSection]);

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
        if (!validSems.includes(String(current.sem || ''))) current.sem = validSems[0];
      }
      next[index] = current;
      return next;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (!form.eventId || !form.teamHeadName.trim()) throw new Error('Select event and enter Team Head Name.');
      if (teamRule.isTeam && !form.teamName.trim()) throw new Error('Team Name is required for team events.');

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
          throw new Error(`Row ${i + 1}: fill Name, Branch, Register Number, Year, Sem.`);
        }
      }

      const duplicateReg = cleanedMembers.map((m) => m.registerNumber.toLowerCase());
      if (new Set(duplicateReg).size !== duplicateReg.length) throw new Error('Duplicate Register Number inside roster.');

      await api.post('/registrations', {
        eventId: form.eventId,
        teamName: teamRule.isTeam ? form.teamName.trim() : '',
        teamHeadName: form.teamHeadName.trim(),
        year: cleanedMembers[0]?.year || '',
        sem: cleanedMembers[0]?.sem || '',
        members: cleanedMembers,
      });

      setForm((prev) => ({ ...prev, teamName: '', teamHeadName: '' }));
      setMembers(Array.from({ length: memberCount }, () => blankMember()));
      const res = await api.get('/registrations');
      setRegistrations(Array.isArray(res.data) ? res.data.map(normalizeRegistration) : []);
    } catch (submitError) {
      setError(submitError.response?.data?.error || submitError.message || 'Registration failed.');
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

      <div style={styles.sectionTabs}>
        <button style={activeSection === 'games' ? styles.tabActive : styles.tab} onClick={() => setActiveSection('games')}>
          Games
        </button>
        <button
          style={activeSection === 'registration' ? styles.tabActive : styles.tab}
          onClick={() => {
            setActiveSection('registration');
            setShowReg(true);
          }}
        >
          Registration
        </button>
      </div>

      {activeSection === 'games' ? (
        <GamesSection
          loadingEvents={loadingEvents}
          indoor={indoor}
          outdoor={outdoor}
          scheduleRows={scheduleRows}
          notifications={notifications}
        />
      ) : (
        <RegistrationSection
          events={events}
          form={form}
          members={members}
          teamRule={teamRule}
          memberCount={memberCount}
          setMemberCount={setMemberCount}
          changeForm={changeForm}
          updateMember={updateMember}
          submit={submit}
          submitting={submitting}
          error={error}
          filteredRegs={filteredRegs}
          loadingRegs={loadingRegs}
          search={search}
          setSearch={setSearch}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
        />
      )}
    </div>
  );
};

const GamesSection = ({ loadingEvents, indoor, outdoor, scheduleRows, notifications }) => (
  <section style={styles.gamesWrap}>
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Notifications</h3>
      {notifications.length === 0 ? <p style={styles.emptyText}>No notifications right now.</p> : null}
      {notifications.map((item, idx) => (
        <div key={`notif-${idx}`} style={styles.notifyItem}>
          {item}
        </div>
      ))}
    </div>

    <GameListTable title="Indoor Games" loading={loadingEvents} rows={indoor} />
    <GameListTable title="Outdoor Games" loading={loadingEvents} rows={outdoor} />

    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Event Schedule</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Event</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Time</th>
            <th style={styles.th}>Venue</th>
          </tr>
        </thead>
        <tbody>
          {scheduleRows.length === 0 ? (
            <tr>
              <td style={styles.td} colSpan={4}>
                No schedule available
              </td>
            </tr>
          ) : (
            scheduleRows.map((row) => (
              <tr key={`sch-${row.id}`}>
                <td style={styles.td}>{row.eventName}</td>
                <td style={styles.td}>{row.date || '-'}</td>
                <td style={styles.td}>{row.eventTime || '-'}</td>
                <td style={styles.td}>{row.venue || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </section>
);

const GameListTable = ({ title, rows, loading }) => (
  <div style={styles.card}>
    <h3 style={styles.cardTitle}>{title}</h3>
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Game Name</th>
          <th style={styles.th}>Registration Start</th>
          <th style={styles.th}>Registration Last Date</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td style={styles.td} colSpan={3}>
              Loading...
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td style={styles.td} colSpan={3}>
              No events available
            </td>
          </tr>
        ) : (
          rows.map((item) => (
            <tr key={item.id}>
              <td style={styles.td}>{item.eventName}</td>
              <td style={styles.td}>{item.registrationStartDate || '-'}</td>
              <td style={styles.td}>{item.registrationEndDate || '-'}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const RegistrationSection = ({
  events,
  form,
  members,
  teamRule,
  memberCount,
  setMemberCount,
  changeForm,
  updateMember,
  submit,
  submitting,
  error,
  filteredRegs,
  loadingRegs,
  search,
  setSearch,
  yearFilter,
  setYearFilter,
}) => (
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
          <select value={memberCount} onChange={(e) => setMemberCount(Number(e.target.value))} style={styles.input}>
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
                    <input style={styles.rowInput} value={member.name} onChange={(e) => updateMember(i, 'name', e.target.value)} />
                  </td>
                  <td style={styles.td}>
                    <input style={styles.rowInput} value={member.branch} onChange={(e) => updateMember(i, 'branch', e.target.value)} />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.rowInput}
                      value={member.registerNumber}
                      onChange={(e) => updateMember(i, 'registerNumber', e.target.value)}
                    />
                  </td>
                  <td style={styles.td}>
                    <select style={styles.rowInput} value={member.year} onChange={(e) => updateMember(i, 'year', e.target.value)}>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <select style={styles.rowInput} value={member.sem} onChange={(e) => updateMember(i, 'sem', e.target.value)}>
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
        <input value={search} onChange={(e) => setSearch(e.target.value)} style={styles.search} placeholder="Search event / team / player..." />
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
                <td style={styles.td} colSpan={6}>
                  No registrations yet
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
                    {Array.from(new Set(row.members.map((m) => `Y${m.year}-S${m.sem}`))).join(', ') || `${row.year}/${row.sem}`}
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
    </div>
  </section>
);

const buildNotifications = (events) => {
  const today = new Date();
  const dayStr = today.toISOString().slice(0, 10);
  const notices = [];
  events.forEach((event) => {
    if (event.date && event.date === dayStr) {
      notices.push(`Event starts today: ${event.eventName}${event.eventTime ? ` at ${event.eventTime}` : ''}.`);
    }
    if (event.registrationEndDate && event.registrationEndDate < dayStr) {
      notices.push(`Registration closed: ${event.eventName} (last date was ${event.registrationEndDate}).`);
    }
  });
  return notices;
};

const Stat = ({ title, value, sub }) => (
  <div style={styles.statItem}>
    <div style={styles.statValue}>
      {title}: {value}
    </div>
    <div style={styles.statSub}>{sub || title}</div>
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
  sectionTabs: { display: 'flex', gap: 10, marginTop: 14, marginBottom: 12 },
  tab: { padding: '10px 14px', borderRadius: 10, border: '1px solid #b6c0d2', background: '#fff', cursor: 'pointer' },
  tabActive: {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #27416f',
    background: '#27416f',
    color: '#fff',
    cursor: 'pointer',
  },
  gamesWrap: { display: 'grid', gap: 14, gridTemplateColumns: '1fr' },
  regGrid: { display: 'grid', gap: 16, gridTemplateColumns: '0.95fr 1.05fr' },
  card: { background: '#fff', border: '1px solid #d1d5db', borderRadius: 16, padding: 16 },
  cardTitle: { margin: 0, fontSize: '1.4rem', color: '#1e293b' },
  notifyItem: { marginTop: 8, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1f2937' },
  emptyText: { color: '#64748b', marginTop: 8 },
  form: { marginTop: 12, display: 'grid', gap: 10 },
  input: { border: '1px solid #c8d0dd', borderRadius: 10, padding: '12px 14px', fontSize: 16 },
  rowInput: { width: '100%', border: '1px solid #c8d0dd', borderRadius: 8, padding: '8px 10px', fontSize: 14 },
  infoRow: { color: '#1f2937', fontSize: 14, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px' },
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
  table: { width: '100%', minWidth: 780, borderCollapse: 'collapse', marginTop: 10 },
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
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: 999, border: '1px solid #334155', fontSize: 12, fontWeight: 600 },
};

export default AnnualSportsCelebration;
