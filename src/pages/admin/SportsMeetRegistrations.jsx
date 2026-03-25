import { useMemo, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import AdminLayout from './AdminLayout';
import api from '../../services/api';

const normalizeEvent = (item) => ({
  id: item?._id || item?.id || '',
  eventName: item?.eventName || item?.event_title || '',
});

const getRegistrationEventId = (registration) => {
  const rawEventId = registration?.eventId;
  if (rawEventId && typeof rawEventId === 'object') {
    return rawEventId._id || rawEventId.id || '';
  }
  return rawEventId || '';
};

const toRows = (registrations) => {
  const rows = [];
  registrations.forEach((reg) => {
    const members = Array.isArray(reg.members) ? reg.members : [];
    members.forEach((member, idx) => {
      rows.push({
        registrationId: reg._id || reg.id,
        eventId: getRegistrationEventId(reg),
        memberIndex: idx,
        eventName: reg.eventName || '',
        teamName: reg.teamName || '',
        teamHeadName: reg.teamHeadName || '',
        status: reg.status || 'Locked',
        name: member.name || '',
        branch: member.branch || '',
        registerNumber: member.registerNumber || '',
        year: member.year || '',
        sem: member.sem || '',
      });
    });
  });
  return rows;
};

const SportsMeetRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [editingKey, setEditingKey] = useState('');
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const rows = useMemo(() => toRows(registrations), [registrations]);
  const filteredRows = useMemo(() => {
    if (selectedEventId === 'all') return rows;
    return rows.filter((row) => row.eventId === selectedEventId);
  }, [rows, selectedEventId]);
  const selectedEventName = useMemo(() => {
    if (selectedEventId === 'all') return 'All Events';
    return events.find((event) => event.id === selectedEventId)?.eventName || 'Selected Event';
  }, [events, selectedEventId]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [registrationRes, eventRes] = await Promise.all([
        api.get('/registrations'),
        api.get('/events'),
      ]);
      setRegistrations(Array.isArray(registrationRes.data) ? registrationRes.data : []);
      setEvents(Array.isArray(eventRes.data) ? eventRes.data.map(normalizeEvent) : []);
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Unable to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const beginEdit = (row) => {
    setEditingKey(`${row.registrationId}-${row.memberIndex}`);
    setDraft({ ...row });
  };

  const cancelEdit = () => {
    setEditingKey('');
    setDraft(null);
  };

  const saveRow = async () => {
    if (!draft) return;
    try {
      setSaving(true);
      setError('');
      const reg = registrations.find((item) => (item._id || item.id) === draft.registrationId);
      if (!reg) throw new Error('Registration not found');
      const members = Array.isArray(reg.members) ? [...reg.members] : [];
      members[draft.memberIndex] = {
        ...members[draft.memberIndex],
        name: draft.name,
        branch: draft.branch,
        registerNumber: draft.registerNumber,
        year: draft.year,
        sem: draft.sem,
      };
      await api.put(`/registrations/${draft.registrationId}`, {
        eventId: draft.eventId,
        teamName: draft.teamName,
        teamHeadName: draft.teamHeadName,
        year: draft.year,
        sem: draft.sem,
        members,
      });
      await load();
      cancelEdit();
    } catch (saveError) {
      setError(saveError.response?.data?.error || saveError.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(12);
    doc.text(`Sports Meet Registrations - ${selectedEventName}`, 14, 12);
    let y = 22;
    doc.setFontSize(9);
    doc.text('Event', 10, y);
    doc.text('Team', 55, y);
    doc.text('Head', 95, y);
    doc.text('Student', 130, y);
    doc.text('Branch', 170, y);
    doc.text('Register No', 200, y);
    doc.text('Year', 240, y);
    doc.text('Sem', 255, y);
    doc.text('Status', 270, y);
    y += 6;
    filteredRows.forEach((row) => {
      if (y > 190) {
        doc.addPage('a4', 'landscape');
        y = 20;
      }
      doc.text(String(row.eventName || '-').slice(0, 24), 10, y);
      doc.text(String(row.teamName || 'Individual').slice(0, 20), 55, y);
      doc.text(String(row.teamHeadName || '-').slice(0, 18), 95, y);
      doc.text(String(row.name || '-').slice(0, 18), 130, y);
      doc.text(String(row.branch || '-').slice(0, 14), 170, y);
      doc.text(String(row.registerNumber || '-').slice(0, 14), 200, y);
      doc.text(String(row.year || '-'), 240, y);
      doc.text(String(row.sem || '-'), 255, y);
      doc.text(String(row.status || '-'), 270, y);
      y += 6;
    });
    const safeEventName = selectedEventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    doc.save(`sports-meet-registrations${safeEventName && safeEventName !== 'all-events' ? `-${safeEventName}` : ''}.pdf`);
  };

  return (
    <AdminLayout>
      <div style={{ padding: 20, width: '100%', minWidth: 0, minHeight: '100vh', background: '#f4f6f8' }}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={{ margin: 0 }}>Sports Meet Registration</h1>
            <div style={styles.subText}>{filteredRows.length} roster row{filteredRows.length === 1 ? '' : 's'} shown</div>
          </div>
          <div style={styles.headerActions}>
            <div style={styles.filterGroup}>
              <label htmlFor="sports-meet-select-event" style={styles.filterLabel}>
                Select Event
              </label>
              <select
                id="sports-meet-select-event"
                name="sportsMeetSelectEvent"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.eventName}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={exportPdf} style={styles.btn}>
              Download PDF
            </button>
          </div>
        </div>
        {error ? <div style={styles.error}>{error}</div> : null}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Team</th>
                <th style={styles.th}>Head</th>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Branch</th>
                <th style={styles.th}>Register No</th>
                <th style={styles.th}>Year</th>
                <th style={styles.th}>Sem</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td style={styles.td} colSpan={10}>
                    Loading registration data...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td style={styles.td} colSpan={10}>
                    No registration data
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const key = `${row.registrationId}-${row.memberIndex}`;
                  const isEditing = key === editingKey;
                  const data = isEditing ? draft : row;
                  return (
                    <tr key={key}>
                      <td style={styles.td}>
                        {isEditing ? (
                          <select
                            id={`sports-meet-event-${key}`}
                            name={`eventId-${key}`}
                            style={styles.inp}
                            value={data.eventId}
                            onChange={(e) => {
                              const nextEventId = e.target.value;
                              const nextEvent = events.find((item) => item.id === nextEventId);
                              setDraft((current) => ({
                                ...current,
                                eventId: nextEventId,
                                eventName: nextEvent?.eventName || current.eventName,
                              }));
                            }}
                          >
                            <option value="">Select Event</option>
                            {events.map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.eventName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          row.eventName
                        )}
                      </td>
                      <td style={styles.td}>{isEditing ? <input id={`sports-meet-team-name-${key}`} name={`teamName-${key}`} style={styles.inp} value={data.teamName} onChange={(e) => setDraft((d) => ({ ...d, teamName: e.target.value }))} /> : row.teamName || 'Individual'}</td>
                      <td style={styles.td}>{isEditing ? <input id={`sports-meet-team-head-${key}`} name={`teamHeadName-${key}`} style={styles.inp} value={data.teamHeadName} onChange={(e) => setDraft((d) => ({ ...d, teamHeadName: e.target.value }))} /> : row.teamHeadName}</td>
                      <td style={styles.td}>{isEditing ? <input id={`sports-meet-name-${key}`} name={`name-${key}`} style={styles.inp} value={data.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /> : row.name}</td>
                      <td style={styles.td}>{isEditing ? <input id={`sports-meet-branch-${key}`} name={`branch-${key}`} style={styles.inp} value={data.branch} onChange={(e) => setDraft((d) => ({ ...d, branch: e.target.value }))} /> : row.branch}</td>
                      <td style={styles.td}>{isEditing ? <input id={`sports-meet-register-${key}`} name={`registerNumber-${key}`} style={styles.inp} value={data.registerNumber} onChange={(e) => setDraft((d) => ({ ...d, registerNumber: e.target.value }))} /> : row.registerNumber}</td>
                      <td style={styles.td}>{isEditing ? <input id={`sports-meet-year-${key}`} name={`year-${key}`} style={styles.inp} value={data.year} onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))} /> : row.year}</td>
                      <td style={styles.td}>{isEditing ? <input id={`sports-meet-sem-${key}`} name={`sem-${key}`} style={styles.inp} value={data.sem} onChange={(e) => setDraft((d) => ({ ...d, sem: e.target.value }))} /> : row.sem}</td>
                      <td style={styles.td}>{row.status}</td>
                      <td style={styles.td}>
                        {isEditing ? (
                          <>
                            <button onClick={saveRow} disabled={saving} style={styles.smallBtn}>
                              Save
                            </button>
                            <button onClick={cancelEdit} style={styles.smallBtn}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button onClick={() => beginEdit(row)} style={styles.smallBtn}>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

const styles = {
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 },
  headerActions: { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' },
  filterGroup: { display: 'grid', gap: 6, minWidth: 220 },
  filterLabel: { fontSize: 13, fontWeight: 600, color: '#374151' },
  select: { border: '1px solid #d1d5db', background: '#fff', color: '#111827', borderRadius: 8, padding: '8px 10px', minWidth: 220 },
  subText: { marginTop: 6, color: '#6b7280', fontSize: 13 },
  tableWrap: { width: '100%', border: '1px solid #d1d5db', borderRadius: 10, overflow: 'auto', background: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 1200 },
  th: { textAlign: 'left', padding: 10, background: '#f3f4f6', borderBottom: '1px solid #d1d5db' },
  td: { padding: 10, borderBottom: '1px solid #e5e7eb' },
  inp: { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 8px' },
  btn: { border: '1px solid #111827', background: '#111827', color: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' },
  smallBtn: { marginRight: 6, border: '1px solid #d1d5db', background: '#fff', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' },
  error: { color: '#b91c1c', marginBottom: 10 },
};

export default SportsMeetRegistrations;
