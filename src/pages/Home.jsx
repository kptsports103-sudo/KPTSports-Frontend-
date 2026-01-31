import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [homeContent, setHomeContent] = useState({ welcomeText: '', banners: [{ video: '', year: '' }], highlights: [] });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [clubs, setClubs] = useState([]);
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const autoPlayRef = useRef(null);
  const startX = useRef(0);

  useEffect(() => {
    fetchHomeContent();
    fetchClubs();
  }, []);

  const fetchHomeContent = async () => {
    try {
      const res = await api.get('/home');
      setHomeContent(res.data);
    } catch (error) {
      console.error('Error fetching home content:', error);
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await api.get('/home');
      console.log('Home.jsx - Raw API response:', res.data);
      const clubsData = res.data.clubs || [];
      console.log('Home.jsx - Clubs data from API:', clubsData);
      
      // Check if clubs have required fields, add defaults if missing
      const processedClubs = clubsData.map((club, index) => ({
        id: club.id || index + 1,
        name: club.name || 'Unknown Club',
        url: club.url || '#',
        description: club.description || 'Club activities and information',
        theme: club.theme || 'blue'
      }));
      
      console.log('Home.jsx - Processed clubs with defaults:', processedClubs);
      setClubs(processedClubs);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      // Fallback to default clubs if API fails
      const clubData = [
        {
          id: 1,
          name: 'KPT College',
          url: '/college',
          description: 'Karnataka (Govt.) Polytechnic, Mangalore – Excellence in Technical Education',
          theme: 'college'
        },
        { id: 2, name: 'Eco Club', url: '/clubs/eco-club', description: 'Promoting environmental awareness and sustainable practices', theme: 'purple' },
        { id: 3, name: 'NCC', url: '/clubs/ncc', description: 'National Cadet Corps developing discipline and leadership', theme: 'pink' },
        { id: 4, name: 'Yoga Club', url: '/clubs/yoga-club', description: 'Promoting physical and mental well-being through yoga', theme: 'blue' },
        { id: 5, name: 'Youth Red Cross', url: '/clubs/youth-red-cross', description: 'Serving humanity and providing first aid training', theme: 'yellow' },
        { id: 6, name: 'Arts & Culture Club', url: '/clubs/arts-culture', description: 'Celebrating creativity and cultural diversity', theme: 'light' },
        { id: 7, name: 'Technical Club', url: '/clubs/technical-club', description: 'Exploring innovation and technology trends', theme: 'orange' },
        { id: 8, name: 'NSS', url: '/clubs/nss', description: 'National Service Scheme for community development', theme: 'light' }
      ];
      console.log('Home.jsx - Using fallback clubs:', clubData);
      setClubs(clubData);
    }
  };

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

  /* ---------- AUTO PLAY ---------- */
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % clubs.length);
    }, 3000);

    return () => clearInterval(autoPlayRef.current);
  }, [clubs]);

  /* ---------- SLIDE EFFECT ---------- */
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${index * 100}%)`;
    }
  }, [index]);

  /* ---------- TOUCH SWIPE ---------- */
  const touchStart = (e) => (startX.current = e.touches[0].clientX);
  const touchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 50) setIndex((prev) => (prev + 1) % clubs.length);
    if (diff < -50) setIndex((prev) => (prev - 1 + clubs.length) % clubs.length);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, background: '#f5f5f5' }}>
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

      {/* CLUB CAROUSEL */}
      <section className="club-section">
        <h2 className="club-title">Our Clubs & Activities</h2>

        <div className="carousel-container">
          <button className="arrow left" onClick={() => setIndex((index - 1 + clubs.length) % clubs.length)}>◀</button>

          <div
            className="carousel-viewport"
            onTouchStart={touchStart}
            onTouchEnd={touchEnd}
          >
            <div className="carousel-track" ref={trackRef}>
              {clubs.map((club) => (
                <div
                  key={club.id || club.name}
                  className={`club-card ${club.theme}`}
                  onClick={() => navigate(club.url)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>{club.name}</h3>
                  <p>{club.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button className="arrow right" onClick={() => setIndex((index + 1) % clubs.length)}>▶</button>
        </div>

        {/* DOTS */}
        <div className="dots">
          {clubs.map((_, i) => (
            <span
              key={i}
              className={`dot ${index === i ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}