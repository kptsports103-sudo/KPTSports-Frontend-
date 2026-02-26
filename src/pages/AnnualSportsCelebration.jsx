import { useMemo, useState } from 'react';
import { readSportsMeetEvents } from '../data/sportsMeetEvents';

const AnnualSportsCelebration = () => {
  const [events] = useState(() => readSportsMeetEvents());

  const indoor = useMemo(() => events.filter((item) => item.category === 'Indoor'), [events]);
  const outdoor = useMemo(() => events.filter((item) => item.category === 'Outdoor'), [events]);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Annual Sports Celebration (College Sports Meet)</h1>
      <p style={styles.subtitle}>Indoor and outdoor events managed from CreatorDashboard data entry.</p>

      <div style={styles.grid}>
        <CategoryCard title="Indoor Games" events={indoor} />
        <CategoryCard title="Outdoor Games" events={outdoor} />
      </div>
    </div>
  );
};

const CategoryCard = ({ title, events }) => (
  <section style={styles.card}>
    <h2 style={styles.cardTitle}>{title}</h2>
    {events.length === 0 ? (
      <p style={styles.empty}>No events available.</p>
    ) : (
      <ol style={styles.list}>
        {events.map((item) => (
          <li key={item.id} style={styles.item}>
            <div style={styles.itemTop}>
              <strong>{item.eventName}</strong>
              <span style={styles.badge}>{item.status}</span>
            </div>
            <div style={styles.meta}>
              {item.sportType} | {item.eventType} | {item.gender}
            </div>
            <div style={styles.meta}>
              Fee: {item.entryFee === '' ? 'Free' : `Rs. ${item.entryFee}`} | Venue: {item.venue || 'TBA'} | Date:{' '}
              {item.date || 'TBA'}
            </div>
          </li>
        ))}
      </ol>
    )}
  </section>
);

const styles = {
  page: { padding: '2rem', background: '#f8fafc', minHeight: '80vh' },
  title: { fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 },
  subtitle: { color: '#475569', marginBottom: 20 },
  grid: { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: 8 },
  empty: { color: '#64748b' },
  list: { margin: 0, paddingLeft: 22, display: 'grid', gap: 10 },
  item: { paddingBottom: 10, borderBottom: '1px solid #f1f5f9' },
  itemTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  badge: {
    border: '1px solid #bfdbfe',
    background: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: 999,
    fontSize: 12,
    padding: '2px 8px',
  },
  meta: { fontSize: 13, color: '#64748b', marginTop: 4 },
};

export default AnnualSportsCelebration;
