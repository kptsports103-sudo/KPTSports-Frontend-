import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaUsers, FaCalendarCheck, FaMedal } from 'react-icons/fa';
import api from '../services/api';
import './Home.css';

const defaultHomeContent = {
  heroTitle: 'Champions in Spirit, Champions in Action',
  heroSubtitle: 'Karnataka Government Polytechnic, Mangaluru Sports Portal',
  heroButtons: [
    { text: 'View Results', link: '/results' },
    { text: 'Explore Events', link: '/events' }
  ],
  banners: [{ image: '/Gallery1.jpg', year: String(new Date().getFullYear()) }],
  achievements: [
    { title: 'Total Prizes Won', value: '110+', icon: 'trophy' },
    { title: 'Active Players', value: '21', icon: 'users' },
    { title: 'Sports Meets Conducted', value: '45', icon: 'calendar' },
    { title: 'Years of Excellence', value: '12', icon: 'medal' }
  ],
  sportsCategories: [
    { name: 'Football', image: '/Gallery3.jpg' },
    { name: 'Cricket', image: '/Gallery7.jpg' },
    { name: 'Athletics', image: '/Track1.jpg' },
    { name: 'Volleyball', image: '/Gallery13.jpg' },
    { name: 'Indoor Games', image: '/Chess1.jpg' },
    { name: 'Throw Events', image: '/Throws1.jpg' }
  ],
  gallery: [
    { image: '/Gallery2.jpg', caption: 'Track Sprint Final' },
    { image: '/Gallery6.jpg', caption: 'Championship Relay' },
    { image: '/Gallery11.jpg', caption: 'Team Celebration' },
    { image: '/Gallery14.jpg', caption: 'Victory Moments' }
  ],
  upcomingEvents: [
    { name: 'Annual Sports Meet', date: 'March 15, 2026', venue: 'Main Ground', image: '/Gallery10.jpg' },
    { name: 'Inter-Polytechnic Volleyball', date: 'April 3, 2026', venue: 'Indoor Court', image: '/Gallery16.jpg' }
  ],
  clubs: [
    { name: 'KPT College', url: '/college', description: 'Excellence in technical education and sports.', theme: 'college', image: '/KPT 2.png' },
    { name: 'Eco Club', url: '/clubs/eco-club', description: 'Environmental awareness and sustainable practices.', theme: 'purple', image: '/Gallery5.jpg' },
    { name: 'NCC', url: '/clubs/ncc', description: 'Discipline, service, and leadership training.', theme: 'pink', image: '/Gallery8.jpg' },
    { name: 'Yoga Club', url: '/clubs/yoga-club', description: 'Physical and mental well-being through yoga.', theme: 'blue', image: '/Yoga1.jpg' }
  ],
  announcements: [
    'Inter-department athletics trials are open for all first-year students.',
    'Team registration for the annual sports meet closes on March 8, 2026.',
    'Updated result sheets are available in the Results section.'
  ]
};

