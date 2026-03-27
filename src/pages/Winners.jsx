import { useEffect, useMemo, useState } from 'react';
import OptimizedImage from '../components/OptimizedImage';
import api from '../services/api';

const medalIcon = (medal) => {
  if (medal === 'Gold') return '\u{1F947}';
  if (medal === 'Silver') return '\u{1F948}';
  if (medal === 'Bronze') return '\u{1F949}';
  return '\u{1F3C5}';
};

const medalColor = (medal) => {
  if (medal === 'Gold') return '#ffd700';
  if (medal === 'Silver') return '#c0c0c0';
  if (medal === 'Bronze') return '#cd7f32';
  return '#2563eb';
};

const palette = {
  bg: 'var(--app-bg)',
  surface: 'var(--app-surface)',
  surfaceAlt: 'var(--app-surface-alt)',
  surfaceMuted: 'var(--app-surface-muted)',
  text: 'var(--app-text)',
  muted: 'var(--app-text-muted)',
  border: 'var(--app-border)',
  shadow: 'var(--app-shadow)',
  accent: 'var(--page-accent)'
};

const MEDAL_FILTERS = ['All', 'Gold', 'Silver', 'Bronze'];

const Winners = () => {
  const [winners, setWinners] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedal, setSelectedMedal] = useState('All');

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await api.get('/winners');
        setWinners(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch winners:', error);
        setWinners([]);
      }
    };

    fetchWinners();
  }, []);

  const filteredWinners = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return winners.filter((winner) => {
      const matchesSearch =
        !normalizedSearch ||
        String(winner.playerName || '').toLowerCase().includes(normalizedSearch) ||
        String(winner.eventName || '').toLowerCase().includes(normalizedSearch);

      const matchesMedal = selectedMedal === 'All' || winner.medal === selectedMedal;

      return matchesSearch && matchesMedal;
    });
  }, [winners, searchTerm, selectedMedal]);

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
        color: palette.text,
        background: palette.bg
      }}
    >
      <header
        style={{
          marginBottom: '2rem',
          padding: '1.75rem',
          borderRadius: '20px',
          border: `1px solid ${palette.border}`,
          background: `linear-gradient(135deg, ${palette.surfaceAlt} 0%, ${palette.surface} 100%)`,
          boxShadow: palette.shadow
        }}
      >
        <p style={{ margin: 0, color: palette.accent, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Frontend Winners Page
        </p>
        <h1 style={{ margin: '0.5rem 0 0', fontSize: '2.4rem', color: palette.text }}>
          KPT Sports Winners
        </h1>
        <p style={{ margin: '0.85rem 0 0', color: palette.muted, maxWidth: '760px', lineHeight: 1.7 }}>
          This page shows winner details only. Each card includes the winner photo, player name, event name, team name, branch, and medal.
        </p>
      </header>

      <section
        style={{
          marginBottom: '1.75rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <div
          style={{
            padding: '1rem 1.1rem',
            borderRadius: '16px',
            background: palette.surface,
            border: `1px solid ${palette.border}`,
            boxShadow: palette.shadow
          }}
        >
          <div style={{ fontSize: '0.85rem', color: palette.muted }}>Total Winners</div>
          <div style={{ marginTop: '0.35rem', fontSize: '1.8rem', fontWeight: 700, color: palette.text }}>{winners.length}</div>
        </div>
        <div
          style={{
            padding: '1rem 1.1rem',
            borderRadius: '16px',
            background: palette.surface,
            border: `1px solid ${palette.border}`,
            boxShadow: palette.shadow
          }}
        >
          <div style={{ fontSize: '0.85rem', color: palette.muted }}>Visible Cards</div>
          <div style={{ marginTop: '0.35rem', fontSize: '1.8rem', fontWeight: 700, color: palette.text }}>{filteredWinners.length}</div>
        </div>
      </section>

      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.9rem',
          alignItems: 'center'
        }}
      >
        <input
          id="winners-search"
          name="winners-search"
          type="text"
          placeholder="Search by winner name or event"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          style={{
            flex: '1 1 260px',
            minWidth: '240px',
            padding: '12px 14px',
            borderRadius: '10px',
            border: `1px solid ${palette.border}`,
            background: palette.surface,
            color: palette.text,
            fontSize: '14px'
          }}
        />

        <select
          id="winners-medal-filter"
          name="winners-medal-filter"
          value={selectedMedal}
          onChange={(event) => setSelectedMedal(event.target.value)}
          style={{
            minWidth: '170px',
            padding: '12px 14px',
            borderRadius: '10px',
            border: `1px solid ${palette.border}`,
            background: palette.surface,
            color: palette.text,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {MEDAL_FILTERS.map((medal) => (
            <option key={medal} value={medal}>
              {medal === 'All' ? 'All Medals' : `${medal} Medal`}
            </option>
          ))}
        </select>
      </div>

      {filteredWinners.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: palette.surfaceAlt,
            border: `1px solid ${palette.border}`,
            borderRadius: '16px',
            color: palette.muted
          }}
        >
          <h3 style={{ marginTop: 0, color: palette.text }}>No winners found</h3>
          <p style={{ marginBottom: 0 }}>Winner details will appear here after they are added from the admin winners page.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {filteredWinners.map((winner) => (
            <article
              key={winner._id}
              style={{
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: palette.shadow
              }}
            >
              <OptimizedImage
                src={winner.imageUrl}
                alt={winner.playerName || 'Winner'}
                width={640}
                height={420}
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{
                  width: '100%',
                  height: '240px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              <div style={{ padding: '1rem 1rem 1.2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '0.9rem'
                  }}
                >
                  <span style={{ fontSize: '1.7rem' }}>{medalIcon(winner.medal)}</span>
                  <span
                    style={{
                      background: medalColor(winner.medal),
                      color: '#fff',
                      padding: '0.35rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 'bold',
                      textShadow: '0 1px 2px rgba(0,0,0,0.28)'
                    }}
                  >
                    {winner.medal} Medal
                  </span>
                </div>

                <h2 style={{ margin: 0, color: palette.text, fontSize: '1.2rem' }}>{winner.playerName}</h2>
                <p style={{ margin: '0.45rem 0 0', color: palette.muted, lineHeight: 1.6 }}>{winner.eventName}</p>
                {winner.teamName ? (
                  <p style={{ margin: '0.55rem 0 0', color: palette.accent, fontSize: '0.92rem', fontWeight: 700 }}>
                    Team: {winner.teamName}
                  </p>
                ) : null}
                {winner.branch ? (
                  <p style={{ margin: '0.35rem 0 0', color: palette.muted, fontSize: '0.92rem' }}>
                    Branch: {winner.branch}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => setActiveImage(winner)}
                  style={{
                    marginTop: '1rem',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: palette.accent,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600'
                  }}
                >
                  View Winner Details
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeImage ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999
          }}
          onClick={() => setActiveImage(null)}
        >
          <div
            style={{
              position: 'relative',
              width: 'min(760px, 90vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: palette.surface,
              border: `1px solid ${palette.border}`,
              padding: '1rem 1rem 1.25rem',
              borderRadius: '12px'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <OptimizedImage
              src={activeImage.imageUrl}
              alt={activeImage.playerName || 'Winner image'}
              width={1280}
              height={960}
              crop="limit"
              loading="eager"
              fetchPriority="high"
              sizes="90vw"
              style={{
                width: '100%',
                maxHeight: '52vh',
                objectFit: 'contain'
              }}
            />

            <div
              style={{
                marginTop: '14px',
                background: palette.surfaceAlt,
                border: `1px solid ${palette.border}`,
                borderRadius: '10px',
                overflow: 'hidden'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: palette.surfaceMuted }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: palette.text, borderBottom: `1px solid ${palette.border}` }}>Winner</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: palette.text, borderBottom: `1px solid ${palette.border}` }}>Team</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: palette.text, borderBottom: `1px solid ${palette.border}` }}>Branch</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: palette.text, borderBottom: `1px solid ${palette.border}` }}>Event</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: palette.text, borderBottom: `1px solid ${palette.border}` }}>Medal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${palette.border}`, color: palette.text }}>{activeImage.playerName || '-'}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${palette.border}`, color: palette.text }}>{activeImage.teamName || '-'}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${palette.border}`, color: palette.text }}>{activeImage.branch || '-'}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${palette.border}`, color: palette.text }}>{activeImage.eventName || '-'}</td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${palette.border}`, color: palette.text }}>{activeImage.medal || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setActiveImage(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #ef4444',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              {'\u00D7'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Winners;
