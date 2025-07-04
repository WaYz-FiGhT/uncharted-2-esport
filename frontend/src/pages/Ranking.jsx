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
      .catch(() => setMessage('Error loading ranking.'));
  }, [ladder_id]);

  return (
    <div className="page-center ranking-page">
      <div className="page-content ranking-page">
        <h1>Ranking</h1>
        {teams.length > 0 ? (
        <ol>
          {teams.map((team, index) => (
              <li key={team.id}>
                {index + 1}.{' '}
                {team.team_picture_url && (
                  <img src={team.team_picture_url} alt="team" style={{ width: '30px', verticalAlign: 'middle', marginRight: '5px' }} />
                )}
                <Link to={`/team/${team.id}`}>{team.name}</Link> — {team.wins}W / {team.losses}L — <span className="xp-yellow">{team.xp} XP</span>
              </li>
          ))}
        </ol>
        ) : (
          <p>{message || 'No teams found.'}</p>
        )}
      </div>
    </div>
  );
}

export default Ranking;