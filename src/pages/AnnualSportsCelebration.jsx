import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import EventsSection from './sports-celebration/EventsSection';
import RegistrationSection from './sports-celebration/RegistrationSection';

const initialForm = { eventId: '', teamName: '', teamHeadName: '' };
const blankMember = () => ({ name: '', branch: '', registerNumber: '', year: '1', sem: '1' });
const TEAM_EVENT_KEYWORDS = ['relay', 'cricket', 'kabaddi', 'volleyball', 'march past', 'marchpast'];

const deriveRegistrationStatus = (startDate, endDate) => {
  const safeStartDate = String(startDate || '').trim();
  const safeEndDate = String(endDate || '').trim();
  const today = new Date();
  const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  if (!safeStartDate || !safeEndDate) return 'Closed';
  if (safeStartDate > safeEndDate) return 'Closed';

  return currentDate >= safeStartDate && currentDate <= safeEndDate ? 'Open' : 'Closed';
};

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
  registrationStatus: item.registrationStatus || deriveRegistrationStatus(item.registrationStartDate, item.registrationEndDate),
  teamSizeMin: item.teamSizeMin ?? null,
  teamSizeMax: item.teamSizeMax ?? null,
});

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

export default function AnnualSportsCelebration() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('events');
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [form, setForm] = useState(initialForm);
  const [members, setMembers] = useState([blankMember()]);
  const [memberCount, setMemberCount] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [submittedSummary, setSubmittedSummary] = useState(null);

  const indoor = useMemo(() => events.filter((e) => e.category === 'Indoor'), [events]);
  const outdoor = useMemo(() => events.filter((e) => e.category === 'Outdoor'), [events]);
  const selectedEvent = useMemo(() => events.find((e) => e.id === form.eventId) || null, [events, form.eventId]);
  const teamRule = useMemo(() => getTeamSizeRules(selectedEvent), [selectedEvent]);
  const firstOpenEventId = useMemo(
    () => events.find((item) => item.registrationStatus !== 'Closed')?.id || '',
    [events]
  );

  useEffect(() => {
    const tab = String(searchParams.get('tab') || '').toLowerCase();
    if (tab === 'registration' || tab === 'register') {
      setActiveTab('registration');
      return;
    }
    if (tab === 'events' || tab === 'games') {
      setActiveTab('events');
    }
  }, [searchParams]);

  useEffect(() => {
    const run = async () => {
      setLoadingEvents(true);
      try {
        const res = await api.get('/events');
        const list = Array.isArray(res.data) ? res.data.map(normalizeEvent) : [];
        setEvents(list);
        setForm((p) => ({ ...p, eventId: p.eventId || list.find((item) => item.registrationStatus !== 'Closed')?.id || '' }));
      } finally {
        setLoadingEvents(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const nextCount = teamRule.isTeam ? teamRule.min : 1;
    setMemberCount(nextCount);
    setMembers(Array.from({ length: nextCount }, () => blankMember()));
    setForm((p) => ({ ...p, teamName: '' }));
    setReviewData(null);
    setConfirmChecked(false);
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
    setError('');
    setReviewData(null);
    setConfirmChecked(false);
    setSubmittedSummary(null);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateMember = (index, field, value) => {
    setError('');
    setReviewData(null);
    setConfirmChecked(false);
    setSubmittedSummary(null);
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

  const buildRegistrationDraft = () => {
    if (!form.eventId || !form.teamHeadName.trim()) {
      throw new Error('Select an open event and enter Team Head Name.');
    }

    if (!selectedEvent) {
      throw new Error('Selected event was not found.');
    }

    if (selectedEvent.registrationStatus === 'Closed') {
      throw new Error('This event is closed for registration.');
    }

    if (teamRule.isTeam && !form.teamName.trim()) {
      throw new Error('Team Name is required for team events.');
    }

    const cleanedMembers = members.map((member) => ({
      name: member.name.trim(),
      branch: member.branch.trim(),
      registerNumber: member.registerNumber.trim(),
      year: String(member.year || '').trim(),
      sem: String(member.sem || '').trim(),
    }));

    for (let i = 0; i < cleanedMembers.length; i += 1) {
      const row = cleanedMembers[i];
      if (!row.name || !row.branch || !row.registerNumber || !row.year || !row.sem) {
        throw new Error(`Row ${i + 1}: fill Name, Branch, Register Number, Year, Sem.`);
      }
    }

    return {
      payload: {
        eventId: form.eventId,
        teamName: teamRule.isTeam ? form.teamName.trim() : '',
        teamHeadName: form.teamHeadName.trim(),
        year: cleanedMembers[0]?.year || '',
        sem: cleanedMembers[0]?.sem || '',
        members: cleanedMembers,
      },
      summary: {
        eventName: selectedEvent.eventName,
        category: selectedEvent.category,
        eventType: teamRule.isTeam ? 'Team / Roster' : 'Individual',
        teamName: teamRule.isTeam ? form.teamName.trim() : '',
        teamHeadName: form.teamHeadName.trim(),
        members: cleanedMembers,
      },
    };
  };

  const submit = (event) => {
    event.preventDefault();
    setError('');
    setSubmittedSummary(null);

    try {
      const nextReview = buildRegistrationDraft();
      setReviewData(nextReview);
      setConfirmChecked(false);
    } catch (e) {
      setError(e.message || 'Registration review failed.');
    }
  };

  const confirmSubmit = async () => {
    if (!reviewData) return;

    setError('');
    setSubmitting(true);
    try {
      await api.post('/registrations', reviewData.payload);
      setSubmittedSummary(reviewData.summary);
      setReviewData(null);
      setConfirmChecked(false);
      setForm((p) => ({ ...p, eventId: firstOpenEventId || p.eventId || '', teamName: '', teamHeadName: '' }));
      setMemberCount(teamRule.isTeam ? teamRule.min : 1);
      setMembers(Array.from({ length: teamRule.isTeam ? teamRule.min : 1 }, () => blankMember()));
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelReview = () => {
    setReviewData(null);
    setConfirmChecked(false);
  };

  return (
    <div
      style={{
        padding: 16,
        maxWidth: 1100,
        margin: '0 auto',
        minHeight: '100vh',
        color: 'var(--app-text)',
        background: 'var(--app-bg)'
      }}
    >
      <header style={styles.card}>
        <h2 style={{ margin: 0 }}>Annual Sports Celebration (College Sports Meet)</h2>
        <p style={{ marginTop: 8, opacity: 0.85, color: 'var(--app-text-muted)' }}>
          Events are managed from CreatorDashboard. Registration is <b>Free</b>.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button style={activeTab === 'events' ? styles.btnActive : styles.btn} onClick={() => setActiveTab('events')}>
            Events
          </button>
          <button style={activeTab === 'registration' ? styles.btnActive : styles.btn} onClick={() => setActiveTab('registration')}>
            Registration
          </button>
        </div>
        <div style={styles.quickLinks}>
          <a href="/winners" style={styles.quickLink}>Winners</a>
          <a href="/results" style={styles.quickLink}>Results</a>
          <a href="/points-table" style={styles.quickLink}>Points Table</a>
        </div>
      </header>

      {activeTab === 'events' ? (
        <EventsSection indoor={indoor} outdoor={outdoor} loadingEvents={loadingEvents} />
      ) : (
        <RegistrationSection
          events={events}
          form={form}
          members={members}
          selectedEvent={selectedEvent}
          teamRule={teamRule}
          memberCount={memberCount}
          setMemberCount={(value) => {
            setError('');
            setReviewData(null);
            setConfirmChecked(false);
            setSubmittedSummary(null);
            setMemberCount(value);
          }}
          changeForm={changeForm}
          updateMember={updateMember}
          submit={submit}
          reviewData={reviewData}
          confirmChecked={confirmChecked}
          setConfirmChecked={setConfirmChecked}
          confirmSubmit={confirmSubmit}
          cancelReview={cancelReview}
          submittedSummary={submittedSummary}
          submitting={submitting}
          error={error}
        />
      )}
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid var(--app-border)',
    borderRadius: 14,
    padding: 14,
    background: 'var(--app-surface)',
    boxShadow: 'var(--app-shadow)'
  },
  btn: {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid var(--app-border)',
    cursor: 'pointer',
    background: 'var(--app-surface)',
    color: 'var(--app-text)'
  },
  btnActive: {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid var(--page-accent)',
    cursor: 'pointer',
    background: 'var(--page-accent-soft)',
    color: 'var(--page-accent)',
    fontWeight: 700
  },
  quickLinks: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 12
  },
  quickLink: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 13px',
    borderRadius: 10,
    border: '1px solid var(--app-border)',
    background: 'var(--app-surface-alt)',
    color: 'var(--app-text)',
    textDecoration: 'none',
    fontWeight: 600
  },
};
