import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './Home.css';

export default function Home() {
  const [homeContent, setHomeContent] = useState({ welcomeText: '', banners: [{ video: '', year: '' }], highlights: [] });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [clubs, setClubs] = useState([]);
  const [index, setIndex] = useState(1);
  const trackRef = useRef(null);
  const startX = useRef(0);

  useEffect(() => {
    fetchHomeContent();
    fetchClubs();
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

  const fetchClubs = async () => {
    try {
      // For now, use static data - replace with API call when ready
      const clubData = [
        { id: 1, name: 'Eco Club', description: 'Promoting environmental awareness and sustainable practices', theme: 'purple' },
        { id: 2, name: 'NCC', description: 'National Cadet Corps developing discipline and leadership', theme: 'pink' },
        { id: 3, name: 'Yoga Club', description: 'Promoting physical and mental well-being through yoga', theme: 'blue' },
        { id: 4, name: 'Youth Red Cross', description: 'Serving humanity and providing first aid training', theme: 'yellow' },
        { id: 5, name: 'Arts & Culture Club', description: 'Celebrating creativity and cultural diversity', theme: 'light' },
        { id: 6, name: 'Technical Club', description: 'Exploring innovation and technology trends', theme: 'orange' },
        { id: 7, name: 'NSS', description: 'National Service Scheme for community development', theme: 'light' }
      ];
      const cloned = [
        clubData[clubData.length - 1],
        ...clubData,
        clubData[0]
      ];
      setClubs(cloned);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const slideTo = (i) => {
    trackRef.current.style.transition = 'transform 0.5s ease';
    trackRef.current.style.transform = `translateX(-${i * 280}px)`;
    setIndex(i);
  };

  const next = () => slideTo(index + 1);
  const prev = () => slideTo(index - 1);

  const handleTransitionEnd = () => {
    if (index === clubs.length - 1) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = `translateX(-280px)`;
      setIndex(1);
    }
    if (index === 0) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = `translateX(-${(clubs.length - 2) * 280}px)`;
      setIndex(clubs.length - 2);
    }
  };

  const touchStart = (e) => (startX.current = e.touches[0].clientX);
  const touchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50) prev();
  };

  const fetchHomeContent = async () => {
    try {
      const res = await api.get('/home');
      setHomeContent(res.data);
    } catch (error) {
      console.error('Error fetching home content:', error);
    }
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

      {/* Center text */}
      <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '18px' }}>
        {homeContent.highlights.length > 0 ? homeContent.highlights.join(' | ') : ''}
      </div>

      {/* Clubs Section - Carousel */}
      <div style={{ padding: '40px 20px', background: '#f8f9fa' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '30px',
          color: '#2c3e50'
        }}>
          Our Clubs & Activities
        </h2>

        <div className="carousel-wrapper">
          <button className="arrow left" onClick={prev}>◀</button>

          <div
            className="carousel-viewport"
            onTouchStart={touchStart}
            onTouchEnd={touchEnd}
          >
            <div
              className="carousel-track"
              ref={trackRef}
              onTransitionEnd={handleTransitionEnd}
              style={{ transform: 'translateX(-280px)' }}
            >
              {clubs.map((club, i) => (
                <div key={i} className={`club-card ${club.theme}`}>
                  <h3>{club.name}</h3>
                  <p>{club.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button className="arrow right" onClick={next}>▶</button>
        </div>

        {/* DOTS */}
        <div className="dots">
          {clubs.slice(1, -1).map((_, i) => (
            <span
              key={i}
              className={index === i + 1 ? 'dot active' : 'dot'}
              onClick={() => slideTo(i + 1)}
            />
          ))}
        </div>
      </div>

    </div>
  );
}