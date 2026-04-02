import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import AdminLayout from './AdminLayout';
import api from '../../services/api';

const PDF_COLUMNS = [
  { key: 'name', label: 'Student', width: 62, align: 'left' },
  { key: 'branch', label: 'Branch', width: 91, align: 'left' },
  { key: 'registerNumber', label: 'Register No', width: 50, align: 'center' },
  { key: 'year', label: 'Year', width: 20, align: 'center' },
  { key: 'sem', label: 'Sem', width: 18, align: 'center' },
  { key: 'signature', label: 'Signature', width: 32, align: 'center' },
];

const normalizeEvent = (item) => ({
  id: String(item?._id || item?.id || ''),
  eventName: item?.eventName || item?.event_title || '',
});

const getRegistrationId = (registration) => String(registration?._id || registration?.id || '');

const getRegistrationEventId = (registration) => {
  const rawEventId = registration?.eventId;
  if (rawEventId && typeof rawEventId === 'object') {
    return String(rawEventId._id || rawEventId.id || '');
  }
  return String(rawEventId || '');
};

const normalizeMember = (member, fallbackYear = '', fallbackSem = '') => ({
  name: String(member?.name || '').trim(),
  branch: String(member?.branch || '').trim(),
  registerNumber: String(member?.registerNumber || '').trim(),
  year: String(member?.year || fallbackYear || '').trim(),
  sem: String(member?.sem || fallbackSem || '').trim(),
});

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const matchesQuery = (values, query) =>
  values.some((value) => String(value || '').toLowerCase().includes(query));

const getDisplayTeamName = (registration) => {
  const teamName = String(registration?.teamName || '').trim();
  if (teamName) return teamName;
  const firstMember = registration?.members?.[0]?.name;
  return firstMember ? `Individual - ${firstMember}` : 'Individual';
};

const getTeamFilterLabel = (registration, includeEventName = false) => {
  const teamLabel = getDisplayTeamName(registration);
  if (!includeEventName) return teamLabel;
  const eventName = String(registration?.eventName || '').trim();
  return eventName ? `${teamLabel} (${eventName})` : teamLabel;
};

const truncatePdfText = (doc, value, maxWidth) => {
  const safeText = String(value || '-');
  if (doc.getTextWidth(safeText) <= maxWidth) return safeText;

  const ellipsis = '...';
  let next = safeText;
  while (next.length > 0 && doc.getTextWidth(`${next}${ellipsis}`) > maxWidth) {
    next = next.slice(0, -1);
  }
  return `${next}${ellipsis}`;
};

const drawPdfSummaryField = (doc, label, value, x, y, maxWidth) => {
  doc.setFont('helvetica', 'bold');
  doc.text(label, x, y);
  const labelWidth = doc.getTextWidth(label) + 2;
  doc.setFont('helvetica', 'normal');
  doc.text(truncatePdfText(doc, value || '-', maxWidth - labelWidth), x + labelWidth, y);
};

const buildPdfFileName = (registrations) => {
  if (registrations.length === 1) {
    const registration = registrations[0];
    const eventSlug = slugify(registration.eventName) || 'event';
    const teamSlug = slugify(
      registration.teamName ||
        registration.visibleMembers?.[0]?.name ||
        registration.members?.[0]?.name ||
        'individual'
    );
    return `annual-sports-celebration-player-registration-form-${eventSlug}-${teamSlug}.pdf`;
  }
  return 'annual-sports-celebration-player-registration-form.pdf';
};

