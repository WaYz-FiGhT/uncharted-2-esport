import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function AddMember() {
  const { team_id, ladder_id } = useParams();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  if (ladder_id === '3') {
    return (
      <div className="container">
        <div className="page-content">
          <p>You cannot add members to a 1vs1 team.</p>
        </div>
      </div>
    );
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const playerRes = await axios.get(`/teams/get_playerid?name=${username}`);

      const player = playerRes.data[0];

      if (!player?.id) {
        setMessage('No player found with that name.');
        return;
      }

      const res = await axios.post('/teams/invite', {
        team_id,
        player_id: player.id,
        ladder_id
      });

      if (res.status === 201) {
        setMessage('Invitation sent!');
        setUsername('');
      } else {
        setMessage(res.data.error || 'Error.');
      }
    } catch (err) {
      setMessage('impossable to add this player (already in a team, already in your team).');
    }
  };

  return (
    <div className="container">
      <div className="page-content">
        <h1>Add member</h1>
        <form onSubmit={handleSubmit}>
          <label>Player name:</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          <button type="submit">Add</button>
          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default AddMember;
