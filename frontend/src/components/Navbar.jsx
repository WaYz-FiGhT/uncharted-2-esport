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
      console.error('Erreur déconnexion', err);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Uncharted 2 Esport</div>
      <ul className="navbar-links">
        <li><Link to="/">Accueil</Link></li>

        {user ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/mes-equipes">Mes équipes</Link></li>
            <li><Link to="/create-team">Créer une team</Link></li>
            {user.is_admin === true && <li><Link to="/tickets">Tickets</Link></li>}
            <li className="navbar-welcome">{user.username}</li>
            <li>
              <span onClick={handleLogout} className="navbar-button">
                Déconnexion
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