const drawRegistrationSheetPage = (doc, registration, members, renderedDate, renderedTime, showSignatures) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tableX = 12;
  const tableY = 62;
  const headerHeight = 10;
  const rowHeight = 9;
  const tableWidth = pageWidth - 24;
  const tableHeight = headerHeight + members.length * rowHeight;

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setDrawColor(221, 225, 230);
  doc.setLineWidth(0.35);
  doc.roundedRect(6, 6, pageWidth - 12, pageHeight - 12, 4, 4, 'S');

  doc.setTextColor(25, 31, 45);
  doc.setFont('times', 'bold');
  doc.setFontSize(21);
  doc.text('Annual Sports Celebration', pageWidth / 2, 18, { align: 'center' });

  doc.setDrawColor(225, 228, 232);
  doc.line(12, 24, pageWidth - 12, 24);

  doc.setFontSize(18);
  doc.text('Player Registration Form', pageWidth / 2, 37, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Date:', pageWidth - 52, 30);
  doc.text('Time:', pageWidth - 52, 40);

  doc.setFont('helvetica', 'normal');
  doc.text(renderedDate, pageWidth - 38, 30);
  doc.text(renderedTime, pageWidth - 38, 40);

  doc.setFillColor(247, 248, 250);
  doc.setDrawColor(224, 226, 230);
  doc.roundedRect(12, 48, pageWidth - 24, 12, 3, 3, 'FD');

  doc.setFontSize(9.5);
  drawPdfSummaryField(doc, 'Event:', registration.eventName || '-', 16, 55.5, 62);
  drawPdfSummaryField(doc, 'Team:', registration.teamName || 'Individual', 82, 55.5, 78);
  drawPdfSummaryField(doc, 'Head:', registration.teamHeadName || '-', 173, 55.5, 102);

  doc.setFillColor(245, 246, 248);
  doc.rect(tableX, tableY, pageWidth - 24, headerHeight, 'F');
  doc.roundedRect(tableX, tableY, tableWidth, tableHeight, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);

  let currentX = tableX;
  PDF_COLUMNS.forEach((column) => {
    const textX = column.align === 'center' ? currentX + column.width / 2 : currentX + 3;
    doc.text(column.label, textX, tableY + 6.5, column.align === 'center' ? { align: 'center' } : undefined);
    currentX += column.width;
    if (currentX < tableX + tableWidth) {
      doc.line(currentX, tableY, currentX, tableY + tableHeight);
    }
  });

  doc.line(tableX, tableY + headerHeight, tableX + tableWidth, tableY + headerHeight);

  members.forEach((member, index) => {
    const rowY = tableY + headerHeight + index * rowHeight;
    const textY = rowY + 5.9;
    let cellX = tableX;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.4);

    PDF_COLUMNS.forEach((column) => {
      const rawValue = column.key === 'signature' ? '' : member[column.key];
      const safeText = truncatePdfText(doc, rawValue || '', column.width - 6);
      const textX = column.align === 'center' ? cellX + column.width / 2 : cellX + 3;
      doc.text(safeText, textX, textY, column.align === 'center' ? { align: 'center' } : undefined);
      cellX += column.width;
    });

    doc.line(tableX, rowY + rowHeight, tableX + tableWidth, rowY + rowHeight);
  });

  if (showSignatures) {
    const signatureLineY = Math.max(tableY + tableHeight + 4, pageHeight - 24);

    doc.setDrawColor(31, 41, 55);
    doc.line(18, signatureLineY, 120, signatureLineY);
    doc.line(pageWidth - 120, signatureLineY, pageWidth - 18, signatureLineY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.8);
    doc.text('Student Welfare Officer', 69, signatureLineY + 6, { align: 'center' });
    doc.text('Sports Officer', pageWidth - 69, signatureLineY + 6, { align: 'center' });
  }
};

const exportRegistrationSheets = (registrations) => {
  if (!registrations.length) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const renderedAt = new Date();
  const renderedDate = renderedAt.toLocaleDateString('en-GB');
  const renderedTime = renderedAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  let firstPage = true;

  registrations.forEach((registration) => {
    const members = (registration.visibleMembers || registration.members || []).map((member) => ({
      ...member,
    }));

    let startIndex = 0;
    while (startIndex < members.length) {
      if (!firstPage) {
        doc.addPage('a4', 'landscape');
      }

      const remaining = members.length - startIndex;
      const showSignatures = remaining <= 14;
      const rowsOnPage = showSignatures
        ? remaining
        : Math.min(15, Math.max(1, remaining - 14));
      const pageMembers = members.slice(startIndex, startIndex + rowsOnPage);

      drawRegistrationSheetPage(doc, registration, pageMembers, renderedDate, renderedTime, showSignatures);

      startIndex += rowsOnPage;
      firstPage = false;
    }
  });

  doc.save(buildPdfFileName(registrations));
};

const SportsMeetRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [selectedTeamId, setSelectedTeamId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingKey, setEditingKey] = useState('');
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingKey, setDeletingKey] = useState('');
  const [deletingRegistrationId, setDeletingRegistrationId] = useState('');

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

  const eventMap = useMemo(
    () => new Map(events.map((event) => [event.id, event.eventName])),
    [events]
  );

  const normalizedRegistrations = useMemo(
    () =>
      registrations.map((registration) => {
        const id = getRegistrationId(registration);
        const eventId = getRegistrationEventId(registration);
        const members = Array.isArray(registration.members)
          ? registration.members.map((member) =>
              normalizeMember(member, registration.year, registration.sem)
            )
          : [];

        return {
          id,
          eventId,
          eventName: String(registration.eventName || eventMap.get(eventId) || '').trim(),
          teamName: String(registration.teamName || '').trim(),
          teamHeadName: String(registration.teamHeadName || '').trim(),
          year: String(registration.year || '').trim(),
          sem: String(registration.sem || '').trim(),
          members,
        };
      }),
    [registrations, eventMap]
  );

  const teamOptions = useMemo(() => {
    const baseRegistrations = normalizedRegistrations.filter(
      (registration) => selectedEventId === 'all' || registration.eventId === selectedEventId
    );

    return baseRegistrations.map((registration) => ({
      value: registration.id,
      label: getTeamFilterLabel(registration, selectedEventId === 'all'),
    }));
  }, [normalizedRegistrations, selectedEventId]);

  useEffect(() => {
    if (selectedTeamId !== 'all' && !teamOptions.some((option) => option.value === selectedTeamId)) {
      setSelectedTeamId('all');
    }
  }, [selectedTeamId, teamOptions]);

  const visibleRegistrations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return normalizedRegistrations
      .filter((registration) => selectedEventId === 'all' || registration.eventId === selectedEventId)
      .filter((registration) => selectedTeamId === 'all' || registration.id === selectedTeamId)
      .map((registration) => {
        const indexedMembers = registration.members.map((member, memberIndex) => ({
          ...member,
          memberIndex,
        }));

        if (!query) {
          return { ...registration, visibleMembers: indexedMembers };
        }

        const summaryMatch = matchesQuery(
          [registration.eventName, registration.teamName, registration.teamHeadName],
          query
        );

        const matchingMembers = indexedMembers.filter((member) =>
          summaryMatch
            ? true
            : matchesQuery(
                [member.name, member.branch, member.registerNumber, member.year, member.sem],
                query
              )
        );

        if (!summaryMatch && matchingMembers.length === 0) {
          return null;
        }

        return {
          ...registration,
          visibleMembers: summaryMatch ? indexedMembers : matchingMembers,
        };
      })
      .filter(Boolean);
  }, [normalizedRegistrations, searchTerm, selectedEventId, selectedTeamId]);

  const visibleRowCount = useMemo(
    () =>
      visibleRegistrations.reduce(
        (total, registration) => total + registration.visibleMembers.length,
        0
      ),
    [visibleRegistrations]
  );

  const beginEdit = (registration, member) => {
    setEditingKey(`${registration.id}-${member.memberIndex}`);
    setDraft({
      registrationId: registration.id,
      memberIndex: member.memberIndex,
      eventId: registration.eventId,
      eventName: registration.eventName,
      teamName: registration.teamName,
      teamHeadName: registration.teamHeadName,
      name: member.name,
      branch: member.branch,
      registerNumber: member.registerNumber,
      year: member.year,
      sem: member.sem,
    });
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

      const registration = registrations.find(
        (item) => getRegistrationId(item) === String(draft.registrationId)
      );
      if (!registration) throw new Error('Registration not found');

      const members = Array.isArray(registration.members)
        ? registration.members.map((member) =>
            normalizeMember(member, registration.year, registration.sem)
          )
        : [];

      members[draft.memberIndex] = {
        ...members[draft.memberIndex],
        name: String(draft.name || '').trim(),
        branch: String(draft.branch || '').trim(),
        registerNumber: String(draft.registerNumber || '').trim(),
        year: String(draft.year || '').trim(),
        sem: String(draft.sem || '').trim(),
      };

      await api.put(`/registrations/${draft.registrationId}`, {
        eventId: draft.eventId,
        teamName: draft.teamName,
        teamHeadName: draft.teamHeadName,
        year: members[0]?.year || draft.year,
        sem: members[0]?.sem || draft.sem,
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

  const deleteMember = async (registration, member) => {
    const key = `${registration.id}-${member.memberIndex}`;
    const confirmed = window.confirm(
      `Delete ${member.name || 'this player'} from ${registration.eventName || 'the event'}?`
    );

    if (!confirmed) return;

    try {
      setDeletingKey(key);
      setError('');

      const source = registrations.find((item) => getRegistrationId(item) === registration.id);
      if (!source) throw new Error('Registration not found');

      const nextMembers = (Array.isArray(source.members) ? source.members : [])
        .map((entry) => normalizeMember(entry, source.year, source.sem))
        .filter((_, index) => index !== member.memberIndex);

      if (editingKey === key || draft?.registrationId === registration.id) {
        cancelEdit();
      }

      if (nextMembers.length === 0) {
        await api.delete(`/registrations/${registration.id}`);
      } else {
        await api.put(`/registrations/${registration.id}`, {
          eventId: registration.eventId,
          teamName: registration.teamName,
          teamHeadName: registration.teamHeadName,
          year: nextMembers[0]?.year || registration.year,
          sem: nextMembers[0]?.sem || registration.sem,
          members: nextMembers,
        });
      }

      await load();
    } catch (deleteError) {
      const apiError = deleteError.response?.data?.error || deleteError.message || 'Delete failed';
      if (/^Minimum \d+ players required\./i.test(apiError)) {
        setError(`${apiError} Use Delete Team to remove the full team registration.`);
      } else {
        setError(apiError);
      }
    } finally {
      setDeletingKey('');
    }
  };

  const deleteRegistration = async (registration) => {
    const label = registration.teamName || registration.eventName || 'this registration';
    const confirmed = window.confirm(`Delete full team registration for ${label}?`);

    if (!confirmed) return;

    try {
      setDeletingRegistrationId(registration.id);
      setError('');

      if (draft?.registrationId === registration.id) {
        cancelEdit();
      }

      await api.delete(`/registrations/${registration.id}`);
      await load();
    } catch (deleteError) {
      setError(deleteError.response?.data?.error || deleteError.message || 'Delete team failed');
    } finally {
      setDeletingRegistrationId('');
    }
  };

  const exportPdf = () => {
    exportRegistrationSheets(visibleRegistrations);
  };

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={{ margin: 0 }}>Sports Meet Registration</h1>
            <div style={styles.subText}>
              {visibleRegistrations.length} registration
              {visibleRegistrations.length === 1 ? '' : 's'} shown, {visibleRowCount} player
              {visibleRowCount === 1 ? '' : 's'}
            </div>
          </div>

          <div style={styles.headerActions}>
            <div style={styles.filterGroup}>
              <label htmlFor="sports-meet-search" style={styles.filterLabel}>
                Search
              </label>
              <input
                id="sports-meet-search"
                name="sportsMeetSearch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student, branch, register number..."
                style={styles.searchInput}
              />
            </div>

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

            <div style={styles.filterGroup}>
              <label htmlFor="sports-meet-select-team" style={styles.filterLabel}>
                Select Team
              </label>
              <select
                id="sports-meet-select-team"
                name="sportsMeetSelectTeam"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Teams</option>
                {teamOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={exportPdf}
              style={styles.btn}
              disabled={loading || visibleRegistrations.length === 0}
            >
              Download PDF
            </button>
          </div>
        </div>

        {error ? <div style={styles.error}>{error}</div> : null}

        {loading ? (
          <div style={styles.emptyState}>Loading registration data...</div>
        ) : visibleRegistrations.length === 0 ? (
          <div style={styles.emptyState}>No registrations match the current filters.</div>
        ) : (
          <div style={styles.cards}>
            {visibleRegistrations.map((registration) => {
              const registrationInEdit =
                draft && draft.registrationId === registration.id ? draft : null;

              return (
                <section key={registration.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <div style={styles.cardTitle}>{registration.eventName || 'Unnamed Event'}</div>
                      <div style={styles.cardMeta}>
                        {registration.visibleMembers.length} player
                        {registration.visibleMembers.length === 1 ? '' : 's'} in this list
                      </div>
                    </div>
                    <div style={styles.cardActions}>
                      <button
                        onClick={() => deleteRegistration(registration)}
                        disabled={Boolean(editingKey) || Boolean(deletingKey) || deletingRegistrationId === registration.id}
                        style={styles.deleteTeamBtn}
                      >
                        {deletingRegistrationId === registration.id ? 'Deleting Team...' : 'Delete Team'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.infoBar}>
                    <div style={styles.infoField}>
                      <span style={styles.infoLabel}>Event</span>
                      {registrationInEdit ? (
                        <select
                          id={`sports-meet-event-${registration.id}`}
                          name={`eventId-${registration.id}`}
                          style={styles.summaryInput}
                          value={registrationInEdit.eventId}
                          onChange={(e) => {
                            const nextEventId = e.target.value;
                            const nextEventName = eventMap.get(nextEventId) || '';
                            setDraft((current) => ({
                              ...current,
                              eventId: nextEventId,
                              eventName: nextEventName,
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
                        <span>{registration.eventName || '-'}</span>
                      )}
                    </div>

                    <div style={styles.infoField}>
                      <span style={styles.infoLabel}>Team</span>
                      {registrationInEdit ? (
                        <input
                          id={`sports-meet-team-${registration.id}`}
                          name={`teamName-${registration.id}`}
                          style={styles.summaryInput}
                          value={registrationInEdit.teamName}
                          onChange={(e) =>
                            setDraft((current) => ({ ...current, teamName: e.target.value }))
                          }
                          placeholder="Team name"
                        />
                      ) : (
                        <span>{registration.teamName || 'Individual'}</span>
                      )}
                    </div>

                    <div style={styles.infoField}>
                      <span style={styles.infoLabel}>Head</span>
                      {registrationInEdit ? (
                        <input
                          id={`sports-meet-head-${registration.id}`}
                          name={`teamHeadName-${registration.id}`}
                          style={styles.summaryInput}
                          value={registrationInEdit.teamHeadName}
                          onChange={(e) =>
                            setDraft((current) => ({
                              ...current,
                              teamHeadName: e.target.value,
                            }))
                          }
                          placeholder="Team head name"
                        />
                      ) : (
                        <span>{registration.teamHeadName || '-'}</span>
                      )}
                    </div>
                  </div>

                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Student</th>
                          <th style={styles.th}>Branch</th>
                          <th style={styles.th}>Register No</th>
                          <th style={styles.th}>Year</th>
                          <th style={styles.th}>Sem</th>
                          <th style={styles.th}>Signature</th>
                          <th style={styles.th}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registration.visibleMembers.map((member) => {
                          const key = `${registration.id}-${member.memberIndex}`;
                          const isEditing = key === editingKey;
                          const isDeleting = key === deletingKey;
                          const data = isEditing ? draft : member;

                          return (
                            <tr key={key}>
                              <td style={styles.td}>
                                {isEditing ? (
                                  <input
                                    id={`sports-meet-name-${key}`}
                                    name={`name-${key}`}
                                    style={styles.inp}
                                    value={data.name}
                                    onChange={(e) =>
                                      setDraft((current) => ({ ...current, name: e.target.value }))
                                    }
                                  />
                                ) : (
                                  member.name || '-'
                                )}
                              </td>
                              <td style={styles.td}>
                                {isEditing ? (
                                  <input
                                    id={`sports-meet-branch-${key}`}
                                    name={`branch-${key}`}
                                    style={styles.inp}
                                    value={data.branch}
                                    onChange={(e) =>
                                      setDraft((current) => ({
                                        ...current,
                                        branch: e.target.value,
                                      }))
                                    }
                                  />
                                ) : (
                                  member.branch || '-'
                                )}
                              </td>
                              <td style={styles.td}>
                                {isEditing ? (
                                  <input
                                    id={`sports-meet-register-${key}`}
                                    name={`registerNumber-${key}`}
                                    style={styles.inp}
                                    value={data.registerNumber}
                                    onChange={(e) =>
                                      setDraft((current) => ({
                                        ...current,
                                        registerNumber: e.target.value,
                                      }))
                                    }
                                  />
                                ) : (
                                  member.registerNumber || '-'
                                )}
                              </td>
                              <td style={styles.td}>
                                {isEditing ? (
                                  <input
                                    id={`sports-meet-year-${key}`}
                                    name={`year-${key}`}
                                    style={styles.inp}
                                    value={data.year}
                                    onChange={(e) =>
                                      setDraft((current) => ({ ...current, year: e.target.value }))
                                    }
                                  />
                                ) : (
                                  member.year || '-'
                                )}
                              </td>
                              <td style={styles.td}>
                                {isEditing ? (
                                  <input
                                    id={`sports-meet-sem-${key}`}
                                    name={`sem-${key}`}
                                    style={styles.inp}
                                    value={data.sem}
                                    onChange={(e) =>
                                      setDraft((current) => ({ ...current, sem: e.target.value }))
                                    }
                                  />
                                ) : (
                                  member.sem || '-'
                                )}
                              </td>
                              <td style={styles.td}></td>
                              <td style={styles.td}>
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={saveRow}
                                      disabled={saving}
                                      style={styles.smallBtn}
                                    >
                                      {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      disabled={saving}
                                      style={styles.smallBtn}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => beginEdit(registration, member)}
                                      disabled={Boolean(editingKey) || Boolean(deletingKey) || deletingRegistrationId === registration.id}
                                      style={styles.smallBtn}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deleteMember(registration, member)}
                                      disabled={Boolean(editingKey) || isDeleting || deletingRegistrationId === registration.id}
                                      style={styles.deleteBtn}
                                    >
                                      {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const styles = {
  page: {
    padding: 20,
    width: '100%',
    minWidth: 0,
    minHeight: '100vh',
    background: '#f4f6f8',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  headerActions: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'grid',
    gap: 6,
    minWidth: 220,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  },
  searchInput: {
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    borderRadius: 10,
    padding: '10px 12px',
    minWidth: 280,
  },
  select: {
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    borderRadius: 10,
    padding: '10px 12px',
    minWidth: 220,
  },
  btn: {
    border: '1px solid #111827',
    background: '#111827',
    color: '#fff',
    borderRadius: 10,
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  subText: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 13,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 12,
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    padding: '10px 12px',
  },
  emptyState: {
    border: '1px solid #d1d5db',
    borderRadius: 14,
    background: '#fff',
    padding: 24,
    color: '#6b7280',
  },
  cards: {
    display: 'grid',
    gap: 18,
  },
  card: {
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  cardActions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
  },
  cardMeta: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 13,
  },
  infoBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    border: '1px solid #e5e7eb',
    background: '#f8fafc',
    marginBottom: 14,
  },
  infoField: {
    display: 'grid',
    gap: 4,
    minWidth: 220,
    flex: '1 1 220px',
    color: '#111827',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  summaryInput: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '8px 10px',
    background: '#fff',
  },
  tableWrap: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 14,
    overflow: 'auto',
    background: '#fff',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 860,
  },
  th: {
    textAlign: 'left',
    padding: 12,
    background: '#f3f4f6',
    borderBottom: '1px solid #d1d5db',
    color: '#111827',
  },
  td: {
    padding: 12,
    borderBottom: '1px solid #e5e7eb',
    color: '#111827',
  },
  inp: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '8px 10px',
  },
  smallBtn: {
    marginRight: 8,
    border: '1px solid #d1d5db',
    background: '#fff',
    borderRadius: 8,
    padding: '7px 10px',
    cursor: 'pointer',
    color: '#111827',
  },
  deleteBtn: {
    border: '1px solid #fecaca',
    background: '#fff1f2',
    color: '#b91c1c',
    borderRadius: 8,
    padding: '7px 10px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  deleteTeamBtn: {
    border: '1px solid #ef4444',
    background: '#ef4444',
    color: '#fff',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 700,
  },
};

export default SportsMeetRegistrations;
