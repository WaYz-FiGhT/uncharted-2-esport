import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function DisputeTickets() {
  const [groupedTickets, setGroupedTickets] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/tickets/create')
      .then(res => {
        const grouped = {};

        res.data.forEach(ticket => {
          const matchId = ticket.match_id;
          if (!grouped[matchId]) {
            grouped[matchId] = {
              scheduled_time: ticket.scheduled_time,
              team_1_name: ticket.team_1_name,
              team_1_id: ticket.team_1_id,
              team_2_name: ticket.team_2_name,
              team_2_id: ticket.team_2_id,
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
      .catch(() => setError("Error loading tickets."));
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <div className="page-content">
        <h1>Dispute tickets</h1>
        {Object.keys(groupedTickets).length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        Object.entries(groupedTickets).map(([matchId, data]) => (
          <div key={matchId} style={{ marginBottom: '30px' }}>
            <h2>
              Match #{matchId} –{' '}
              <Link to={`/team/${data.team_1_id}`}>{data.team_1_name}</Link> vs{' '}
              {data.team_2_name ? (
                <Link to={`/team/${data.team_2_id}`}>{data.team_2_name}</Link>
              ) : (
                '???'
              )}
            </h2>
            <p><strong>Scheduled date:</strong> {new Date(data.scheduled_time).toLocaleString()}</p>
            <ul className="ticket-list">
              {data.tickets.map(ticket => (
                <li key={ticket.ticket_id} className="ticket-item">
                  <span>
                    <strong>Team:</strong>{' '}
                    <Link to={`/team/${ticket.ticket_team_id}`}>{ticket.ticket_team_name}</Link>
                  </span>
                  <span>
                    <strong>Ticket date:</strong>{' '}
                    {new Date(ticket.created_at).toLocaleString()}
                  </span>
                  <Link to={`/ticket/${ticket.ticket_id}`} className="ticket-button">
                    <button>View ticket</button>
                  </Link>
                  <hr />
                </li>
              ))}
            </ul>
          </div>
        ))
        )}
      </div>
    </div>
  );
}

export default DisputeTickets;
