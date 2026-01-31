import { useState, useEffect } from 'react';
import api from '../services/api';
import './Home.css';

export default function Home() {
  const [homeContent, setHomeContent] = useState({ welcomeText: '', banners: [{ video: '', year: '' }], highlights: [] });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

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

        <div className="club-carousel-wrapper">
          <div className="club-carousel-track">

            {/* CARD 1 */}
            <div className="club-card purple">
              <h3>Eco Club</h3>
              <p>Promoting environmental awareness and sustainable practices</p>
            </div>

            {/* CARD 2 */}
            <div className="club-card pink">
              <h3>NCC</h3>
              <p>National Cadet Corps developing discipline and leadership</p>
            </div>

            {/* CARD 3 */}
            <div className="club-card blue">
              <h3>Yoga Club</h3>
              <p>Promoting physical and mental well-being through yoga</p>
            </div>

            {/* CARD 4 */}
            <div className="club-card yellow">
              <h3>Youth Red Cross</h3>
              <p>Serving humanity and providing first aid training</p>
            </div>

            {/* CARD 5 */}
            <div className="club-card light">
              <h3>Arts & Culture Club</h3>
              <p>Celebrating creativity and cultural diversity</p>
            </div>

            {/* CARD 6 */}
            <div className="club-card orange">
              <h3>Technical Club</h3>
              <p>Exploring innovation and technology trends</p>
            </div>

            {/* CARD 7 */}
            <div className="club-card light">
              <h3>NSS</h3>
              <p>National Service Scheme for community development</p>
            </div>

            {/* DUPLICATE CARDS FOR INFINITE LOOP */}
            <div className="club-card purple">
              <h3>Eco Club</h3>
              <p>Promoting environmental awareness and sustainable practices</p>
            </div>

            <div className="club-card pink">
              <h3>NCC</h3>
              <p>National Cadet Corps developing discipline and leadership</p>
            </div>

            <div className="club-card blue">
              <h3>Yoga Club</h3>
              <p>Promoting physical and mental well-being through yoga</p>
            </div>

            <div className="club-card yellow">
              <h3>Youth Red Cross</h3>
              <p>Serving humanity and providing first aid training</p>
            </div>

            <div className="club-card light">
              <h3>Arts & Culture Club</h3>
              <p>Celebrating creativity and cultural diversity</p>
            </div>

            <div className="club-card orange">
              <h3>Technical Club</h3>
              <p>Exploring innovation and technology trends</p>
            </div>

            <div className="club-card light">
              <h3>NSS</h3>
              <p>National Service Scheme for community development</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}