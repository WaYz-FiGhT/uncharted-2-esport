import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

function PostMatch() {
  const { team_id, ladder_id } = useParams();
  const [match_game_mode, setGameMode] = useState('');
  const [boFormat, setBoFormat] = useState('bo3');
  const [members, setMembers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const minPlayers =
    ladder_id === '1' ? 2 : ladder_id === '2' ? 3 : 1;
  const maxPlayers =
    ladder_id === '1' ? 2 : ladder_id === '2' ? 5 : 1;
  const [playerNumber, setPlayerNumber] = useState(minPlayers);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Vérifie que l'utilisateur est connecté
  useEffect(() => {
    axios.get('http://localhost:3000/session-info', { withCredentials: true })
      .then(res => setUserId(res.data.id))
      .catch(() => navigate('/login'));
  }, [navigate]);

  // Récupère les membres de l'équipe
  useEffect(() => {
    axios.get(`http://localhost:3000/teams/members?team_id=${team_id}`, { withCredentials: true })
      .then(res => setMembers(res.data))
      .catch(() => setMessage("Erreur lors de la récupération des membres."));
  }, [team_id]);

  // Ajoute ou enlève un joueur à la sélection
  const togglePlayer = (playerId) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!match_game_mode) {
      setMessage("Veuillez sélectionner un mode.");
      return;
    }

    if (playerNumber < minPlayers || playerNumber > maxPlayers) {
      if (minPlayers === maxPlayers) {
        setMessage(`Le nombre de joueurs doit être de ${minPlayers}.`);
      } else {
        setMessage(`Le nombre de joueurs doit être compris entre ${minPlayers} et ${maxPlayers}.`);
      }
      return;
    }

    if (selectedPlayers.length < playerNumber) {
      setMessage(`Veuillez sélectionner au moins ${playerNumber} joueurs.`);
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/matches/create', {
        team_1_id: team_id,
        ladder_id,
        match_game_mode,
        match_format: boFormat,
        player_number: playerNumber,
        selectedPlayers
      }, { withCredentials: true });

      if (res.status === 201) {
        setMessage("Match posté avec succès !");
        setSelectedPlayers([]);
        setGameMode('');
        setBoFormat('bo3');
        setPlayerNumber(minPlayers);
      } else {
        setMessage(res.data.error || "Erreur inconnue.");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Erreur lors de l'envoi du match.");
    }
  };

  return (
    <div className="page-center">
      <div className="page-content">
        <h1>Poster un match</h1>
        <form onSubmit={handleSubmit}>
        <label>Mode de jeu :</label>
        <select value={match_game_mode} onChange={(e) => setGameMode(e.target.value)} required>
          <option value="">-- Choisissez un mode --</option>
          <option value="TDM Only">TDM Only</option>
          <option value="Mixte mode">Mixte mode</option>
          <option value="Plunder Only">Plunder Only</option>
        </select>

        <label>Format du match :</label>
        <select value={boFormat} onChange={(e) => setBoFormat(e.target.value)} required>
          <option value="bo3">Bo3</option>
          <option value="bo5">Bo5</option>
        </select>

        <label>Nombre minimum de joueurs :</label>
        <input
          type="number"
          min={minPlayers}
          max={maxPlayers}
          value={playerNumber}
          onChange={(e) => setPlayerNumber(parseInt(e.target.value, 10))}
          required
        />

       <label>Choisissez les joueurs pour ce match :</label>
        {members.length > 0 ? (
          <ul>
            {members.map(player => (
              <li key={player.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(player.id)}
                    onChange={() => togglePlayer(player.id)}
                  />
                  {player.username}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun joueur trouvé.</p>
        )}

        <button type="submit">Poster le match</button>
      </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default PostMatch;
