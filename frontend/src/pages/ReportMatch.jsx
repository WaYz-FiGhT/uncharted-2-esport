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
      .catch(() => setMessage('Error loading match.'));
  }, [match_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResult) {
      setMessage('Please select a result.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/matches/report', {
        match_id,
        team_id,
        result: selectedResult
      }, { withCredentials: true });

      if (res.data.success) {
        setMessage('Result submitted successfully!');
      } else {
        setMessage(res.data.error || 'Error sending result.');
      }
    } catch (err) {
      setMessage('Error sending result.');
    }
  };

  return (
    <div className="container">
      <div className="page-content">
        <h1>Report result</h1>

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
        <label>Result:</label>
        <select value={selectedResult} onChange={e => setSelectedResult(e.target.value)} required>
          <option value="">-- Select --</option>
          <option value="win">Win</option>
          <option value="lose">Lose</option>
          <option value="disputed">Disputed</option>
        </select>
        <button type="submit">Submit</button>


        {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default ReportMatch;
