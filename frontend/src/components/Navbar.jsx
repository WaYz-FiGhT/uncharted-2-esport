import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';
import axios from 'axios';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await axios.post('/auth/logout', null, { withCredentials: true });

      if (res.data.success) {
        setUser(null);
        navigate('/');
      }
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Uncharted Esport</div>
      <button
        className="navbar-toggler"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        &#9776;
      </button>
      <ul className={`navbar-links ${menuOpen ? 'show' : ''}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/rules">Rules</Link></li>

        {user ? (
          <>
            <li><Link to="/mes-equipes">My test teams</Link></li>
            <li><Link to="/create-team">Create a team</Link></li>
            <li><Link to="/invitations">Invitations</Link></li>
            {user.is_admin === true && <li><Link to="/tickets">Tickets</Link></li>}
            <li className="navbar-welcome">
              <Link to={`/profile/${user.username}`}>{user.username}</Link>
            </li>
            <li>
              <span onClick={handleLogout} className="navbar-button">
                Logout
              </span>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
