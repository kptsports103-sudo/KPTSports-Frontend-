import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const clubsScrollRef = useRef(null);
  const [homeContent, setHomeContent] = useState({ welcomeText: '', banners: [{ video: '', year: '' }], highlights: [] });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [clubs, setClubs] = useState([]);

  const announcements = [
    'Inter-department athletics trials are open for all first-year students.',
    'Team registration for the annual sports meet closes on March 8, 2026.',
    'Updated result sheets are available in the Results section.'
  ];

  const achievements = [
    { title: 'Total Prizes', value: '110+' },
    { title: 'Active Players', value: '21' },
    { title: 'Sports Meets', value: '45' },
    { title: 'Years Excellence', value: '12' }
  ];

  const sportsCategories = [
    { name: 'Football', image: '/Gallery3.jpg' },
    { name: 'Cricket', image: '/Gallery7.jpg' },
    { name: 'Athletics', image: '/Track1.jpg' },
    { name: 'Volleyball', image: '/Gallery13.jpg' },
    { name: 'Indoor Games', image: '/Chess1.jpg' },
    { name: 'Throw Events', image: '/Throws1.jpg' }
  ];

  const upcomingEvents = [
    { name: 'Annual Sports Meet', date: 'March 15, 2026', venue: 'Main Ground', image: '/Gallery10.jpg' },
    { name: 'Inter-Polytechnic Volleyball', date: 'April 3, 2026', venue: 'Indoor Court', image: '/Gallery16.jpg' }
  ];
  const visibleYear = homeContent.banners[currentBannerIndex]?.year || String(new Date().getFullYear());
  const galleryItems = [
    { image: '/Gallery2.jpg', caption: 'Track Sprint Final' },
    { image: '/Gallery6.jpg', caption: 'Championship Relay' },
    { image: '/Gallery11.jpg', caption: 'Team Celebration' },
    { image: '/Gallery14.jpg', caption: 'Victory Moments' }
  ];

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
      const clubsData = res.data.clubs || [];
      const processedClubs = clubsData.map((club, i) => ({
        id: club.id || i + 1,
        name: club.name || 'Unknown Club',
        url: club.url || '#',
        description: club.description || 'Club activities and information',
        theme: club.theme || 'blue',
        image: club.image || '/Gallery1.jpg'
      }));
      setClubs(processedClubs);
    } catch (error) {
      console.error('Home.jsx - Error fetching clubs:', error);
      setClubs([
        { id: 1, name: 'KPT College', url: '/college', description: 'Excellence in technical education and sports.', theme: 'college', image: '/KPT 2.png' },
        { id: 2, name: 'Eco Club', url: '/clubs/eco-club', description: 'Environmental awareness and sustainable practices.', theme: 'purple', image: '/Gallery5.jpg' },
        { id: 3, name: 'NCC', url: '/clubs/ncc', description: 'Discipline, service, and leadership training.', theme: 'pink', image: '/Gallery8.jpg' },
        { id: 4, name: 'Yoga Club', url: '/clubs/yoga-club', description: 'Physical and mental well-being through yoga.', theme: 'blue', image: '/Yoga1.jpg' },
        { id: 5, name: 'Youth Red Cross', url: '/clubs/youth-red-cross', description: 'Humanity service and first-aid awareness.', theme: 'yellow', image: '/Gallery11.jpg' },
        { id: 6, name: 'Technical Club', url: '/clubs/technical-club', description: 'Innovation, projects, and technical skill building.', theme: 'orange', image: '/Gallery18.jpg' }
      ]);
    }
  };

  useEffect(() => {
    if (homeContent.banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % homeContent.banners.length);
      }, 3000);
      return () => clearInterval(interval);
    }
    setCurrentBannerIndex(0);
    return undefined;
  }, [homeContent.banners]);

  const scrollClubs = (direction) => {
    if (!clubsScrollRef.current) return;
    clubsScrollRef.current.scrollBy({
      left: direction * 340,
      behavior: 'smooth'
    });
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__overlay" />
        <div className="home-hero__lights" />

        <div className="home-hero__layout">
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
          <div className="home-hero__media" aria-hidden="true">
            <img src="/Gallery1.jpg" alt="" />
          </div>
        </div>

        <div className="home-hero__stats home-hero__stats--floating">
          {achievements.map((item) => (
            <article key={item.title} className="home-hero__stats-card">
              <h2>{item.value}</h2>
              <p>{item.title}</p>
            </article>
          ))}
        </div>

        <div className="banner-year">{visibleYear}</div>

        <div className="home-hero__scroll-indicator" aria-hidden="true">
          <span>Scroll</span>
          <span className="home-hero__scroll-arrow">v</span>
        </div>
      </section>

      <section className="home-announcements section-shell">
        <div className="section-header">
          <h2>Latest Announcements</h2>
        </div>
        <div className="announcement-list">
          {announcements.map((announcement) => (
            <article key={announcement} className="announcement-item">
              <span className="announcement-dot" />
              <p>{announcement}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-sports-categories section-shell">
        <div className="section-header">
          <h2>Sports Categories</h2>
        </div>
        <div className="sports-grid">
          {sportsCategories.map((sport) => (
            <article key={sport.name} className="sports-grid__item">
              <img src={sport.image} alt={sport.name} />
              <div className="sports-grid__overlay" />
              <h3>{sport.name}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="home-story section-shell">
        <div className="home-story__media">
          <img src="/KPT 1.png" alt="KPT sports team" />
        </div>
        <div className="home-story__content">
          <h2>Our Story</h2>
          <p>
            KPT Mangaluru Sports Department develops disciplined athletes and confident leaders through structured training,
            tournament exposure, and strong team culture.
          </p>
          <button type="button" className="hero-btn hero-btn--primary" onClick={() => navigate('/about')}>
            Learn More
          </button>
        </div>
      </section>

      <section className="club-section section-shell">
        <div className="section-header">
          <h2 className="club-title">Our Clubs & Activities</h2>
        </div>
        <div className="clubs-carousel-shell">
          <button className="arrow left" onClick={() => scrollClubs(-1)}>{'<'}</button>
          <div className="clubs-carousel" ref={clubsScrollRef}>
            {clubs.map((club) => (
              <article
                key={club.id || club.name}
                className={`club-card club-card--glass ${club.theme}`}
                onClick={() => window.open(club.url, '_blank')}
              >
                <img src={club.image} alt={club.name} />
                <div className="club-card__body">
                  <h3>{club.name}</h3>
                  <p>{club.description}</p>
                </div>
              </article>
            ))}
          </div>
          <button className="arrow right" onClick={() => scrollClubs(1)}>{'>'}</button>
        </div>
      </section>

      <section className="home-gallery-preview section-shell">
        <div className="section-header">
          <h2>Photo Gallery Preview</h2>
        </div>
        <div className="gallery-grid">
          {galleryItems.map((item) => (
            <figure key={item.caption} className="gallery-card">
              <img src={item.image} alt={item.caption} />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="home-events section-shell">
        <div className="section-header">
          <h2>Upcoming Events</h2>
        </div>
        <div className="events-grid">
          {upcomingEvents.map((eventItem) => (
            <article key={eventItem.name} className="event-card">
              <img src={eventItem.image} alt={eventItem.name} />
              <div className="event-card__body">
                <h3>{eventItem.name}</h3>
                <p>
                  <span className="event-icon">CAL</span>
                  {eventItem.date}
                </p>
                <span>{eventItem.venue}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-testimonials section-shell">
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
