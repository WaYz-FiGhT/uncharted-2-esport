import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

function AcceptMatch() {
  const { team_id } = useParams(); // team_2_id
  const navigate = useNavigate();

  const [matchInfos, setMatchInfos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState({});

  // Vérifie si l'utilisateur est connecté
  useEffect(() => {
    axios.get('http://localhost:3000/session-info', { withCredentials: true })
      .then(res => setUserId(res.data.id))
      .catch(() => navigate('/login'));
  }, [navigate]);

  // Récupère les matchs en attente
  useEffect(() => {
    if (!team_id) return;
    axios.get('http://localhost:3000/matches/pending', {
      params: { team_id },
      withCredentials: true
    })
      .then(res => setMatchInfos(res.data))
      .catch(() => setMessage("Erreur lors de la récupération des matchs pending."));
  }, [team_id]);

  // Récupère les membres de l'équipe 2
  useEffect(() => {
    axios.get(`http://localhost:3000/teams/members?team_id=${team_id}`, { withCredentials: true })
      .then(res => setTeamMembers(res.data))
      .catch(() => setMessage("Erreur lors de la récupération des membres."));
  }, [team_id]);

  const togglePlayer = (matchId, playerId) => {
    setSelectedPlayers(prev => ({
      ...prev,
      [matchId]: prev[matchId]?.includes(playerId)
        ? prev[matchId].filter(id => id !== playerId)
        : [...(prev[matchId] || []), playerId]
    }));
  };

  const handleAccept = async (team_1_id, match_id, player_count) => {
    const selected = selectedPlayers[match_id] || [];

    if (selected.length < player_count) {
      setMessage(`Veuillez sélectionner au moins ${player_count} joueurs.`);
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/matches/accept', {
        team_1_id,
        team_2_id: team_id,
        selectedPlayers: selected
      }, { withCredentials: true });

      if (res.status === 200) {
        setMessage("Match accepté avec succès !");
        setMatchInfos(prev => prev.filter(match => match.team_1_id !== team_1_id));
      } else {
        setMessage(res.data.error || "Erreur inconnue.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erreur lors de l'acceptation du match.";
      setMessage(errorMsg);
    }
  };
  
  return (
    <div className="page-center">
      <h1>Liste des matchs en attente</h1>

      {message && <p className="error">{message}</p>}

      {matchInfos.length > 0 ? (
        matchInfos.map((match, index) => (
          <div key={index} className="match-block">
            <p>{match.name_games} — {match.name} — {match.status} — {match.match_game_mode} — {match.player_number}</p>

            <label>Choisissez les joueurs :</label>
            <ul>
              {teamMembers.map(player => (
                <li key={player.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedPlayers[match.id]?.includes(player.id) || false}
                      onChange={() => togglePlayer(match.id, player.id)}
                    />
                    {player.username}
                  </label>
                </li>
              ))}
            </ul>

            <button onClick={() => handleAccept(match.team_1_id, match.id, match.player_number)}>Accepter</button>
          </div>
        ))
      ) : (
        <p>Aucun match en attente trouvé.</p>
      )}
    </div>
  );

}

export default AcceptMatch;
