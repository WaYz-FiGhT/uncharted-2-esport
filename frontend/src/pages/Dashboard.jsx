import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Dashboard() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/session-info', { withCredentials: true })
      .then(res => {
        setUsername(res.data.username);
      })
      .catch(() => {
        navigate('/login'); // Redirige si non connecté
      });
  }, [navigate]);

  return (
    <div className="page-center">
      <p>Bienvenue, {username} !</p>

      <div>
        <button onClick={() => navigate('/create-team')}>Créer ta team</button>
      </div>
      <div>
        <button onClick={() => navigate('/mes-equipes')}>Voir mes équipes</button>
      </div>
    </div>
  );
}

export default Dashboard;
