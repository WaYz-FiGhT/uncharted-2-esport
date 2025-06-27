import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function DisputeTickets() {
  const [groupedTickets, setGroupedTickets] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/tickets/create', { withCredentials: true })
      .then(res => {
        const grouped = {};

        res.data.forEach(ticket => {
          const matchId = ticket.match_id;
          if (!grouped[matchId]) {
            grouped[matchId] = {
              scheduled_time: ticket.scheduled_time,
              team_1_name: ticket.team_1_name,
              team_2_name: ticket.team_2_name,
              tickets: []
            };
          }
          grouped[matchId].tickets.push(ticket);
        });

        const sorted = Object.fromEntries(
          Object.entries(grouped).sort(
            ([, a], [, b]) => new Date(b.scheduled_time) - new Date(a.scheduled_time)
          )
        );

        setGroupedTickets(sorted);
      })
      .catch(() => setError("Erreur lors du chargement des tickets."));
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div className="page-center">
      <h1>Tickets de litige</h1>
      {Object.keys(groupedTickets).length === 0 ? (
        <p>Aucun ticket trouvé.</p>
      ) : (
        Object.entries(groupedTickets).map(([matchId, data]) => (
          <div key={matchId} style={{ marginBottom: '30px' }}>
            <h2>Match #{matchId} – {data.team_1_name} vs {data.team_2_name || '???'}</h2>
            <p><strong>Date prévue :</strong> {new Date(data.scheduled_time).toLocaleString()}</p>
            <ul>
              {data.tickets.map(ticket => (
                <li key={ticket.ticket_id} style={{ marginBottom: '15px' }}>
                  <strong>Équipe :</strong> {ticket.ticket_team_name}<br />
                  <strong>Date du ticket :</strong> {new Date(ticket.created_at).toLocaleString()}<br />
                  <Link to={`/ticket/${ticket.ticket_id}`}>
                    <button style={{ marginTop: '5px' }}>Voir le ticket</button>
                  </Link>
                  <hr />
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default DisputeTickets;
