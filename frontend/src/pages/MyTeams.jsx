import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function MyTeams() {
  const [teams, setTeams] = useState([]);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Récupère l'utilisateur connecté
  useEffect(() => {
    axios.get('/session-info')
      .then(res => setUserId(res.data.id))
      .catch(() => setMessage('You must be logged in.'));
  }, []);

  // Récupère ses équipes (capitaine et membre)
  useEffect(() => {
    if (!userId) return;

    const fetchTeams = async () => {
      try {
        const [capRes, memRes] = await Promise.all([
          axios.get(`/teams/by-captain?captain_id=${userId}`),
          axios.get(`/teams/by-member?player_id=${userId}`),
        ]);

        const combined = [...capRes.data, ...memRes.data];
        const uniqueTeams = combined.filter(
          (team, index, self) =>
            index === self.findIndex(t => t.id === team.id)
        );

        if (uniqueTeams.length === 0) {
          setMessage('No teams found.');
        } else {
          const withLadder = await Promise.all(uniqueTeams.map(async team => {
            try {
              const res = await axios.get('/ladders/name', {
                params: { id: team.ladder_id }
              });
              return { ...team, ladder_name: res.data.ladder_name };
            } catch {
              return { ...team, ladder_name: `Ladder ${team.ladder_id}` };
            }
          }));
          setTeams(withLadder);
        }
      } catch {
        setMessage('Error loading teams.');
      }
    };

    fetchTeams();
  }, [userId]);

  const handleView = (teamId) => {
    navigate(`/team/${teamId}`);
  };

  return (
    <div className="page-center myteams">
      <h1>My Teams</h1>
      <div className="members-container">
        <div className="member-row member-header">
          <span>Team Name</span>
          <span>Ladder Name</span>
        </div>
        {teams.map((team) => (
          <div key={team.id} className="member-row">
            <span className="team-name">{team.name || 'Name not available'}</span>
            <span className="ladder-name">{team.ladder_name}</span>
            <button onClick={() => handleView(team.id)}>View</button>
          </div>
        ))}
        {teams.length === 0 && <p>{message}</p>}
      </div>

      {message && teams.length > 0 && <p>{message}</p>}
      </div>
  );
}

export default MyTeams;
