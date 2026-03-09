export default function EventsSection({ indoor, outdoor, loadingEvents }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h3 style={styles.title}>Event Schedule</h3>
        <h4 style={styles.subTitle}>Indoor Events</h4>
        <ScheduleTable rows={indoor} loading={loadingEvents} />
        <h4 style={{ ...styles.subTitle, marginTop: 16 }}>Outdoor Events</h4>
        <ScheduleTable rows={outdoor} loading={loadingEvents} />
      </div>
    </div>
  );
}

function ScheduleTable({ rows, loading }) {
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
          {loading ? (
            <tr>
              <td style={styles.td} colSpan={4}>
                Loading...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td style={styles.td} colSpan={4}>
                No events
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
  subTitle: { marginTop: 0, marginBottom: 8, color: '#1f2937' },
  empty: { opacity: 0.75 },
  note: { border: '1px solid #e5e7eb', background: '#f8fafc', borderRadius: 8, padding: '8px 10px', marginBottom: 8 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th: { textAlign: 'left', padding: 10, borderBottom: '1px solid #ddd', fontSize: 13 },
  td: { padding: 10, borderBottom: '1px solid #eee', fontSize: 13 },
};
