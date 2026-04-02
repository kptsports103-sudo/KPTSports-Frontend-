const getSemOptionsForYear = (year) => {
  if (year === '1') return ['1', '2'];
  if (year === '2') return ['3', '4'];
  if (year === '3') return ['5', '6'];
  return ['1', '2'];
};

export default function RegistrationSection({
  events,
  form,
  members,
  selectedEvent,
  teamRule,
  memberCount,
  setMemberCount,
  changeForm,
  updateMember,
  submit,
  reviewData,
  confirmChecked,
  setConfirmChecked,
  confirmSubmit,
  cancelReview,
  submittedSummary,
  submitting,
  error,
}) {
  const openEvents = events.filter((item) => item.registrationStatus !== 'Closed');

  return (
    <section style={styles.regGrid}>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Sports Registration</h3>
        <form onSubmit={submit} style={styles.form}>
          <div style={styles.infoNote}>
            Choose an open sport from the list below. Closed events are marked and cannot be selected.
          </div>

          <select name="eventId" value={form.eventId} onChange={changeForm} style={styles.input} required>
            <option value="">{openEvents.length === 0 ? 'No open events available' : 'Select Event...'}</option>
            {events.map((item) => (
              <option key={item.id} value={item.id} disabled={item.registrationStatus === 'Closed'}>
                {`${item.category} - ${item.eventName}${item.registrationStatus === 'Closed' ? ' (Closed)' : ''}`}
              </option>
            ))}
          </select>

          <div style={styles.infoRow}>
            Event Type: <strong>{teamRule.isTeam ? 'Team / Roster' : 'Individual'}</strong>
          </div>

          {selectedEvent ? (
            <div style={styles.eventMeta}>
              <div>
                Registration: <strong>{selectedEvent.registrationStatus}</strong>
              </div>
              <div>
                Event Date: <strong>{selectedEvent.eventDate || 'TBA'}</strong>
              </div>
              <div>
                Venue: <strong>{selectedEvent.venue || 'TBA'}</strong>
              </div>
            </div>
          ) : null}

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
              id="registration-member-count"
              name="memberCount"
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
                        id={`registration-member-name-${i}`}
                        name={`memberName-${i}`}
                        style={styles.rowInput}
                        value={member.name}
                        onChange={(e) => updateMember(i, 'name', e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        id={`registration-member-branch-${i}`}
                        name={`memberBranch-${i}`}
                        style={styles.rowInput}
                        value={member.branch}
                        onChange={(e) => updateMember(i, 'branch', e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        id={`registration-member-register-${i}`}
                        name={`memberRegisterNumber-${i}`}
                        style={styles.rowInput}
                        value={member.registerNumber}
                        onChange={(e) => updateMember(i, 'registerNumber', e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <select
                        id={`registration-member-year-${i}`}
                        name={`memberYear-${i}`}
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
                        id={`registration-member-sem-${i}`}
                        name={`memberSem-${i}`}
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

          <div style={styles.selectionPreview}>
            <div style={styles.selectionTitle}>Selected Year / Sem</div>
            <div style={styles.selectionGrid}>
              {members.map((member, index) => (
                <div key={`selection-${index}`} style={styles.selectionCard}>
                  <div style={styles.selectionName}>{member.name || `Player ${index + 1}`}</div>
                  <div style={styles.selectionMeta}>
                    Year {member.year || '-'} | Sem {member.sem || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            Review Registration
          </button>
          {error ? <div style={styles.error}>{error}</div> : null}
        </form>

        {reviewData ? (
          <div style={styles.reviewCard}>
            <h4 style={styles.reviewTitle}>Confirm Registration Details</h4>
            <div style={styles.reviewGrid}>
              <div><strong>Event:</strong> {reviewData.summary.eventName}</div>
              <div><strong>Category:</strong> {reviewData.summary.category || '-'}</div>
              <div><strong>Type:</strong> {reviewData.summary.eventType}</div>
              <div><strong>Head / Player:</strong> {reviewData.summary.teamHeadName}</div>
              {reviewData.summary.teamName ? <div><strong>Team Name:</strong> {reviewData.summary.teamName}</div> : null}
              <div><strong>Players:</strong> {reviewData.summary.members.length}</div>
            </div>

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
                  {reviewData.summary.members.map((member, index) => (
                    <tr key={`review-${index}`}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>{member.name}</td>
                      <td style={styles.td}>{member.branch}</td>
                      <td style={styles.td}>{member.registerNumber}</td>
                      <td style={styles.td}>Year {member.year}</td>
                      <td style={styles.td}>Sem {member.sem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(event) => setConfirmChecked(event.target.checked)}
              />
              <span>I checked the details and confirm this registration is correct.</span>
            </label>

            <div style={styles.reviewActions}>
              <button
                type="button"
                style={{ ...styles.submitBtn, opacity: confirmChecked && !submitting ? 1 : 0.65, cursor: confirmChecked && !submitting ? 'pointer' : 'not-allowed' }}
                disabled={!confirmChecked || submitting}
                onClick={confirmSubmit}
              >
                {submitting ? 'Submitting...' : 'Confirm Registration'}
              </button>
              <button type="button" style={styles.cancelBtn} onClick={cancelReview} disabled={submitting}>
                Cancel and Edit Again
              </button>
            </div>
          </div>
        ) : null}

        {submittedSummary ? (
          <div style={styles.successCard}>
            <h4 style={styles.successTitle}>Registration Submitted</h4>
            <p style={styles.successText}>
              {submittedSummary.eventName} registered successfully for {submittedSummary.teamHeadName}.
            </p>
            {submittedSummary.teamName ? (
              <p style={styles.successText}>Team: {submittedSummary.teamName}</p>
            ) : null}
            <p style={styles.successText}>
              Players: {submittedSummary.members.map((member) => `${member.name} (Y${member.year} / S${member.sem})`).join(', ')}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const styles = {
  regGrid: { display: 'grid', gap: 16, gridTemplateColumns: '1fr', marginTop: 16 },
  card: {
    border: '1px solid var(--app-border)',
    borderRadius: 14,
    padding: 14,
    background: 'var(--app-surface)',
    boxShadow: 'var(--app-shadow)',
    color: 'var(--app-text)'
  },
  cardTitle: { marginTop: 0, fontSize: '1.4rem', color: 'var(--page-accent)' },
  form: { display: 'grid', gap: 10 },
  infoNote: {
    color: 'var(--app-text)',
    fontSize: 14,
    background: 'var(--app-surface-alt)',
    border: '1px solid var(--app-border)',
    borderRadius: 10,
    padding: '10px 12px'
  },
  infoRow: {
    color: 'var(--app-text)',
    fontSize: 14,
    background: 'var(--app-surface-alt)',
    border: '1px solid var(--app-border)',
    borderRadius: 10,
    padding: '10px 12px'
  },
  eventMeta: {
    display: 'grid',
    gap: 6,
    color: 'var(--app-text-muted)',
    fontSize: 14,
    padding: '2px 2px 4px'
  },
  input: {
    border: '1px solid var(--app-border)',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 16,
    background: 'var(--app-surface)',
    color: 'var(--app-text)'
  },
  rowInput: {
    width: '100%',
    border: '1px solid var(--app-border)',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 14,
    background: 'var(--app-surface)',
    color: 'var(--app-text)'
  },
  tableWrap: { border: '1px solid var(--app-border)', borderRadius: 12, overflowX: 'auto' },
  table: { width: '100%', minWidth: 780, borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '12px 10px',
    background: 'var(--app-surface-alt)',
    borderBottom: '1px solid var(--app-border)',
    color: 'var(--app-text)',
    fontSize: 14
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid var(--app-border)',
    color: 'var(--app-text)',
    fontSize: 14,
    verticalAlign: 'top'
  },
  miniText: { marginTop: 4, color: 'var(--app-text-muted)', fontSize: 12 },
  selectionPreview: {
    border: '1px solid var(--app-border)',
    borderRadius: 12,
    background: 'var(--app-surface-alt)',
    padding: 12
  },
  selectionTitle: {
    marginBottom: 10,
    color: 'var(--app-text)',
    fontWeight: 700,
    fontSize: 14
  },
  selectionGrid: {
    display: 'grid',
    gap: 8,
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
  },
  selectionCard: {
    border: '1px solid var(--app-border)',
    borderRadius: 10,
    background: 'var(--app-surface)',
    padding: '10px 12px'
  },
  selectionName: {
    color: 'var(--app-text)',
    fontWeight: 600,
    fontSize: 14
  },
  selectionMeta: {
    marginTop: 4,
    color: 'var(--app-text-muted)',
    fontSize: 13
  },
  submitBtn: {
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid var(--page-accent)',
    background: 'var(--page-accent)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer'
  },
  cancelBtn: {
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid var(--app-border)',
    background: 'var(--app-surface)',
    color: 'var(--app-text)',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer'
  },
  error: { color: '#f97066', fontSize: 14 },
  reviewCard: {
    marginTop: 16,
    border: '1px solid var(--page-accent)',
    borderRadius: 14,
    background: 'var(--app-surface-alt)',
    padding: 14,
    display: 'grid',
    gap: 12
  },
  reviewTitle: {
    margin: 0,
    color: 'var(--page-accent)',
    fontSize: '1.15rem'
  },
  reviewGrid: {
    display: 'grid',
    gap: 8,
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    color: 'var(--app-text)'
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    color: 'var(--app-text)',
    fontSize: 14
  },
  reviewActions: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  },
  successCard: {
    marginTop: 16,
    border: '1px solid #86efac',
    borderRadius: 14,
    background: '#f0fdf4',
    padding: 14
  },
  successTitle: {
    margin: 0,
    color: '#166534',
    fontSize: '1.05rem'
  },
  successText: {
    margin: '8px 0 0',
    color: '#166534',
    fontSize: 14
  },
};
