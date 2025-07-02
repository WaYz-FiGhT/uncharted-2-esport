import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function AddMember() {
  const { team_id, ladder_id } = useParams();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const playerRes = await axios.get(`http://localhost:3000/teams/get_playerid?name=${username}`, { withCredentials: true });

      const player = playerRes.data[0];

      if (!player?.id) {
        setMessage('No player found with that name.');
        return;
      }

      const res = await axios.post('http://localhost:3000/teams/invite', {
        team_id,
        player_id: player.id,
        ladder_id
      }, { withCredentials: true });

      if (res.status === 201) {
        setMessage('Invitation sent!');
        setUsername('');
      } else {
        setMessage(res.data.error || 'Error.');
      }
    } catch (err) {
      setMessage('Request error.');
    }
  };

  return (
    <div className="container">
      <div className="page-content">
        <h1>Add member</h1>
        <h2>{ladder_id}</h2>
        <form onSubmit={handleSubmit}>
          <label>Player name:</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          <button type="submit">Add</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default AddMember;
