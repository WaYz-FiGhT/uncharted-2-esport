import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function SingleTicket() {
  const { ticket_id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/tickets/${ticket_id}`)
      .then(res => setTicket(res.data))
      .catch(() => setError('Error loading ticket.'));
  }, [ticket_id]);

  const handleSetResult = (winner) => {
    axios.post(`/tickets/${ticket_id}/set-result`, { winner })
      .then(() => {
        alert('Result updated.');
        navigate(`/match/${ticket.match_id}`);
      })
      .catch(() => alert('Error updating result.'));
  };

  if (error) return <p>{error}</p>;
  if (!ticket) return <p>Loading...</p>;

  return (
    <div className="page-center">
      <div className="page-content">
        <h1>Ticket #{ticket.id}</h1>
      <p><strong>Match :</strong> #{ticket.match_id}</p>
      <p>
        <strong>Team:</strong>{' '}
        <Link to={`/team/${ticket.team_id}`}>{ticket.team_name}</Link>
      </p>
      <p><strong>Scheduled date:</strong> {new Date(ticket.scheduled_time).toLocaleString()}</p>
      <p><strong>Message :</strong></p>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{ticket.message}</pre>

      <div style={{ marginTop: '20px' }}>
        <h3>Award victory to:</h3>
        <button onClick={() => handleSetResult('team_1')} style={{ marginRight: '10px' }}>
          {ticket.team_1_name}
        </button>
        <Link to={`/team/${ticket.team_1_id}`}>view team</Link>
        <button onClick={() => handleSetResult('team_2')} style={{ marginLeft: '10px', marginRight: '10px' }}>
          {ticket.team_2_name}
        </button>
          {ticket.team_2_id && (
          <Link to={`/team/${ticket.team_2_id}`}>view team</Link>
        )}
      </div>
      </div>
    </div>
  );
}

export default SingleTicket;
