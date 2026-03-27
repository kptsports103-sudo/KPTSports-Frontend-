import { useEffect, useState } from 'react';

import OptimizedImage from '../components/OptimizedImage';
import api from '../services/api';

const medalPriority = {
  Gold: 1,
  Silver: 2,
  Bronze: 3,
  Participation: 4
};

const INDIVIDUAL_POINTS = {
  Gold: 5,
  Silver: 3,
  Bronze: 1,
  Participation: 0
};

const GROUP_POINTS = {
  Gold: 10,
  Silver: 7,
  Bronze: 4,
  Participation: 0
};

const medalIcon = (medal) => {
  if (medal === 'Gold') return '🥇';
  if (medal === 'Silver') return '🥈';
  if (medal === 'Bronze') return '🥉';
  return '🎖️';
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

const cardHoverShadow = '0 18px 36px rgba(15, 23, 42, 0.22)';

const Results = () => {

  const currentYear = String(new Date().getFullYear());
  const [results, setResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [winners, setWinners] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const fetchResultsData = async () => {
      const [resultResponse, groupResponse, winnersResponse] = await Promise.allSettled([
        api.get('/results'),
        api.get('/group-results'),
        api.get('/winners'),
      ]);

      if (resultResponse.status === 'fulfilled') {
        setResults(resultResponse.value?.data || []);
      } else {
        console.error('Failed to fetch individual results:', resultResponse.reason);
        setResults([]);
      }

      if (groupResponse.status === 'fulfilled') {
        setGroupResults(groupResponse.value?.data || []);
      } else {
        console.error('Failed to fetch group results:', groupResponse.reason);
        setGroupResults([]);
      }

      if (winnersResponse.status === 'fulfilled') {
        setWinners(winnersResponse.value?.data || []);
      } else {
        console.error('Failed to fetch winners:', winnersResponse.reason);
        setWinners([]);
      }
    };

    fetchResultsData();
  }, []);

  // Combine and group results by selected year
  const allResults = [...results, ...groupResults];
  const availableYears = Array.from(
    new Set([
      ...allResults.map((r) => Number(r.year)).filter(Boolean)
    ])
  ).sort((a, b) => b - a);

  useEffect(() => {
    if (availableYears.length === 0) {
      if (selectedYear !== currentYear) {
        setSelectedYear(currentYear);
      }
      return;
    }

    const preferredYear = availableYears.includes(Number(currentYear))
      ? currentYear
      : String(availableYears[0]);

    if (!availableYears.includes(Number(selectedYear)) || selectedYear === currentYear) {
      setSelectedYear(preferredYear);
    }
  }, [availableYears, currentYear, selectedYear]);

  const filteredResults = allResults.filter((result) => String(result.year) === String(selectedYear));

  const groupedResults = filteredResults.reduce((acc, result) => {
    const year = result.year || 'Unknown';
    if (!acc[year]) {
      acc[year] = {
        individual: [],
        groups: []
      };
    }

    // Check if it's a group result (has teamName and members array)
    if (result.teamName && result.members) {
      acc[year].groups.push(result);
    } else {
      acc[year].individual.push(result);
    }
    return acc;
  }, {});

  return (

    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      color: palette.text,
      background: palette.bg
    }}>

      <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '2rem',
        color: palette.accent,
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        KPT Sports Results
      </h1>

      {winners.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            <div>
              <h2 style={{ margin: 0, color: palette.accent, fontSize: '1.75rem' }}>Winner Showcase</h2>
              <p style={{ margin: '8px 0 0 0', color: palette.muted }}>
                Added from the admin winners page and published automatically.
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {winners.map((winner) => (
              <article
                key={winner._id}
                style={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  borderRadius: '16px',
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
                    height: '220px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />

                <div style={{ padding: '1rem 1rem 1.2rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '0.85rem'
                  }}>
                    <span style={{ fontSize: '1.7rem' }}>{medalIcon(winner.medal)}</span>
                    <span style={{
                      background: medalColor(winner.medal),
                      color: '#fff',
                      padding: '0.35rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 'bold',
                      textShadow: '0 1px 2px rgba(0,0,0,0.28)'
                    }}>
                      {winner.medal} Medal
                    </span>
                  </div>

                  <h3 style={{ margin: 0, color: palette.text, fontSize: '1.2rem' }}>{winner.playerName}</h3>
                  <p style={{ margin: '0.45rem 0 0', color: palette.muted }}>{winner.eventName}</p>

                  <button
                    type="button"
                    onClick={() => setActiveImage({ ...winner, source: 'winner' })}
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
                    View Photo
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <label htmlFor="results-year-filter" style={{ marginRight: '10px', fontWeight: 600, color: palette.text }}>
          Select Year:
        </label>
        <select
          id="results-year-filter"
          name="results-year-filter"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: `1px solid ${palette.border}`,
            background: palette.surface,
            color: palette.text,
            minWidth: '140px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {availableYears.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {Object.keys(groupedResults).length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: palette.surfaceAlt,
          border: `1px solid ${palette.border}`,
          borderRadius: '10px',
          color: palette.muted
        }}>
          <h3>No Results Available</h3>
          <p>Results will be displayed here once they are added by the administrator.</p>
        </div>
      ) : (
        Object.entries(groupedResults)
          .sort(([a], [b]) => b - a) // Sort years in descending order
          .map(([year, yearResults]) => (
            <div key={year} style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '1.8rem',
                marginBottom: '1rem',
                color: palette.accent,
                borderBottom: `3px solid ${palette.accent}`,
                paddingBottom: '0.5rem'
              }}>
                Year: {year}
              </h2>

              {/* Individual Results */}
              {yearResults.individual.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    marginBottom: '1rem',
                    color: palette.text,
                    fontWeight: '600'
                  }}>
                    Individual Results
                  </h3>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <input
                      id="results-search"
                      name="results-search"
                      type="text"
                      placeholder="Search by Name or Event"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: '10px 14px',
                        width: '280px',
                        borderRadius: 8,
                        border: `1px solid ${palette.border}`,
                        fontSize: 14,
                        color: palette.text,
                        backgroundColor: palette.surface,
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {[...yearResults.individual]
                      .filter(result =>
                        (result.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (result.event || '').toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .sort((a, b) => (medalPriority[a.medal] || 999) - (medalPriority[b.medal] || 999))
                      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'en', { sensitivity: 'base' }))
                      .map(result => (
                      <div
                        key={result._id}
                        style={{
                          backgroundColor: palette.surface,
                          border: `1px solid ${palette.border}`,
                          borderRadius: '12px',
                          padding: '1.5rem',
                          boxShadow: palette.shadow,
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.boxShadow = cardHoverShadow;
                          e.currentTarget.style.borderColor = palette.accent;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = palette.shadow;
                          e.currentTarget.style.borderColor = palette.border;
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <span style={{
                            fontSize: '2rem',
                            marginRight: '1rem'
                          }}>
                            {medalIcon(result.medal)}
                          </span>
                          <div>
                            <h3 style={{
                              margin: 0,
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              color: palette.text
                            }}>
                              {result.name}
                            </h3>
                            <p style={{
                              margin: '0.25rem 0',
                              color: palette.muted,
                              fontSize: '0.9rem'
                            }}>
                              {result.event}
                            </p>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '1rem',
                          borderTop: `1px solid ${palette.border}`
                        }}>
                          <span style={{
                            background: medalColor(result.medal),
                            color: '#fff',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}>
                            {result.medal} Medal
                          </span>

                          {result.imageUrl && (
                            <button
                              onClick={() => setActiveImage(result)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: palette.accent,
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                              }}
                            >
                              View Photo
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group Results */}
              {yearResults.groups.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    marginBottom: '1rem',
                    color: palette.text,
                    fontWeight: '600'
                  }}>
                    Team Results
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {yearResults.groups.map(result => (
                      <div
                        key={result._id}
                        style={{
                          backgroundColor: palette.surface,
                          border: `1px solid ${palette.border}`,
                          borderRadius: '12px',
                          padding: '1.5rem',
                          boxShadow: palette.shadow,
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.boxShadow = cardHoverShadow;
                          e.currentTarget.style.borderColor = palette.accent;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = palette.shadow;
                          e.currentTarget.style.borderColor = palette.border;
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <span style={{
                            fontSize: '2rem',
                            marginRight: '1rem'
                          }}>
                            {medalIcon(result.medal)}
                          </span>
                          <div>
                            <h3 style={{
                              margin: 0,
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              color: palette.text
                            }}>
                              {result.teamName}
                            </h3>
                            <p style={{
                              margin: '0.25rem 0',
                              color: palette.muted,
                              fontSize: '0.9rem'
                            }}>
                              {result.event}
                            </p>
                          </div>
                        </div>

                        <div style={{
                          marginBottom: '1rem',
                          padding: '0.75rem',
                          backgroundColor: palette.surfaceAlt,
                          border: `1px solid ${palette.border}`,
                          borderRadius: '8px'
                        }}>
                          <p style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: palette.text
                          }}>
                            Team Members:
                          </p>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                          }}>
                            {result.members && result.members.map((member, i) => {
                              // Handle both legacy (string) and new (object) formats
                              const memberName = typeof member === 'string' ? member : (member.name || '');
                              return (
                              <span key={i} style={{
                                background: palette.accent,
                                color: '#fff',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: '500'
                              }}>
                                {memberName}
                              </span>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '1rem',
                          borderTop: `1px solid ${palette.border}`
                        }}>
                          <span style={{
                            background: medalColor(result.medal),
                            color: '#fff',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}>
                            {result.medal} Medal
                          </span>

                          {result.imageUrl && (
                            <button
                              onClick={() => setActiveImage(result)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: palette.accent,
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                              }}
                            >
                              View Photo
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
      )}

      {activeImage && (
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
            onClick={e => e.stopPropagation()}
          >
            <OptimizedImage
              src={activeImage.imageUrl}
              alt={
                activeImage.event ||
                activeImage.eventName ||
                activeImage.teamName ||
                activeImage.name ||
                activeImage.playerName ||
                'Result image'
              }
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
            {activeImage.source === 'winner' ? (
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
                      <th style={{ padding: '10px', textAlign: 'left', color: palette.text, borderBottom: `1px solid ${palette.border}` }}>Event</th>
                      <th style={{ padding: '10px', textAlign: 'left', color: palette.text, borderBottom: `1px solid ${palette.border}` }}>Medal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${palette.border}`, color: palette.text }}>{activeImage.playerName || '-'}</td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${palette.border}`, color: palette.text }}>{activeImage.eventName || '-'}</td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${palette.border}`, color: palette.text }}>{activeImage.medal || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
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
                      <th style={{ padding: '10px', textAlign: 'left', color: palette.text, borderBottom: `1px solid ${palette.border}` }}>Medal</th>
                      <th style={{ padding: '10px', textAlign: 'left', color: palette.text, borderBottom: `1px solid ${palette.border}` }}>Points</th>
                      <th style={{ padding: '10px', textAlign: 'left', color: palette.text, borderBottom: `1px solid ${palette.border}` }}>Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${palette.border}`, color: palette.text }}>{activeImage.medal || '-'}</td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${palette.border}`, color: palette.text }}>
                        {activeImage.teamName
                          ? (GROUP_POINTS[activeImage.medal] || 0)
                          : (INDIVIDUAL_POINTS[activeImage.medal] || 0)}
                      </td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${palette.border}`, color: palette.text }}>{activeImage.year || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
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
              ×
            </button>
          </div>
        </div>
      )}

    </div>

  );

};

export default Results;



