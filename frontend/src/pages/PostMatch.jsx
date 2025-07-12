import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

  useEffect(() => {
    if (ladder_id === '3') {
      setGameMode('TDM Only');
      setBoFormat('bo1');
    }
  }, [ladder_id]);

  // Vérifie que l'utilisateur est connecté
  useEffect(() => {
    axios.get('/session-info')
      .then(res => setUserId(res.data.id))
      .catch(() => navigate('/login'));
  }, [navigate]);

  // Récupère les membres de l'équipe
  useEffect(() => {
    axios.get(`/teams/members?team_id=${team_id}`)
      .then(res => setMembers(res.data))
      .catch(() => setMessage('Error retrieving members.'));
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
      setMessage('Please select a mode.');
      return;
    }

    if (playerNumber < minPlayers || playerNumber > maxPlayers) {
      if (minPlayers === maxPlayers) {
        setMessage(`Player count must be ${minPlayers}.`);
      } else {
        setMessage(`Player count must be between ${minPlayers} and ${maxPlayers}.`);
      }
      return;
    }

    if (selectedPlayers.length < playerNumber) {
      setMessage(`Please select at least ${playerNumber} players.`);
      return;
    }

    try {
      const res = await axios.post('/matches/create', {
        team_1_id: team_id,
        ladder_id,
        match_game_mode,
        match_format: boFormat,
        player_number: playerNumber,
        selectedPlayers
      });

      if (res.status === 201) {
        setMessage('Match posted successfully!');
        setSelectedPlayers([]);
        setGameMode(ladder_id === '3' ? 'TDM Only' : '');
        setBoFormat(ladder_id === '3' ? 'bo1' : 'bo3');
        setPlayerNumber(minPlayers);
        navigate(`/team/${team_id}`);
      } else {
        setMessage(res.data.error || 'Unknown error.');
      }
    } catch (err) {
        setMessage(err.response?.data?.error || 'Error sending match.');
    }
  };

  return (
    <div className="container">
      <div className="page-content">
        <h1>Post a match</h1>
        <form onSubmit={handleSubmit}>
        <label>Game mode:</label>
        {ladder_id === '3' ? (
          <select value={match_game_mode} disabled>
            <option value="TDM Only">TDM Only</option>
          </select>
        ) : (
          <select value={match_game_mode} onChange={(e) => setGameMode(e.target.value)} required>
            <option value="">-- Select a mode --</option>
            <option value="TDM Only">TDM Only</option>
            <option value="Mixte mode">Mixed mode</option>
            <option value="Plunder Only">Plunder Only</option>
          </select>
        )}

        <label>Match format:</label>
        <select value={boFormat} onChange={(e) => setBoFormat(e.target.value)} required>
          {ladder_id === '3' && <option value="bo1">Bo1</option>}
          <option value="bo3">Bo3</option>
          {ladder_id !== '3' && <option value="bo5">Bo5</option>}
        </select>

        <label>Choose the number of players for the match</label>
        <input
          type="number"
          min={minPlayers}
          max={maxPlayers}
          value={playerNumber}
          onChange={(e) => setPlayerNumber(parseInt(e.target.value, 10))}
          required
        />

       <label>Select the players who can participate in this match:</label>
        {members.length > 0 ? (
          <ul>
            {members.map(player => (
              <li key={player.id}>
                <label className="player-select-label">
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(player.id)}
                    onChange={() => togglePlayer(player.id)}
                  />
                  <Link
                    to={`/profile/${player.username}`}
                    className="player-select-name"
                  >
                    {player.username}
                  </Link>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p>No players found.</p>
        )}

        <button type="submit">Post match</button>


        {message && <p>{message}</p>}
      </form>
      </div>
    </div>
  );
}

export default PostMatch;
