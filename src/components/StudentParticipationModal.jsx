import { useEffect, useState } from "react";
import api from '../services/api';

export default function StudentParticipationModal({ isOpen, onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!isOpen) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/home/student-participation?year=${currentYear}`);
        console.log('API Response:', res.data);
        setStudents(res.data.students || []);
      } catch (err) {
        console.error('Error fetching student participation:', err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [isOpen, currentYear]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          width: '90%',
          maxWidth: '800px',
          padding: '20px',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
            Student Participation – {currentYear}
          </h2>
          <button
            onClick={onClose}
            style={{
              color: '#dc3545',
              fontSize: '18px',
              fontWeight: 'bold',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ✕ Exit
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#007bff', color: '#fff' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3', width: '10%' }}>SL.NO</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3', width: '15%' }}>YEAR</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3', width: '25%' }}>PLAYER NAME</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3', width: '20%' }}>BRANCH</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3', width: '15%' }}>DIPLOMA YEAR</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Loading...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No data available
                  </td>
                </tr>
              ) : (
                students.map((s, i) => (
                  <tr key={s.id || i} style={{ borderBottom: '1px solid #ddd', background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                    <td style={{ padding: '12px' }}>{i + 1}</td>
                    <td style={{ padding: '12px' }}>{currentYear}</td>
                    <td style={{ padding: '12px' }}>{s.name}</td>
                    <td style={{ padding: '12px' }}>{s.branch}</td>
                    <td style={{ padding: '12px' }}>{s.diplomaYear}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}