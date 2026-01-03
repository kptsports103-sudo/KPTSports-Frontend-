import { useState } from 'react';

const Achievements = () => {
  const [activeTable, setActiveTable] = useState(null);

  const showTable = (tableId) => {
    setActiveTable(tableId);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#cceeff', padding: '15px', textAlign: 'center', fontSize: '22px', fontWeight: 'bold' }}>
        Welcome to Sports Page
      </div>

      {/* Banner */}
      <div style={{ background: '#ddd', height: '180px', textAlign: 'center', paddingTop: '70px', fontSize: '18px' }}>
        Banner Area
      </div>

      {/* Center text */}
      <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '18px' }}>
        Our Sports Achievements
      </div>

      {/* Boxes */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <div
          style={{
            width: '150px',
            padding: '20px',
            background: '#0aa',
            color: 'white',
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: '8px'
          }}
          onMouseEnter={(e) => e.target.style.background = '#088'}
          onMouseLeave={(e) => e.target.style.background = '#0aa'}
          onClick={() => showTable('table1')}
        >
          Box One
        </div>
        <div
          style={{
            width: '150px',
            padding: '20px',
            background: '#0aa',
            color: 'white',
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: '8px'
          }}
          onMouseEnter={(e) => e.target.style.background = '#088'}
          onMouseLeave={(e) => e.target.style.background = '#0aa'}
          onClick={() => showTable('table2')}
        >
          Box Two
        </div>
      </div>

      {/* Table 1 */}
      <div id="table1" style={{ display: activeTable === 'table1' ? 'block' : 'none', margin: '30px auto', width: '60%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #999', padding: '10px', textAlign: 'center', background: '#eee' }}>Name</th>
              <th style={{ border: '1px solid #999', padding: '10px', textAlign: 'center', background: '#eee' }}>Game</th>
              <th style={{ border: '1px solid #999', padding: '10px', textAlign: 'center', background: '#eee' }}>Medal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #999', padding: '10px', textAlign: 'center' }}>Student A</td>
              <td style={{ border: '1px solid #999', padding: '10px', textAlign: 'center' }}>Cricket</td>
              <td style={{ border: '1px solid #999', padding: '10px', textAlign: 'center' }}>Gold</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table 2 */}
      <div id="table2" style={{ display: activeTable === 'table2' ? 'block' : 'none', margin: '30px auto', width: '60%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #999', padding: '10px', textAlign: 'center', background: '#eee' }}>Event</th>
              <th style={{ border: '1px solid #999', padding: '10px', textAlign: 'center', background: '#eee' }}>Participants</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #999', padding: '10px', textAlign: 'center' }}>Football</td>
              <td style={{ border: '1px solid #999', padding: '10px', textAlign: 'center' }}>20</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Achievements;