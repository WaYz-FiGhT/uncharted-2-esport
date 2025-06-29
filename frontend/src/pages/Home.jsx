import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Home() {
  const navigate = useNavigate();
  const [ladder1, setLadder1] = useState([]);
  const [ladder2, setLadder2] = useState([]);
  const [message1, setMessage1] = useState('');
  const [message2, setMessage2] = useState('');

    useEffect(() => {
    axios
      .get('http://localhost:3000/teams/ranking', { params: { ladder_id: 1 } })
      .then((res) => setLadder1(res.data))
      .catch(() => setMessage1('Erreur lors du chargement du classement.'));

    axios
      .get('http://localhost:3000/teams/ranking', { params: { ladder_id: 2 } })
      .then((res) => setLadder2(res.data))
      .catch(() => setMessage2('Erreur lors du chargement du classement.'));
  }, []);


  return (
    <div className="page-center">
      <div className="page-content">
        <h1>Classements</h1>
        <div className="ladder-container">
          <div className="ladder-block">
            <h2>Ladder 1</h2>
            {ladder1.length > 0 ? (
              <ol>
                {ladder1.map((team, index) => (
                  <li key={team.id}>
                    {index + 1}. <Link to={`/team/${team.id}`}>{team.name}</Link> — {team.xp} XP
                  </li>
                ))}
              </ol>
            ) : (
              <p>{message1 || 'Aucune équipe trouvée.'}</p>
            )}
          </div>
          <div className="ladder-block">
            <h2>Ladder 2</h2>
            {ladder2.length > 0 ? (
              <ol>
                {ladder2.map((team, index) => (
                  <li key={team.id}>
                    {index + 1}. <Link to={`/team/${team.id}`}>{team.name}</Link> — {team.xp} XP
                  </li>
                ))}
              </ol>
            ) : (
              <p>{message2 || 'Aucune équipe trouvée.'}</p>
            )}
          </div>
        </div>
        <h2>Créer son profil</h2>
        <button onClick={() => navigate('/register')}>S'inscrire</button>
        <button onClick={() => navigate('/login')}>Se connecter</button>
      </div>
    </div>
  );
}

export default Home;
