import { useEffect, useState } from 'react';
import api from '../services/api';

const History = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const { data } = await api.get('/home/about-timeline');
      setTimeline(Array.isArray(data.timeline) ? data.timeline : []);
    } catch (e) {
      console.error('Failed to load timeline', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading timeline...</p>
      </div>
    );
  }

  return (
    <div style={page}>
      <h1 style={title}>KPT Sports History</h1>
      <p style={subtitle}>Karnataka State Inter-Polytechnic Timeline</p>

      <table style={table}>
        <thead>
          <tr style={thead}>
            <th style={th}>#</th>
            <th style={th}>Academic Year</th>
            <th style={th}>Host Polytechnic</th>
            <th style={th}>Venue</th>
          </tr>
        </thead>
        <tbody>
          {timeline.map((row, i) => (
            <tr key={i} style={i % 2 === 0 ? rowEven : rowOdd}>
              <td style={tdCenter}>{i + 1}</td>
              <td style={td}>{row.year}</td>
              <td style={td}>{row.host}</td>
              <td style={td}>{row.venue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ===================== STYLES ===================== */

const page = {
  padding: '2rem',
  paddingBottom: '6rem',
  background: 'var(--app-bg)',
  color: 'var(--app-text)',
  minHeight: '100vh'
};

const title = {
  fontSize: '32px',
  fontWeight: '700',
  color: 'var(--page-accent)',
  textAlign: 'center',
  marginBottom: '8px'
};

const subtitle = {
  fontSize: '18px',
  color: 'var(--app-text-muted)',
  textAlign: 'center',
  marginBottom: '32px'
};

const table = {
  width: '100%',
  maxWidth: '1100px',
  margin: '0 auto',
  borderCollapse: 'separate',
  borderSpacing: 0,
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: 'var(--app-shadow)'
};

const thead = {
  background: 'linear-gradient(90deg, var(--page-accent-soft), var(--app-surface-muted))'
};

const th = {
  padding: '16px',
  textAlign: 'left',
  fontWeight: '700',
  color: 'var(--app-text)',
  borderBottom: '1px solid var(--app-border)'
};

const td = {
  padding: '14px',
  fontSize: '18px',
  color: 'var(--app-text)',
  borderBottom: '1px solid var(--app-border)'
};

const tdCenter = {
  ...td,
  textAlign: 'center',
  fontWeight: '600'
};

const rowEven = { background: 'var(--app-surface)' };
const rowOdd = { background: 'var(--app-surface-alt)' };

export default History;
