import { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/session-info', { withCredentials: true })
      .then(res => setUserId(res.data.id))
      .catch(() => setMessage('Vous devez être connecté.'));
  }, []);

  useEffect(() => {
    if (!userId) return;

    axios.get('http://localhost:3000/teams/invitations', {
      params: { player_id: userId },
      withCredentials: true
    })
      .then(res => setInvitations(res.data))
      .catch(() => setMessage("Erreur lors du chargement des invitations."));
  }, [userId]);

  const respond = async (invitationId, accept) => {
    try {
      const res = await axios.post('http://localhost:3000/teams/respond-invitation', {
        invitation_id: invitationId,
        accept
      }, { withCredentials: true });

      if (res.status === 200) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      } else {
        setMessage(res.data.error || 'Erreur.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erreur lors du traitement.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="page-center">
      <h1>Invitations</h1>
      {message && <p>{message}</p>}

      {invitations.length > 0 ? (
        <ul>
          {invitations.map(inv => (
            <li key={inv.id}>
              Invitation pour rejoindre {inv.team_name}
              <button onClick={() => respond(inv.id, true)}>Accepter</button>
              <button onClick={() => respond(inv.id, false)}>Refuser</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune invitation.</p>
      )}
    </div>
  );
}

export default Invitations;