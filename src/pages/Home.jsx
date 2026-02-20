import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaMedal, FaTrophy, FaUsers } from 'react-icons/fa';
import api from '../services/api';
import './Home.css';

const createEmptyHomeContent = () => ({
  heroTitle: '',
  heroSubtitle: '',
  heroButtons: [],
  banners: [],
  achievements: [],
  sportsCategories: [],
  gallery: [],
  upcomingEvents: [],
  clubs: [],
  announcements: []
});

const iconMap = {
  trophy: FaTrophy,
  users: FaUsers,
  calendar: FaCalendarCheck,
  medal: FaMedal
};

const fallbackIcons = [FaTrophy, FaUsers, FaCalendarCheck, FaMedal];

function Home() {
  const navigate = useNavigate();
  const clubsTrackRef = useRef(null);
  const [content, setContent] = useState(createEmptyHomeContent());
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const response = await api.get('/home');
        const data = response?.data ?? {};
        setContent({
          heroTitle: data.heroTitle ?? '',
          heroSubtitle: data.heroSubtitle ?? '',
          heroButtons: Array.isArray(data.heroButtons) ? data.heroButtons : [],
          banners: Array.isArray(data.banners) ? data.banners : [],
          achievements: Array.isArray(data.achievements) ? data.achievements : [],
          sportsCategories: Array.isArray(data.sportsCategories) ? data.sportsCategories : [],
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
          upcomingEvents: Array.isArray(data.upcomingEvents) ? data.upcomingEvents : [],
          clubs: Array.isArray(data.clubs) ? data.clubs : [],
          announcements: Array.isArray(data.announcements) ? data.announcements : []
        });
      } catch (error) {
        console.error('Failed to fetch home content:', error);
        setContent(createEmptyHomeContent());
      }
    };

    fetchHomeContent();
  }, []);

  useEffect(() => {
    if (!Array.isArray(content.banners) || content.banners.length <= 1) {
      setCurrentBannerIndex(0);
      return undefined;
    }

    const id = window.setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % content.banners.length);
    }, 5000);

    return () => window.clearInterval(id);
  }, [content.banners]);

  const activeBanner = content.banners[currentBannerIndex] ?? null;
  const heroImage = activeBanner?.image || content.gallery[0]?.image || '';

  const routeTo = (link) => {
    if (!link) return;
    if (link.startsWith('/')) {
      navigate(link);
      return;
    }
    window.location.href = link;
  };

  const scrollClubs = (direction) => {
    if (!clubsTrackRef.current) return;
    clubsTrackRef.current.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  return (
    <main className="home-page">
      <section id="hero" className="home-hero">
        <div className="home-hero__overlay" />
        <div className="home-hero__lights" />
        {activeBanner?.year ? <span className="banner-year">{activeBanner.year}</span> : null}

        <div className="home-hero__layout">
          <div className="home-hero__content">
            <p style={{ margin: 0, fontSize: '14px', letterSpacing: '1px', fontWeight: 700, opacity: 0.9 }}>
              KPT Sports Home
            </p>
            <h1>{content.heroTitle}</h1>
            <p>{content.heroSubtitle}</p>

            {content.heroButtons.length > 0 ? (
              <div className="home-hero__actions">
                {content.heroButtons.slice(0, 2).map((button, index) => (
                  <button
                    key={`${button.text}-${index}`}
                    className={`hero-btn ${index === 0 ? 'hero-btn--primary' : 'hero-btn--outline'}`}
                    type="button"
                    onClick={() => routeTo(button.link)}
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {heroImage ? (
            <div className="home-hero__media">
              <img src={heroImage} alt="Sports highlight" />
            </div>
          ) : null}
        </div>

        {content.achievements.length > 0 ? (
          <div className="home-hero__stats">
            {content.achievements.map((item, index) => {
              const Icon = iconMap[item?.icon] || fallbackIcons[index % fallbackIcons.length];
              return (
                <article key={`${item.title}-${index}`} className="home-hero__stats-card">
                  <div className="stat-icon">
                    <Icon />
                  </div>
                  <h2>{item.value}</h2>
                  <p>{item.title}</p>
                </article>
              );
            })}
          </div>
        ) : null}

        <div className="home-hero__scroll-indicator">
          <span>Scroll</span>
          <span className="home-hero__scroll-arrow">v</span>
        </div>
      </section>

      {content.announcements.length > 0 ? (
        <section id="announcements" className="section-shell">
          <header className="section-header">
            <h2>Latest Announcements</h2>
          </header>
          <div className="announcement-list">
            {content.announcements.map((announcement, index) => (
              <article key={`${announcement}-${index}`} className="announcement-item">
                <span className="announcement-dot" />
                <p>{announcement}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {content.sportsCategories.length > 0 ? (
        <section id="sports-categories" className="section-shell">
          <header className="section-header">
            <h2>Sports Categories</h2>
          </header>
          <div className="sports-grid">
            {content.sportsCategories.map((category, index) => (
              <article key={`${category.name}-${index}`} className="sports-grid__item">
                <img src={category.image} alt={category.name} />
                <div className="sports-grid__overlay" />
                <h3>{category.name}</h3>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {content.clubs.length > 0 ? (
        <section id="clubs" className="section-shell club-section">
          <header className="section-header">
            <h2>Clubs and Activities</h2>
          </header>
          <div className="clubs-carousel-shell">
            <button className="arrow" type="button" onClick={() => scrollClubs(-1)}>
              {'<'}
            </button>
            <div className="clubs-carousel" ref={clubsTrackRef}>
              {content.clubs.map((club, index) => (
                <article key={`${club.name}-${index}`} className="club-card" onClick={() => routeTo(club.url)}>
                  {club.image ? <img src={club.image} alt={club.name} /> : null}
                  <div className="club-card__body">
                    <h3>{club.name}</h3>
                    <p>{club.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <button className="arrow" type="button" onClick={() => scrollClubs(1)}>
              {'>'}
            </button>
          </div>
        </section>
      ) : null}

      {content.gallery.length > 0 ? (
        <section id="gallery" className="section-shell">
          <header className="section-header section-header--with-action">
            <h2>Photo Gallery Preview</h2>
            <button className="section-view-more" type="button" onClick={() => navigate('/gallery')}>
              View More
            </button>
          </header>
          <div className="gallery-grid">
            {content.gallery.slice(0, 8).map((item, index) => (
              <figure key={`${item.image}-${index}`} className="gallery-card">
                <img src={item.image} alt={item.caption || `Gallery ${index + 1}`} />
                {item.caption ? <figcaption>{item.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {content.upcomingEvents.length > 0 ? (
        <section id="events" className="section-shell">
          <header className="section-header">
            <h2>Upcoming Events</h2>
          </header>
          <div className="events-grid">
            {content.upcomingEvents.map((event, index) => (
              <article key={`${event.name}-${index}`} className="event-card">
                {event.image ? <img src={event.image} alt={event.name} /> : null}
                <div className="event-card__body">
                  <h3>{event.name}</h3>
                  {event.date ? (
                    <p>
                      <span className="event-icon">DT</span>
                      {event.date}
                    </p>
                  ) : null}
                  {event.venue ? <span>{event.venue}</span> : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default Home;
