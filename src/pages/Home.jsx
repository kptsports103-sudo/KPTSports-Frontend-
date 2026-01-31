import { useState, useEffect } from 'react';
import api from '../services/api';

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

      {/* Clubs Section */}
      <div style={{ padding: '40px 20px', background: '#f8f9fa' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', color: '#2c3e50' }}>
          Our Clubs & Activities
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          maxWidth: '1200px', 
          margin: '0 auto' 
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>Eco Club</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0' }}>Promoting environmental awareness and sustainable practices</p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>NCC</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0' }}>National Cadet Corps developing discipline and leadership</p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>Yoga Club</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0' }}>Promoting physical and mental well-being through yoga</p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>Youth Red Cross</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0' }}>Serving humanity and providing first aid training</p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: '#2c3e50',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>Arts & Culture Club</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0' }}>Celebrating creativity and cultural diversity</p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: '#2c3e50',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>Technical Club</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0' }}>Exploring innovation and technology trends</p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: '#2c3e50',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>NSS</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5', margin: '0' }}>National Service Scheme for community development</p>
          </div>
        </div>
      </div>

    </div>
  );
}