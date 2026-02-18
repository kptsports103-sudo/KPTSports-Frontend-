import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/history', label: 'History' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/results', label: 'Results' }
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const notifyRef = useRef(null);
  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isSolid = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDarkMode(document.body.classList.contains('dark-mode'));
  }, []);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const goToLogin = () => navigate('/login');

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle('dark-mode', next);
  };

  return (
    <>
      <nav className={`kpt-navbar ${isSolid ? 'kpt-navbar--solid' : 'kpt-navbar--transparent'}`}>
        <div
          className="kpt-navbar__logo"
          onClick={() => navigate('/')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
          role="button"
          tabIndex={0}
        >
          <img src="/college-logo-left.png" alt="KPT logo" />
          <span>KPT Sports</span>
        </div>

        <ul className={`kpt-navbar__links ${mobileOpen ? 'is-open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => (isActive ? 'kpt-navbar__link is-active' : 'kpt-navbar__link')}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          <li className="kpt-navbar__mega">
            <button type="button" className="kpt-navbar__link kpt-navbar__mega-trigger">
              Events
            </button>
            <div className="kpt-navbar__mega-menu">
              <div>
                <h4>Sports</h4>
                <button type="button" onClick={() => navigate('/events')}>Football</button>
                <button type="button" onClick={() => navigate('/events')}>Cricket</button>
                <button type="button" onClick={() => navigate('/events')}>Athletics</button>
              </div>
              <div>
                <h4>Indoor</h4>
                <button type="button" onClick={() => navigate('/events')}>Chess</button>
                <button type="button" onClick={() => navigate('/events')}>Carrom</button>
                <button type="button" onClick={() => navigate('/events')}>Table Tennis</button>
              </div>
            </div>
          </li>
        </ul>

        <div className="kpt-navbar__right">
          <button type="button" className="kpt-navbar__icon-btn" onClick={toggleDarkMode} aria-label="Toggle theme">
            {darkMode ? 'Sun' : 'Moon'}
          </button>
          <div className="kpt-navbar__notify" ref={notifyRef}>
            <button
              type="button"
              className="kpt-navbar__icon-btn"
              onClick={() => setNotificationsOpen((v) => !v)}
              aria-label="Notifications"
            >
              Bell
              <span className="kpt-navbar__badge">3</span>
            </button>
            {notificationsOpen && (
              <div className="kpt-navbar__panel">
                <p>Results sheet updated</p>
                <p>2 new event announcements</p>
                <p>Profile reminder pending</p>
              </div>
            )}
          </div>

          <button type="button" className="kpt-navbar__cta" onClick={goToLogin}>
            Login
          </button>
          <button
            type="button"
            className="kpt-navbar__hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? 'X' : 'Menu'}
          </button>
        </div>
      </nav>
      {!isHome && <div className="kpt-navbar__spacer" aria-hidden="true" />}
    </>
  );
};

export default Navbar;
