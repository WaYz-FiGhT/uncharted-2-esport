import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function CreateTeam() {
  const [name, setName] = useState('');
  const [ladderId, setLadderId] = useState('');
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Vérifie la session
  useEffect(() => {
    axios.get('http://localhost:3000/session-info', { withCredentials: true })
      .then(res => setUserId(res.data.id))
      .catch(() => navigate('/login'));
  }, [navigate]);

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !ladderId) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/teams/create', {
        name,
        user_id: userId,
        ladder_id: ladderId
      }, { withCredentials: true });

      if (res.status === 201) {
        setMessage('Team created successfully.');
        setName('');
        setLadderId('');
      } else {
        setMessage(res.data.error || 'Erreur lors de la création.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur réseau lors de la création.';
      setMessage(errorMsg);
    }
  };

  return (
    <div className="page-center">
      <div className="page-content">
        <h1>Créer une équipe</h1>

      <form onSubmit={handleSubmit}>
        <label>Nom de l’équipe :</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nom d'équipe"
          required
        />

        <label>Ladder :</label>
        <select value={ladderId} onChange={e => setLadderId(e.target.value)} required>
          <option value="">-- Choisissez un ladder --</option>
          <option value="1">Uncharted 2 - 2vs2</option>
          <option value="2">Uncharted 2 - 3vs3, 4vs4, 5vs5</option>
          <option value="3">Uncharted 2 - 1vs1</option>
        </select>

        <button type="submit">Créer</button>
      </form>

      {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default CreateTeam;
