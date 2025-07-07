import { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/session-info')
      .then(res => setUserId(res.data.id))
      .catch(() => setMessage('You must be logged in.'));
  }, []);

  useEffect(() => {
    if (!userId) return;

    axios.get('/teams/invitations', {
      params: { player_id: userId }
    })
      .then(res => setInvitations(res.data))
  }, [userId]);

  const respond = async (invitationId, accept) => {
    try {
      const res = await axios.post('/teams/respond-invitation', {
        invitation_id: invitationId,
        accept
      });

      if (res.status === 200) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      } else {
        setMessage(res.data.error || 'Error.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error processing request.';
      setMessage(errorMsg);
    }
  };

  return (
    <div className="container">
      <div className="page-content">
        <h1>Invitations</h1>
        {message && <p>{message}</p>}

      {invitations.length > 0 ? (
        <ul>
          {invitations.map(inv => (
            <li key={inv.id}>
              Invitation to join {inv.team_name}
              <button onClick={() => respond(inv.id, true)}>Accept</button>
              <button onClick={() => respond(inv.id, false)}>Decline</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No invitations.</p>
        )}
      </div>
    </div>
  );
}

export default Invitations;