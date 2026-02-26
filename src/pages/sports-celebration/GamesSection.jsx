export default function GamesSection({ indoor, outdoor, loadingEvents, notifications, scheduleRows }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h3 style={styles.title}>Notifications</h3>
        {notifications.length === 0 ? <p style={styles.empty}>No notifications right now</p> : null}
        {notifications.map((note, idx) => (
          <div key={`note-${idx}`} style={styles.note}>
            {note}
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}>Indoor Games</h3>
        <GamesTable rows={indoor} loading={loadingEvents} />
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}>Outdoor Games</h3>
        <GamesTable rows={outdoor} loading={loadingEvents} />
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}>Event Schedule</h3>
        <ScheduleTable rows={scheduleRows} />
      </div>
    </div>
  );
}

function GamesTable({ rows, loading }) {
  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Game Name</th>
            <th style={styles.th}>Reg Start</th>
            <th style={styles.th}>Reg End</th>
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
                No games
              </td>
            </tr>
          ) : (
            rows.map((event) => (
              <tr key={event.id}>
                <td style={styles.td}>{event.eventName}</td>
                <td style={styles.td}>{event.registrationStartDate || 'TBA'}</td>
                <td style={styles.td}>{event.registrationEndDate || 'TBA'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleTable({ rows }) {
  return (
    <div style={styles.tableWrap}>
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
          {rows.length === 0 ? (
            <tr>
              <td style={styles.td} colSpan={4}>
                Schedule not published yet
              </td>
            </tr>
          ) : (
            rows.map((event) => (
              <tr key={`sch-${event.id}`}>
                <td style={styles.td}>{event.eventName}</td>
                <td style={styles.td}>{event.eventDate || 'TBA'}</td>
                <td style={styles.td}>{event.eventTime || 'TBA'}</td>
                <td style={styles.td}>{event.venue || 'TBA'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  wrap: { marginTop: 16, display: 'grid', gap: 16 },
  card: { border: '1px solid #ddd', borderRadius: 14, padding: 14, background: '#fff' },
  title: { marginTop: 0, marginBottom: 10 },
  empty: { opacity: 0.75 },
  note: { border: '1px solid #e5e7eb', background: '#f8fafc', borderRadius: 8, padding: '8px 10px', marginBottom: 8 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th: { textAlign: 'left', padding: 10, borderBottom: '1px solid #ddd', fontSize: 13 },
  td: { padding: 10, borderBottom: '1px solid #eee', fontSize: 13 },
};
