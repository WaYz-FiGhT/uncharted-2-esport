import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import axios from 'axios';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.post('http://localhost:3000/auth/logout', {}, {
        withCredentials: true,
      });

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
      <div className="navbar-brand">Uncharted 2 Esport</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>

        {user ? (
          <>
            <li><Link to="/mes-equipes">My teams</Link></li>
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
