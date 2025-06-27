import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function SingleTicket() {
  const { ticket_id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3000/tickets/${ticket_id}`, { withCredentials: true })
      .then(res => setTicket(res.data))
      .catch(() => setError("Erreur lors du chargement du ticket."));
  }, [ticket_id]);

  const handleSetResult = (winner) => {
    axios.post(`http://localhost:3000/tickets/${ticket_id}/set-result`, { winner }, { withCredentials: true })
      .then(() => {
        alert("Résultat mis à jour.");
        navigate(`/match/${ticket.match_id}`);
      })
      .catch(() => alert("Erreur lors de la mise à jour du résultat."));
  };

  if (error) return <p>{error}</p>;
  if (!ticket) return <p>Chargement...</p>;

  return (
    <div className="page-center">
      <h1>Ticket #{ticket.id}</h1>
      <p><strong>Match :</strong> #{ticket.match_id}</p>
      <p><strong>Équipe :</strong> {ticket.team_name}</p>
      <p><strong>Date prévue :</strong> {new Date(ticket.scheduled_time).toLocaleString()}</p>
      <p><strong>Message :</strong></p>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{ticket.message}</pre>

      <div style={{ marginTop: '20px' }}>
        <h3>Donner la victoire à :</h3>
        <button onClick={() => handleSetResult('team_1')} style={{ marginRight: '10px' }}>
          {ticket.team_1_name}
        </button>
        <button onClick={() => handleSetResult('team_2')}>
          {ticket.team_2_name}
        </button>
      </div>
    </div>
  );
}

export default SingleTicket;
