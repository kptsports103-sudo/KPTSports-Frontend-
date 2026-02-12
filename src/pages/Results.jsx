import { useEffect, useState } from 'react';

import api from '../services/api';

const medalPriority = {
  Gold: 1,
  Silver: 2,
  Bronze: 3
};

const INDIVIDUAL_POINTS = {
  Gold: 5,
  Silver: 3,
  Bronze: 1
};

const GROUP_POINTS = {
  Gold: 10,
  Silver: 7,
  Bronze: 4
};

const Results = () => {

  const currentYear = String(new Date().getFullYear());
  const [results, setResults] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {

    // Fetch individual results
    api.get('/results').then(res => setResults(res.data || []))
      .catch(err => console.error('Failed to fetch individual results:', err));

    // Fetch group results
    api.get('/group-results').then(res => setGroupResults(res.data || []))
      .catch(err => console.error('Failed to fetch group results:', err));

  }, []);

  // Combine and group results by selected year
  const allResults = [...results, ...groupResults];
  const availableYears = Array.from(
    new Set([
      ...allResults.map((r) => Number(r.year)).filter(Boolean),
      Number(currentYear)
    ])
  ).sort((a, b) => b - a);

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
      fontFamily: 'Arial, sans-serif'
    }}>

      <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '2rem',
        color: '#2c3e50',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        🏆 Sports Results
      </h1>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <label htmlFor="results-year-filter" style={{ marginRight: '10px', fontWeight: 600, color: '#2c3e50' }}>
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
            border: '1px solid #ced4da',
            background: '#fff',
            color: '#111827',
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
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          color: '#6c757d'
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
                color: '#0f3b2e',
                borderBottom: '3px solid #0f3b2e',
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
                    color: '#2c3e50',
                    fontWeight: '600'
                  }}>
                    🏅 Individual Results
                  </h3>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <input
                      type="text"
                      placeholder="Search by Name or Event"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: '10px 14px',
                        width: '280px',
                        borderRadius: 8,
                        border: '2px solid #000000',
                        fontSize: 14,
                        color: '#000000',
                        backgroundColor: '#ffffff',
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
                          backgroundColor: '#fff',
                          border: '2px solid #e9ecef',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
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
                            {result.medal === 'Gold' ? '🥇' : result.medal === 'Silver' ? '🥈' : '🥉'}
                          </span>
                          <div>
                            <h3 style={{
                              margin: 0,
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              color: '#2c3e50'
                            }}>
                              {result.name}
                            </h3>
                            <p style={{
                              margin: '0.25rem 0',
                              color: '#6c757d',
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
                          borderTop: '1px solid #e9ecef'
                        }}>
                          <span style={{
                            background: result.medal === 'Gold' ? '#ffd700' :
                                       result.medal === 'Silver' ? '#c0c0c0' : '#cd7f32',
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
                                color: '#007bff',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                              }}
                            >
                              📷 View Photo
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
                    color: '#2c3e50',
                    fontWeight: '600'
                  }}>
                    🧑‍🤝‍🧑 Team Results
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
                          backgroundColor: '#fff',
                          border: '2px solid #e9ecef',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
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
                            {result.medal === 'Gold' ? '🥇' : result.medal === 'Silver' ? '🥈' : '🥉'}
                          </span>
                          <div>
                            <h3 style={{
                              margin: 0,
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              color: '#2c3e50'
                            }}>
                              🏆 {result.teamName}
                            </h3>
                            <p style={{
                              margin: '0.25rem 0',
                              color: '#6c757d',
                              fontSize: '0.9rem'
                            }}>
                              {result.event}
                            </p>
                          </div>
                        </div>

                        <div style={{
                          marginBottom: '1rem',
                          padding: '0.75rem',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px'
                        }}>
                          <p style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: '#495057'
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
                                background: '#007bff',
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
                          borderTop: '1px solid #e9ecef'
                        }}>
                          <span style={{
                            background: result.medal === 'Gold' ? '#ffd700' :
                                       result.medal === 'Silver' ? '#c0c0c0' : '#cd7f32',
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
                                color: '#007bff',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                              }}
                            >
                              📷 View Photo
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
              background: '#0f172a',
              padding: '1rem 1rem 1.25rem',
              borderRadius: '12px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={activeImage.imageUrl}
              alt=""
              style={{
                width: '100%',
                maxHeight: '52vh',
                objectFit: 'contain'
              }}
            />
            <div style={{ marginTop: '14px', background: '#fff', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Medal</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Points</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Year</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', color: '#111827' }}>{activeImage.medal || '-'}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', color: '#111827' }}>
                      {activeImage.teamName
                        ? (GROUP_POINTS[activeImage.medal] || 0)
                        : (INDIVIDUAL_POINTS[activeImage.medal] || 0)}
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', color: '#111827' }}>{activeImage.year || '-'}</td>
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
              �
            </button>
          </div>
        </div>
      )}

    </div>

  );

};

export default Results;


