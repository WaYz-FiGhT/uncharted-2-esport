import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function ReportMatch() {
  const { match_id, team_id } = useParams(); // 🧩 Nécessite que l'URL contienne /report/:match_id/:team_id
  const [selectedResult, setSelectedResult] = useState('');
  const [message, setMessage] = useState('');
  const [match, setMatch] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/matches/details/${match_id}`, { withCredentials: true })
      .then(res => setMatch(res.data))
      .catch(() => setMessage("Erreur lors de la récupération du match."));
  }, [match_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResult) {
      setMessage("Veuillez sélectionner un résultat.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/matches/report', {
        match_id,
        team_id,
        result: selectedResult
      }, { withCredentials: true });

      if (res.data.success) {
        setMessage("Résultat envoyé avec succès !");
      } else {
        setMessage(res.data.error || "Erreur lors de l'envoi.");
      }
    } catch (err) {
      setMessage("Erreur lors de l'envoi du résultat.");
    }
  };

  return (
    <div className="page-center">
      <div className="page-content">
        <h1>Reporter le résultat</h1>

      {match && (
        <>
          <p>
            <strong>Match :</strong>{' '}
            <Link to={`/team/${match.team_1_id}`}>{match.team_1_name}</Link> vs{' '}
            {match.team_2_name ? (
              <Link to={`/team/${match.team_2_id}`}>{match.team_2_name}</Link>
            ) : (
              '???'
            )}
          </p>
          <p><strong>Status actuel :</strong> {match.status}</p>
        </>
      )}

        <form onSubmit={handleSubmit}>
        <label>Résultat :</label>
        <select value={selectedResult} onChange={e => setSelectedResult(e.target.value)} required>
          <option value="">-- Choisissez --</option>
          <option value="win">Win</option>
          <option value="lose">Lose</option>
          <option value="disputed">Disputed</option>
        </select>
        <button type="submit">Envoyer</button>
      </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default ReportMatch;
