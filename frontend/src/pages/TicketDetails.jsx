import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function TicketDetails() {
  const { ticket_id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [resultUpdated, setResultUpdated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3000/tickets/get_single/${ticket_id}`, { withCredentials: true })
      .then(res => setTicket(res.data))
      .catch(() => setError('Error loading ticket.'));
  }, [ticket_id]);

  const handleSetResult = (winner) => {
    axios.post(`http://localhost:3000/tickets/get_single/${ticket_id}/set-result`, { winner }, { withCredentials: true })
      .then(() => {
        setResultUpdated(true);
        alert('Result updated!');
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
      <p>
        <strong>Team:</strong>{' '}
        <Link to={`/team/${ticket.team_id}`}>{ticket.team_name}</Link>
      </p>
      <p><strong>Match date:</strong> {new Date(ticket.scheduled_time).toLocaleString()}</p>
      <p><strong>Sent date:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
      <h3>Message :</h3>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{ticket.message}</pre>

      {!resultUpdated && (
        <div style={{ marginTop: '30px' }}>
          <h4>Award victory to:</h4>
          <button
            onClick={() => handleSetResult('team_1')}
            style={{ marginRight: '10px' }}
          >
            {ticket.team_1_name}
          </button>
          <Link to={`/team/${ticket.team_1_id}`}>view team</Link>
          <button
            onClick={() => handleSetResult('team_2')}
            style={{ marginLeft: '10px', marginRight: '10px' }}
          >
            {ticket.team_2_name}
          </button>
            {ticket.team_2_id && (
            <Link to={`/team/${ticket.team_2_id}`}>view team</Link>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default TicketDetails;
