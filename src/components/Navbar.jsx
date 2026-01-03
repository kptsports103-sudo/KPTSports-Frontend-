import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/history">History</Link></li>
        <li><Link to="/events">Events</Link></li>
        <li><Link to="/gallery">Gallery</Link></li>
        <li><Link to="/achievements">Achievements</Link></li>
        <li><Link to="/results">Results</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;