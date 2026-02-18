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

  const announcements = [
    'Inter-department athletics trials are open for all first-year students.',
    'Team registration for the annual sports meet closes on March 8, 2026.',
    'Updated result sheets are available in the Results section.'
  ];

  const sportsCategories = ['Football', 'Cricket', 'Athletics', 'Volleyball', 'Indoor Games', 'Throwball'];

  const achievements = [
    { title: 'State-Level Medals', value: '110+' },
    { title: 'Active Players', value: '21' },
    { title: 'Hosted Sports Meets', value: '45' },
    { title: 'Years of Excellence', value: '12' }
  ];

  const upcomingEvents = [
    { name: 'Annual Sports Meet', date: 'March 15, 2026', venue: 'Main Ground' },
    { name: 'Inter-Polytechnic Volleyball', date: 'April 3, 2026', venue: 'Indoor Court' }
  ];

  useEffect(() => {
    fetchHomeContent();
    fetchClubs();
  }, []);

  const fetchHomeContent = async () => {
    try {
      const res = await api.get('/home');
      console.log('Home.jsx - Raw API response:', res.data);
      console.log('Home.jsx - API response status:', res.status);
      console.log('Home.jsx - Full response object:', res);
      setHomeContent(res.data);
    } catch (error) {
      console.error('Error fetching home content:', error);
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await api.get('/home');
      console.log('Home.jsx - Raw API response:', res.data);
      console.log('Home.jsx - API response status:', res.status);
      console.log('Home.jsx - Full response object:', res);
      const clubsData = res.data.clubs || [];
      console.log('Home.jsx - Clubs data from API:', clubsData);
      console.log('Home.jsx - Clubs data type:', typeof clubsData);
      console.log('Home.jsx - Clubs data length:', clubsData.length);

      const processedClubs = clubsData.map((club, i) => ({
        id: club.id || i + 1,
        name: club.name || 'Unknown Club',
        url: club.url || '#',
        description: club.description || 'Club activities and information',
        theme: club.theme || 'blue'
      }));

      console.log('Home.jsx - Processed clubs with defaults:', processedClubs);
      setClubs(processedClubs);
    } catch (error) {
      console.error('Home.jsx - Error fetching clubs:', error);
      console.error('Home.jsx - Error details:', error.response);
      const clubData = [
        {
          id: 1,
          name: 'KPT College',
          url: '/college',
          description: 'Karnataka (Govt.) Polytechnic, Mangalore - Excellence in Technical Education',
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
    }
    setCurrentBannerIndex(0);
    return undefined;
  }, [homeContent.banners]);

  useEffect(() => {
    if (clubs.length === 0) {
      return undefined;
    }

    autoPlayRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % clubs.length);
    }, 3000);

    return () => clearInterval(autoPlayRef.current);
  }, [clubs]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${index * 100}%)`;
    }
  }, [index]);

  const touchStart = (e) => (startX.current = e.touches[0].clientX);
  const touchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 50) setIndex((prev) => (prev + 1) % clubs.length);
    if (diff < -50) setIndex((prev) => (prev - 1 + clubs.length) % clubs.length);
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__overlay" />
        <div className="home-hero__content">
          <h1>Champions in Spirit, Champions in Action</h1>
          <p>Karnataka Government Polytechnic, Mangaluru Sports Portal</p>
          <div className="home-hero__actions">
            <button type="button" className="hero-btn hero-btn--primary" onClick={() => navigate('/results')}>
              View Results
            </button>
            <button type="button" className="hero-btn hero-btn--outline" onClick={() => navigate('/events')}>
              Explore Events
            </button>
          </div>
        </div>

        {homeContent.banners[currentBannerIndex]?.year && (
          <div className="banner-year">{homeContent.banners[currentBannerIndex].year}</div>
        )}

        <div className="home-hero__scroll-indicator" aria-hidden="true">
          <span>Scroll</span>
          <span className="home-hero__scroll-arrow">v</span>
        </div>
      </section>

      <section className="home-stats">
        {achievements.map((item) => (
          <article key={item.title} className="home-stats__card">
            <h2>{item.value}</h2>
            <p>{item.title}</p>
          </article>
        ))}
      </section>

      <section className="home-announcements">
        <div className="section-header">
          <h2>Latest Announcements</h2>
        </div>
        <div className="announcement-list">
          {announcements.map((announcement) => (
            <p key={announcement}>{announcement}</p>
          ))}
        </div>
      </section>

      <section className="home-sports-categories">
        <div className="section-header">
          <h2>Sports Categories</h2>
        </div>
        <div className="sports-grid">
          {sportsCategories.map((sport) => (
            <article key={sport} className="sports-grid__item">
              <h3>{sport}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="home-story">
        <div className="home-story__media">
          <img src="/KPT 1.png" alt="KPT sports team" />
        </div>
        <div className="home-story__content">
          <h2>Our Story</h2>
          <p>
            KPT Mangaluru Sports Department builds disciplined athletes and confident leaders through structured training,
            competition exposure, and teamwork.
          </p>
          <button type="button" className="hero-btn hero-btn--primary" onClick={() => navigate('/about')}>
            Learn More
          </button>
        </div>
      </section>

      <section className="club-section">
        <h2 className="club-title">Our Clubs & Activities</h2>

        <div className="carousel-container">
          <button className="arrow left" onClick={() => setIndex((index + 1) % clubs.length)}>{'<'}</button>

          <div className="carousel-viewport" onTouchStart={touchStart} onTouchEnd={touchEnd}>
            <div className="carousel-track" ref={trackRef}>
              {clubs.map((club) => (
                <div
                  key={club.id || club.name}
                  className={`club-card ${club.theme}`}
                  onClick={() => window.open(club.url, '_blank')}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>{club.name}</h3>
                  <p>{club.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button className="arrow right" onClick={() => setIndex((index + 1) % clubs.length)}>{'>'}</button>
        </div>

        <div className="dots">
          {clubs.map((_, i) => (
            <span key={i} className={`dot ${index === i ? 'active' : ''}`} onClick={() => setIndex(i)} />
          ))}
        </div>
      </section>

      <section className="home-gallery-preview">
        <div className="section-header">
          <h2>Photo Gallery Preview</h2>
        </div>
        <div className="gallery-grid">
          <img src="/Gallery2.jpg" alt="Sports gallery preview 1" />
          <img src="/Gallery6.jpg" alt="Sports gallery preview 2" />
          <img src="/Gallery11.jpg" alt="Sports gallery preview 3" />
          <img src="/Gallery14.jpg" alt="Sports gallery preview 4" />
        </div>
      </section>

      <section className="home-events">
        <div className="section-header">
          <h2>Upcoming Events</h2>
        </div>
        <div className="events-grid">
          {upcomingEvents.map((eventItem) => (
            <article key={eventItem.name} className="event-card">
              <h3>{eventItem.name}</h3>
              <p>{eventItem.date}</p>
              <span>{eventItem.venue}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="home-testimonials">
        <div className="section-header">
          <h2>Student Achievements</h2>
        </div>
        <blockquote>
          "KPT Sports gave me the confidence to compete at state level and represent our institution with pride."
        </blockquote>
      </section>
    </div>
  );
}