const normalizeHomeContent = (raw) => {
  if (!raw || Object.keys(raw).length === 0) return defaultHomeContent;

  const heroButtons = (raw.heroButtons ?? defaultHomeContent.heroButtons).map((button, i) => ({
    text: button?.text ?? defaultHomeContent.heroButtons[i]?.text ?? 'Action',
    link: button?.link ?? defaultHomeContent.heroButtons[i]?.link ?? '/'
  }));

  const banners = (raw.banners ?? []).map((b) => ({
    image: b?.image ?? b?.video ?? '',
    year: String(b?.year ?? '')
  }));

  const clubs = (raw.clubs ?? []).map((club, i) => ({
    id: club.id ?? i + 1,
    name: club.name ?? 'Unknown Club',
    url: club.url ?? '#',
    description: club.description ?? 'Club activities and information',
    theme: club.theme ?? 'blue',
    image: club.image ?? '/Gallery1.jpg'
  }));

  return {
    heroTitle: raw.heroTitle ?? defaultHomeContent.heroTitle,
    heroSubtitle: raw.heroSubtitle ?? defaultHomeContent.heroSubtitle,
    heroButtons: heroButtons.length ? heroButtons : defaultHomeContent.heroButtons,
    banners: banners.length ? banners : defaultHomeContent.banners,
    achievements: (raw.achievements ?? defaultHomeContent.achievements).map((x) => ({
      title: x?.title ?? 'Metric',
      value: x?.value ?? '0',
      icon: x?.icon ?? 'trophy'
    })),
    sportsCategories: (raw.sportsCategories ?? defaultHomeContent.sportsCategories).map((x) => ({
      name: x?.name ?? 'Sport',
      image: x?.image ?? '/Gallery1.jpg'
    })),
    gallery: (raw.gallery ?? defaultHomeContent.gallery).map((x) => ({
      image: x?.image ?? '/Gallery1.jpg',
      caption: x?.caption ?? 'Gallery Item'
    })),
    upcomingEvents: (raw.upcomingEvents ?? defaultHomeContent.upcomingEvents).map((x) => ({
      name: x?.name ?? 'Event',
      date: x?.date ?? '',
      venue: x?.venue ?? '',
      image: x?.image ?? '/Gallery1.jpg'
    })),
    clubs: clubs.length ? clubs : defaultHomeContent.clubs,
    announcements: (raw.announcements ?? defaultHomeContent.announcements).filter(Boolean)
  };
};

export default function Home() {
  const navigate = useNavigate();
  const clubsScrollRef = useRef(null);
  const [homeContent, setHomeContent] = useState(defaultHomeContent);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const activeBanner = homeContent.banners[currentBannerIndex] || homeContent.banners[0];
  const heroImage = activeBanner?.image || '/Gallery1.jpg';
  const visibleYear = activeBanner?.year || String(new Date().getFullYear());
  const heroButtons = homeContent.heroButtons.slice(0, 2);
  const statIconMap = {
    trophy: FaTrophy,
    users: FaUsers,
    calendar: FaCalendarCheck,
    medal: FaMedal
  };

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    try {
      const res = await api.get('/home');
      setHomeContent(normalizeHomeContent(res.data));
    } catch (error) {
      console.error('Error fetching home content:', error);
      setHomeContent(defaultHomeContent);
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
            <h1>{homeContent.heroTitle}</h1>
            <p>{homeContent.heroSubtitle}</p>
            <div className="home-hero__actions">
              {heroButtons.map((button) => (
                <button
                  key={`${button.text}-${button.link}`}
                  type="button"
                  className={`hero-btn ${button === heroButtons[0] ? 'hero-btn--primary' : 'hero-btn--outline'}`}
                  onClick={() => navigate(button.link || '/')}
                >
                  {button.text}
                </button>
              ))}
            </div>
          </div>
          <div className="home-hero__media" aria-hidden="true">
            <img src={heroImage} alt="" />
          </div>
        </div>

        <div className="home-hero__stats">
          {homeContent.achievements.map((item, index) => (
            <article key={item.title} className="home-hero__stats-card">
              <div className="stat-icon">
                {(() => {
                  const fallbackKeys = ['trophy', 'users', 'calendar', 'medal'];
                  const Icon = statIconMap[item.icon] || statIconMap[fallbackKeys[index % fallbackKeys.length]] || FaTrophy;
                  return <Icon />;
                })()}
              </div>
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
          {homeContent.announcements.map((announcement) => (
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
          {homeContent.sportsCategories.map((sport) => (
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
            {homeContent.clubs.map((club) => (
              <article
                key={club.id || club.name}
                className={`club-card club-card--glass ${club.theme || 'blue'}`}
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
        <div className="section-header section-header--with-action">
          <h2>Photo Gallery Preview</h2>
          <button
            type="button"
            className="section-view-more"
            onClick={() => navigate('/gallery')}
          >
            View More
          </button>
        </div>
        <div className="gallery-grid">
          {homeContent.gallery.map((item) => (
            <figure key={`${item.caption}-${item.image}`} className="gallery-card">
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
          {homeContent.upcomingEvents.map((eventItem) => (
            <article key={`${eventItem.name}-${eventItem.date}`} className="event-card">
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
