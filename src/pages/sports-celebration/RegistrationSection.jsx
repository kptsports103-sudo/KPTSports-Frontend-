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
}) {
  return (
    <section style={styles.regGrid}>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Sports Registration</h3>
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
                      <input style={styles.rowInput} value={member.registerNumber} onChange={(e) => updateMember(i, 'registerNumber', e.target.value)} />
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
}

const styles = {
  regGrid: { display: 'grid', gap: 16, gridTemplateColumns: '0.95fr 1.05fr', marginTop: 16 },
  card: { border: '1px solid #ddd', borderRadius: 14, padding: 14, background: '#fff' },
  cardTitle: { marginTop: 0, fontSize: '1.4rem' },
  form: { display: 'grid', gap: 10 },
  infoRow: { color: '#1f2937', fontSize: 14, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px' },
  input: { border: '1px solid #c8d0dd', borderRadius: 10, padding: '12px 14px', fontSize: 16 },
  rowInput: { width: '100%', border: '1px solid #c8d0dd', borderRadius: 8, padding: '8px 10px', fontSize: 14 },
  tableWrap: { border: '1px solid #d7dce6', borderRadius: 12, overflowX: 'auto' },
  table: { width: '100%', minWidth: 780, borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 10px', background: '#f2f5fa', borderBottom: '1px solid #dde3ee', color: '#25324b', fontSize: 14 },
  td: { padding: '10px', borderBottom: '1px solid #edf1f7', color: '#1f2937', fontSize: 14, verticalAlign: 'top' },
  miniText: { marginTop: 4, color: '#64748b', fontSize: 12 },
  submitBtn: { padding: '12px 16px', borderRadius: 10, border: '1px solid #27416f', background: '#2d4b80', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' },
  fee: { color: '#334155', fontSize: 14 },
  error: { color: '#b91c1c', fontSize: 14 },
  toolbar: { display: 'grid', gap: 8, gridTemplateColumns: '1fr 180px', margin: '12px 0' },
  search: { border: '1px solid #c8d0dd', borderRadius: 10, padding: '10px 12px', fontSize: 15 },
  filter: { border: '1px solid #c8d0dd', borderRadius: 10, padding: '10px 12px', fontSize: 15 },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: 999, border: '1px solid #334155', fontSize: 12, fontWeight: 600 },
};
