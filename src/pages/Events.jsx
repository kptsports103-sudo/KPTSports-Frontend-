import { useEffect, useState } from 'react';
import api from '../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const eventsRes = await api.get('/events');
      setEvents(eventsRes.data || []);

      const homeRes = await api.get('/home');
      const homeData = homeRes.data || {};

      setAbout(homeData.about || '');

      const processedHighlights = Array.isArray(homeData.highlights)
        ? homeData.highlights.map(h => ({
            title: h.title || '',
            overview: h.overview || '',
            url: h.url || ''
          }))
        : [];

      setHighlights(processedHighlights);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={loader}>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div style={page}>
      <h1 style={mainTitle}>Our Sports Details</h1>

      {/* ABOUT */}
      {about && (
        <section style={aboutBox}>
          <p style={aboutText}>{about}</p>
        </section>
      )}

      {/* MAIN HIGHLIGHT */}
      {highlights.length > 0 && (
        <section style={highlightBox}>
          <h2 style={highlightTitle}>{highlights[0].title}</h2>

          <div style={highlightContent}>
            <div style={highlightText}>
              <h3 style={aboutTitle}>About the Events</h3>
              <p style={overviewText}>{highlights[0].overview}</p>
            </div>

            {/* FIXED IMAGE BOX */}
            <div style={imageBox}>
              {highlights[0].url ? (
                <img
                  src={highlights[0].url}
                  alt={highlights[0].title}
                  style={imageInside}
                />
              ) : (
                <div style={placeholderImage}>No Image</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ADDITIONAL HIGHLIGHTS */}
      {highlights.length > 1 && (
        <section style={additionalHighlightsBox}>
          <div style={highlightsGrid}>
            {highlights.slice(1, 3).map((highlight, index) => (
              <div key={index} style={highlightCard}>
                <div>
                  <h3 style={cardTitle}>{highlight.title}</h3>
                  <p style={cardOverview}>{highlight.overview}</p>
                </div>

                <div style={imageBoxSmall}>
                  {highlight.url ? (
                    <img
                      src={highlight.url}
                      alt={highlight.title}
                      style={imageInside}
                    />
                  ) : (
                    <div style={placeholderImage}>No Image</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FIELD EVENTS SECTION */}
      {highlights.length > 3 && (
        <section style={fieldEventsBox}>
          <div style={fieldEventsGrid}>
            {highlights.slice(3).map((highlight, index) => (
              <div key={index} style={fieldEventCard}>
                <div>
                  <h3 style={fieldTitle}>{highlight.title}</h3>
                  <p style={fieldOverview}>{highlight.overview}</p>
                </div>

                <div style={imageBoxSmall}>
                  {highlight.url ? (
                    <img
                      src={highlight.url}
                      alt={highlight.title}
                      style={imageInside}
                    />
                  ) : (
                    <div style={placeholderImage}>No Image</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EVENTS LIST */}
      {events.length > 0 && (
        <section style={eventsSection}>
          <h2 style={eventsTitle}>Past Events</h2>

          <div style={eventsList}>
            {events.map((event, index) => (
              <div key={index} style={eventItem}>
                <h3 style={eventTitle}>{event.event_title}</h3>
                <div style={eventDetails}>
                  <p><strong>Level:</strong> {event.event_level}</p>
                  <p><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
                  <p><strong>Venue:</strong> {event.venue}, {event.city}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

/* ===================== STYLES ===================== */

const page = {
  padding: '2.5rem',
  background: '#f8faff',
  minHeight: '100vh'
};

const mainTitle = {
  fontSize: '38px',
  fontWeight: '700',
  color: '#0b3ea8',
  textAlign: 'center',
  marginBottom: '40px'
};

const loader = {
  padding: '3rem',
  textAlign: 'center',
  fontSize: '18px',
  color: '#000'
};

/* ABOUT */
const aboutBox = {
  background: '#fff',
  borderRadius: '18px',
  padding: '32px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
  marginBottom: '40px'
};

const aboutText = {
  fontSize: '18px',
  lineHeight: '1.8',
  color: '#000',
  whiteSpace: 'pre-wrap'
};

/* HIGHLIGHT */
const highlightBox = {
  background: '#fff',
  borderRadius: '18px',
  padding: '36px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
};

const highlightTitle = {
  fontSize: '34px',
  fontWeight: '700',
  color: '#0b3ea8',
  textAlign: 'center',
  marginBottom: '30px'
};

const highlightContent = {
  display: 'grid',
  gridTemplateColumns: '1.4fr 1fr',
  gap: '40px',
  alignItems: 'center'
};

const highlightText = {
  fontSize: '18px',
  lineHeight: '1.8',
  color: '#000'
};

const aboutTitle = {
  fontSize: '22px',
  fontWeight: '700',
  marginBottom: '14px',
  color: '#000'
};

const overviewText = {
  whiteSpace: 'pre-wrap',
  color: '#000'
};

/* 🔒 IMAGE BOX (FIXED) */
const imageBox = {
  width: '100%',
  height: '340px',
  background: '#f4f6fb',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden'
};

const imageBoxSmall = {
  width: '100%',
  height: '320px',
  background: '#f9fafc',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  border: '1px solid #e3e6eb'
};

const imageInside = {
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  imageRendering: 'auto'
};

const placeholderImage = {
  color: '#777',
  fontSize: '16px'
};

/* ADDITIONAL */
const additionalHighlightsBox = {
  background: '#fff',
  borderRadius: '18px',
  padding: '36px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
  marginTop: '40px'
};

const highlightsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
  gap: '30px'
};

const highlightCard = {
  background: '#f8faff',
  borderRadius: '14px',
  padding: '24px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
  alignItems: 'center',
  boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
};

const cardTitle = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#0b3ea8',
  marginBottom: '12px'
};

const cardOverview = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#000',
  whiteSpace: 'pre-wrap'
};

/* FIELD EVENTS */
const fieldEventsBox = {
  background: '#fff',
  borderRadius: '18px',
  padding: '36px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
  marginTop: '40px'
};

const fieldEventsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
  gap: '30px'
};

const fieldEventCard = {
  background: '#f8faff',
  borderRadius: '14px',
  padding: '24px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
  alignItems: 'center',
  boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
};

const fieldTitle = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#0b3ea8',
  marginBottom: '12px'
};

const fieldOverview = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#000',
  whiteSpace: 'pre-wrap'
};

/* EVENTS */
const eventsSection = {
  background: '#fff',
  borderRadius: '18px',
  padding: '36px',
  boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
  marginTop: '40px'
};

const eventsTitle = {
  fontSize: '30px',
  fontWeight: '700',
  color: '#0b3ea8',
  textAlign: 'center',
  marginBottom: '30px'
};

const eventsList = {
  display: 'grid',
  gap: '20px'
};

const eventItem = {
  background: '#f8faff',
  borderRadius: '14px',
  padding: '24px',
  boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
};

const eventTitle = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#0b3ea8',
  marginBottom: '12px'
};

const eventDetails = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#000'
};

export default Events;
