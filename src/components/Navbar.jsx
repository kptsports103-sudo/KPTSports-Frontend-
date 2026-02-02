import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="college-navbar">
      {/* College Header */}
      <div className="college-header">
        <div className="header-content">
          <img src="/KPT 2.1.png" alt="Government Emblem" className="logo left" />
          
          <div className="title">
            <h1>KARNATAKA (GOVT.) POLYTECHNIC, MANGALORE</h1>
            <p className="subtitle">(An Autonomous Institution Under AICTE, New Delhi)</p>
            <p className="tagline">— Promoting Academic & Sports Excellence</p>
          </div>

          <img src="/KPT 1.png" alt="KPT Logo" className="logo right" />
        </div>
      </div>
      
      {/* Navigation Bar */}
      <nav className="navbar">
        <ul className="nav-list">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/history">History</Link></li>
          <li><Link to="/events">Events</Link></li>
          <li><Link to="/gallery">Gallery</Link></li>
          <li><Link to="/results">Results</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
