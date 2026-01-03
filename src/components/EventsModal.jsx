import { useEffect, useState } from "react";
import api from '../services/api';

export default function EventsModal({ isOpen, onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/events');
        console.log('Events API Response:', res.data);
        setEvents(res.data || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isOpen]);

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
            Events
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
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3', width: '30%' }}>Event Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3', width: '25%' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3', width: '25%' }}>Location</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3', width: '10%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Loading...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No events available
                  </td>
                </tr>
              ) : (
                events.map((event, i) => (
                  <tr key={event._id || i} style={{ borderBottom: '1px solid #ddd', background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                    <td style={{ padding: '12px' }}>{i + 1}</td>
                    <td style={{ padding: '12px' }}>{event.title || event.name}</td>
                    <td style={{ padding: '12px' }}>{event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{event.location || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{event.status || 'Active'}</td>
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