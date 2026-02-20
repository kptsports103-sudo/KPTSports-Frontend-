import { useEffect, useState } from 'react';
import api from '../services/api';

const About = () => {
  const [content, setContent] = useState({
    bannerImages: [],
    boxes: ['', '', ''],
    bigHeader: '',
    bigText: ''
  });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (content.bannerImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % content.bannerImages.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [content.bannerImages.length]);

  const loadContent = async () => {
    try {
      const { data } = await api.get('/home');
      setContent({
        bannerImages: Array.isArray(data.bannerImages) ? data.bannerImages : [],
        boxes: Array.isArray(data.boxes) && data.boxes.length ? data.boxes : ['', '', ''],
        bigHeader: data.bigHeader || '',
        bigText: data.bigText || ''
      });
    } catch (err) {
      console.error('Failed to load about content:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ textAlign: 'center', padding: '1.25rem 1rem 0', fontSize: '1.8rem', fontWeight: 700, color: '#1f2937' }}>
        KPT Sports About
      </div>
      {/* Banner Images */}
      {content.bannerImages.length > 0 && (
        <div style={{ position: 'relative', height: '70vh', overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            height: '100%',
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: 'transform 1s ease-in-out'
          }}>
            {content.bannerImages.map((banner, index) => (
              <img
                key={index}
                src={banner.image}
                alt={`Banner ${index + 1}`}
                style={{
                  minWidth: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
            ))}
          </div>
          {/* Year Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '5px',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            {content.bannerImages.length > 0 && content.bannerImages[currentSlide].year}
          </div>
        </div>
      )}


      {/* Boxes Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '3rem 2rem 1rem',
        backgroundColor: '#fdf6e3'
      }}>
        {content.boxes.map((box, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              margin: '0 1rem',
              padding: '2rem',
              backgroundColor: '#fdf6e3',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#333' }}>
              {box || 'Content coming soon...'}
            </p>
          </div>
        ))}
      </div>

      {/* Big Content Section */}
      <div style={{
        padding: '2rem 2rem 4rem',
        backgroundColor: '#fdf6e3',
        textAlign: 'center'
      }}>
        {content.bigHeader && (
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: '#333'
          }}>
            {content.bigHeader}
          </h2>
        )}
        {content.bigText && (
          <div style={{
            fontSize: '1.2rem',
            lineHeight: '1.8',
            color: '#555',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {content.bigText.split('\n\n').map((paragraph, index) => (
              <p key={index} style={{
                marginBottom: '1.5rem',
                textAlign: 'justify'
              }}>
                {paragraph.trim()}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
