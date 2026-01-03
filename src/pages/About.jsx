import { useEffect, useState } from 'react';
import api from '../services/api';

const About = () => {
  const [content, setContent] = useState({
    bannerVideo: '',
    boxes: ['', '', ''],
    bigHeader: '',
    bigText: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data } = await api.get('/home');
      setContent({
        bannerVideo: data.bannerVideo || '',
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
      {/* Banner Video */}
      {content.bannerVideo && (
        <div style={{ position: 'relative', height: '70vh', overflow: 'hidden' }}>
          <video
            src={content.bannerVideo}
            autoPlay
            muted
            loop
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {/* Text Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            color: '#fff',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              fontFamily: 'Arial, sans-serif'
            }}>
              About KPT Mangalore Sports
            </h1>
            <p style={{
              fontSize: '1.8rem',
              fontWeight: '300',
              margin: 0,
              textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
              fontFamily: 'Arial, sans-serif',
              letterSpacing: '1px'
            }}>
              Champions in Spirit, Champions in Action
            </p>
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