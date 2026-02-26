import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import GamesSection from './sports-celebration/GamesSection';
import RegistrationSection from './sports-celebration/RegistrationSection';

const initialForm = { eventId: '', teamName: '', teamHeadName: '' };
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
  eventDate: item.eventDate || item.date || item.event_date || 'TBA',
  eventTime: item.eventTime || 'TBA',
  registrationStartDate: item.registrationStartDate || 'TBA',
  registrationEndDate: item.registrationEndDate || 'TBA',
  teamSizeMin: item.teamSizeMin ?? null,
  teamSizeMax: item.teamSizeMax ?? null,
});

const normalizeRegistration = (item) => {
  const members = Array.isArray(item.members)
    ? item.members
    : item.playerName
      ? [{ name: item.playerName || '', branch: item.branch || '', registerNumber: item.registerNumber || '', year: item.year || '1', sem: item.sem || '1' }]
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

const buildNotifications = (events) => {
  const now = new Date();
  const notes = [];
  events.forEach((ev) => {
    if (ev.registrationEndDate && ev.registrationEndDate !== 'TBA') {
      const regEnd = new Date(`${ev.registrationEndDate}T23:59:59`);
      if (now > regEnd) notes.push(`Registration closed: ${ev.eventName}`);
    }
    if (ev.eventDate && ev.eventDate !== 'TBA' && ev.eventTime && ev.eventTime !== 'TBA') {
      const start = new Date(`${ev.eventDate}T${ev.eventTime}:00`);
      if (now >= start) notes.push(`Event started: ${ev.eventName}`);
    }
  });
  return notes.slice(0, 10);
};

export default function AnnualSportsCelebration() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('games');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegs, setLoadingRegs] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [members, setMembers] = useState([blankMember()]);
  const [memberCount, setMemberCount] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');

  const indoor = useMemo(() => events.filter((e) => e.category === 'Indoor'), [events]);
  const outdoor = useMemo(() => events.filter((e) => e.category === 'Outdoor'), [events]);
  const selectedEvent = useMemo(() => events.find((e) => e.id === form.eventId) || null, [events, form.eventId]);
  const teamRule = useMemo(() => getTeamSizeRules(selectedEvent), [selectedEvent]);
  const scheduleRows = useMemo(
    () =>
      events
        .filter((e) => (e.eventDate && e.eventDate !== 'TBA') || (e.eventTime && e.eventTime !== 'TBA'))
        .sort((a, b) => String(a.eventDate || '').localeCompare(String(b.eventDate || ''))),
    [events]
  );
  const notifications = useMemo(() => buildNotifications(events), [events]);

  const filteredRegs = useMemo(() => {
    return registrations.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.eventName.toLowerCase().includes(q) ||
        item.teamName.toLowerCase().includes(q) ||
        item.teamHeadName.toLowerCase().includes(q) ||
        item.members.some((m) => m.name.toLowerCase().includes(q) || m.registerNumber.toLowerCase().includes(q) || m.branch.toLowerCase().includes(q));
      const matchYear = yearFilter === 'all' || item.year === yearFilter || item.members.some((m) => String(m.year || '') === yearFilter);
      return matchSearch && matchYear;
    });
  }, [registrations, search, yearFilter]);

  useEffect(() => {
    const run = async () => {
      setLoadingEvents(true);
      try {
        const res = await api.get('/events');
        const list = Array.isArray(res.data) ? res.data.map(normalizeEvent) : [];
        setEvents(list);
        setForm((p) => ({ ...p, eventId: p.eventId || list[0]?.id || '' }));
      } finally {
        setLoadingEvents(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (activeTab !== 'registration') return;
    const run = async () => {
      setLoadingRegs(true);
      try {
        const res = await api.get('/registrations');
        setRegistrations(Array.isArray(res.data) ? res.data.map(normalizeRegistration) : []);
      } finally {
        setLoadingRegs(false);
      }
    };
    run();
  }, [activeTab]);

  useEffect(() => {
    if (!selectedEvent) return;
    const nextCount = teamRule.isTeam ? teamRule.min : 1;
    setMemberCount(nextCount);
    setMembers(Array.from({ length: nextCount }, () => blankMember()));
    setForm((p) => ({ ...p, teamName: '' }));
  }, [selectedEvent, teamRule.isTeam, teamRule.min]);

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
        if (!row.name || !row.branch || !row.registerNumber || !row.year || !row.sem) throw new Error(`Row ${i + 1}: fill Name, Branch, Register Number, Year, Sem.`);
      }
      await api.post('/registrations', {
        eventId: form.eventId,
        teamName: teamRule.isTeam ? form.teamName.trim() : '',
        teamHeadName: form.teamHeadName.trim(),
        year: cleanedMembers[0]?.year || '',
        sem: cleanedMembers[0]?.sem || '',
        members: cleanedMembers,
      });
      setForm((p) => ({ ...p, teamName: '', teamHeadName: '' }));
      setMembers(Array.from({ length: memberCount }, () => blankMember()));
      const res = await api.get('/registrations');
      setRegistrations(Array.isArray(res.data) ? res.data.map(normalizeRegistration) : []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
      <header style={styles.card}>
        <h2 style={{ margin: 0 }}>Annual Sports Celebration (College Sports Meet)</h2>
        <p style={{ marginTop: 8, opacity: 0.85 }}>
          Events are managed from CreatorDashboard. Registration is <b>Free</b>.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button style={activeTab === 'games' ? styles.btnActive : styles.btn} onClick={() => setActiveTab('games')}>
            Games
          </button>
          <button style={activeTab === 'registration' ? styles.btnActive : styles.btn} onClick={() => setActiveTab('registration')}>
            Registration
          </button>
        </div>
      </header>

      {activeTab === 'games' ? (
        <GamesSection indoor={indoor} outdoor={outdoor} loadingEvents={loadingEvents} notifications={notifications} scheduleRows={scheduleRows} />
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
}

const styles = {
  card: { border: '1px solid #ddd', borderRadius: 14, padding: 14, background: '#fff' },
  btn: { padding: '10px 14px', borderRadius: 10, border: '1px solid #aaa', cursor: 'pointer', background: '#fff' },
  btnActive: { padding: '10px 14px', borderRadius: 10, border: '1px solid #111', cursor: 'pointer', background: '#fff', fontWeight: 700 },
};
