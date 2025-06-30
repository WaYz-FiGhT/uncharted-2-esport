import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Ranking() {
  const { ladder_id } = useParams();
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/teams/ranking', { params: { ladder_id } })
      .then(res => setTeams(res.data))
      .catch(() => setMessage('Erreur lors du chargement du classement.'));
  }, [ladder_id]);

  return (
    <div className="page-center">
      <div className="page-content">
        <h1>Classement</h1>
        {teams.length > 0 ? (
        <ol>
          {teams.map((team, index) => (
            <li key={team.id}>
              {index + 1}. <Link to={`/team/${team.id}`}>{team.name}</Link> — {team.wins}W / {team.losses}L — {team.xp} XP
            </li>
          ))}
        </ol>
        ) : (
          <p>{message || 'Aucune équipe trouvée.'}</p>
        )}
      </div>
    </div>
  );
}

export default Ranking;