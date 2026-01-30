import { useState, useEffect } from 'react';
import api from '../services/api';
import StudentParticipationModal from '../components/StudentParticipationModal';
import EventsModal from '../components/EventsModal';

export default function Home() {
  const [activeTable, setActiveTable] = useState(null);
  const [homeContent, setHomeContent] = useState({ welcomeText: '', banners: [{ video: '', year: '' }], highlights: [] });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [eventsModalOpen, setEventsModalOpen] = useState(false);

  useEffect(() => {
    fetchHomeContent();
  }, []);

  useEffect(() => {
    if (homeContent.banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % homeContent.banners.length);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setCurrentBannerIndex(0);
    }
  }, [homeContent.banners]);

  const fetchHomeContent = async () => {
    try {
      const res = await api.get('/home');
      setHomeContent(res.data);
    } catch (error) {
      console.error('Error fetching home content:', error);
    }
  };

  const handleClick = (tableId) => {
    if (tableId === 'table1') {
      setStudentModalOpen(true);
    } else if (tableId === 'table2') {
      setEventsModalOpen(true);
    } else {
      setActiveTable(tableId);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, background: '#f5f5f5', minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* Header */}
      <div style={{ background: '#cceeff', padding: '60px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Welcome to KPT Mangalore Sports</h1>
        <p style={{ fontSize: '18px', margin: '0', fontWeight: 'normal' }}>Showcasing the spirit, strength, and sportsmanship of our students</p>
      </div>

      {/* Banner */}
      <div className="banner-container" style={{ position: 'relative', height: '600px', overflow: 'hidden', background: '#ddd' }}>
        {homeContent.banners.length > 0 && homeContent.banners[currentBannerIndex]?.video ? (
          <video
            src={homeContent.banners[currentBannerIndex].video}
            autoPlay
            muted
            loop
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '18px' }}>
            Banner Area
          </div>
        )}

        {/* Overlay Text on Video */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#ffffff',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
          zIndex: 10
        }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 10px 0', lineHeight: '1.2' }}>
            About KPT Mangalore Sports
          </h1>
          <p style={{ fontSize: '24px', margin: '0', fontWeight: '300' }}>
            Champions in Spirit, Champions in Action
          </p>
        </div>

        {homeContent.banners[currentBannerIndex]?.year && (
          <div className="banner-year" style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '24px',
            fontWeight: '600',
            color: '#ffffff',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '6px 16px',
            borderRadius: '6px',
            zIndex: 15
          }}>
            {homeContent.banners[currentBannerIndex].year}
          </div>
        )}
      </div>

      {/* Center text */}
      <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '18px' }}>
        {homeContent.highlights.length > 0 ? homeContent.highlights.join(' | ') : 'Our Sports Overview'}
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
          onClick={() => handleClick('table1')}
        >
          Student Participation
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
          onClick={() => handleClick('table2')}
        >
          Events
        </div>
      </div>



      <StudentParticipationModal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
      />
      <EventsModal
        isOpen={eventsModalOpen}
        onClose={() => setEventsModalOpen(false)}
      />
    </div>
  );
}