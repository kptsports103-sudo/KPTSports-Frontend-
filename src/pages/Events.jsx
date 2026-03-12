import { useEffect, useState } from 'react';
import OptimizedImage from '../components/OptimizedImage';
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
      <h1 style={mainTitle}>KPT Sports Events</h1>

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
                <OptimizedImage
                  src={highlights[0].url}
                  alt={highlights[0].title}
                  width={960}
                  height={340}
                  crop="limit"
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 900px) 100vw, 40vw"
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
                    <OptimizedImage
                      src={highlight.url}
                      alt={highlight.title}
                      width={720}
                      height={320}
                      crop="limit"
                      sizes="(max-width: 900px) 100vw, 30vw"
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
                    <OptimizedImage
                      src={highlight.url}
                      alt={highlight.title}
                      width={720}
                      height={320}
                      crop="limit"
                      sizes="(max-width: 900px) 100vw, 30vw"
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
  background: 'var(--app-bg)',
  color: 'var(--app-text)',
  minHeight: '100vh',
  maxWidth: '1280px',
  margin: '0 auto'
};

const mainTitle = {
  fontSize: '38px',
  fontWeight: '700',
  color: 'var(--page-accent)',
  textAlign: 'center',
  marginBottom: '40px'
};

const loader = {
  padding: '3rem',
  textAlign: 'center',
  fontSize: '18px',
  color: 'var(--app-text)'
};

/* ABOUT */
const aboutBox = {
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  borderRadius: '18px',
  padding: '32px',
  boxShadow: 'var(--app-shadow)',
  marginBottom: '40px'
};

const aboutText = {
  fontSize: '18px',
  lineHeight: '1.8',
  color: 'var(--app-text)',
  whiteSpace: 'pre-wrap'
};

/* HIGHLIGHT */
const highlightBox = {
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  borderRadius: '18px',
  padding: '36px',
  boxShadow: 'var(--app-shadow)'
};

const highlightTitle = {
  fontSize: '34px',
  fontWeight: '700',
  color: 'var(--page-accent)',
  textAlign: 'center',
  marginBottom: '30px'
};

const highlightContent = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '40px',
  alignItems: 'center'
};

const highlightText = {
  fontSize: '18px',
  lineHeight: '1.8',
  color: 'var(--app-text)'
};

const aboutTitle = {
  fontSize: '22px',
  fontWeight: '700',
  marginBottom: '14px',
  color: 'var(--app-text)'
};

const overviewText = {
  whiteSpace: 'pre-wrap',
  color: 'var(--app-text-muted)'
};

/* IMAGE BOX */
const imageBox = {
  width: '100%',
  height: '340px',
  background: 'var(--app-surface-alt)',
  border: '1px solid var(--app-border)',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden'
};

const imageBoxSmall = {
  width: '100%',
  height: '320px',
  background: 'var(--app-surface-alt)',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  border: '1px solid var(--app-border)'
};

const imageInside = {
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  imageRendering: 'auto'
};

const placeholderImage = {
  color: 'var(--app-text-muted)',
  fontSize: '16px'
};

/* ADDITIONAL */
const additionalHighlightsBox = {
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  borderRadius: '18px',
  padding: '36px',
  boxShadow: 'var(--app-shadow)',
  marginTop: '40px'
};

const highlightsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '30px'
};

const highlightCard = {
  background: 'var(--app-surface-alt)',
  border: '1px solid var(--app-border)',
  borderRadius: '14px',
  padding: '24px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '24px',
  alignItems: 'center',
  boxShadow: 'var(--app-shadow)'
};

const cardTitle = {
  fontSize: '22px',
  fontWeight: '600',
  color: 'var(--page-accent)',
  marginBottom: '12px'
};

const cardOverview = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: 'var(--app-text-muted)',
  whiteSpace: 'pre-wrap'
};

/* FIELD EVENTS */
const fieldEventsBox = {
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  borderRadius: '18px',
  padding: '36px',
  boxShadow: 'var(--app-shadow)',
  marginTop: '40px'
};

const fieldEventsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '30px'
};

const fieldEventCard = {
  background: 'var(--app-surface-alt)',
  border: '1px solid var(--app-border)',
  borderRadius: '14px',
  padding: '24px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '24px',
  alignItems: 'center',
  boxShadow: 'var(--app-shadow)'
};

const fieldTitle = {
  fontSize: '24px',
  fontWeight: '600',
  color: 'var(--page-accent)',
  marginBottom: '12px'
};

const fieldOverview = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: 'var(--app-text-muted)',
  whiteSpace: 'pre-wrap'
};

/* EVENTS */
const eventsSection = {
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  borderRadius: '18px',
  padding: '36px',
  boxShadow: 'var(--app-shadow)',
  marginTop: '40px'
};

const eventsTitle = {
  fontSize: '30px',
  fontWeight: '700',
  color: 'var(--page-accent)',
  textAlign: 'center',
  marginBottom: '30px'
};

const eventsList = {
  display: 'grid',
  gap: '20px'
};

const eventItem = {
  background: 'var(--app-surface-alt)',
  border: '1px solid var(--app-border)',
  borderRadius: '14px',
  padding: '24px',
  boxShadow: 'var(--app-shadow)'
};

const eventTitle = {
  fontSize: '24px',
  fontWeight: '600',
  color: 'var(--page-accent)',
  marginBottom: '12px'
};

const eventDetails = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: 'var(--app-text)'
};

export default Events;

