import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function MatchDetails() {
  const { match_id } = useParams();
  const [match, setMatch] = useState(null);
  const [userTeamId, setUserTeamId] = useState(null);
  const [hasAlreadyReported, setHasAlreadyReported] = useState(false);
  const [hasAlreadySentTicket, setHasAlreadySentTicket] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/session-info', { withCredentials: true })
      .then(res => setUserTeamId(res.data.team_id))
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    axios.get(`http://localhost:3000/matches/details/${match_id}`, { withCredentials: true })
      .then(res => setMatch(res.data))
      .catch(() => setError("Erreur lors de la récupération du match."));
  }, [match_id]);

  useEffect(() => {
    if (!userTeamId) return;

    axios.get(`http://localhost:3000/matches/report/check?match_id=${match_id}&team_id=${userTeamId}`, {
      withCredentials: true
    })
      .then(res => setHasAlreadyReported(res.data.alreadyReported))
      .catch(() => setHasAlreadyReported(false));

    axios.get(`http://localhost:3000/tickets/check?match_id=${match_id}&team_id=${userTeamId}`, {
      withCredentials: true
    })
      .then(res => setHasAlreadySentTicket(res.data.alreadySent))
      .catch(() => setHasAlreadySentTicket(false));
  }, [userTeamId, match_id]);

  const isTeamInMatch =
    Number(userTeamId) === match?.team_1_id || Number(userTeamId) === match?.team_2_id;

  const renderOfficialResult = () => {
    switch (match.result) {
      case 'win_team_1':
        return `Victoire de ${match.team_1_name}`;
      case 'win_team_2':
        return `Victoire de ${match.team_2_name}`;
      case 'disputed':
        return 'Disputed';
      default:
        return null;
    }
  };

  const handleSubmitTicket = () => {
    axios.post('http://localhost:3000/tickets/create', {
      match_id: match.id,
      team_id: userTeamId,
      message: ticketMessage
    }, { withCredentials: true })
      .then(() => {
        setTicketSent(true);
        setShowTicketForm(false);
        setTicketMessage('');
        setHasAlreadySentTicket(true);
      })
      .catch(() => alert("Erreur lors de l'envoi du ticket."));
  };

  if (error) return <p>{error}</p>;
  if (!match) return <p>Chargement...</p>;

  return (
  <div className="page-center">
    <h1>Détails du match</h1>
    <p><strong>Équipe 1 :</strong> {match.team_1_name}</p>
    <p><strong>Équipe 2 :</strong> {match.team_2_name || 'En attente'}</p>
    <p><strong>Mode :</strong> {match.game_mode}</p>
    <p><strong>Status :</strong> {match.status}</p>
    <p><strong>Date prévue :</strong> {new Date(match.scheduled_time).toLocaleString()}</p>

    {match.result && (
      <p><strong>Résultat officiel :</strong> {renderOfficialResult()}</p>
    )}

    <h3>Maps jouées :</h3>
    <ul>
      {match.maps.map((m, i) => (
        <li key={i}>{m.game_mode} — {m.map_name}</li>
      ))}
    </ul>

    <h3>Joueurs par équipe :</h3>
    {Object.entries(match.players).map(([teamId, teamInfo]) => (
      <div key={teamId}>
        <h4>{teamInfo.name}</h4>
        <ul>
          {teamInfo.players.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    ))}

    {/* Bouton pour reporter */}
    {isTeamInMatch && !hasAlreadyReported && (
      <div style={{ marginTop: '20px' }}>
        <h4>ID de ton équipe : {userTeamId}</h4>
        <Link to={`/report/${match.id}/${userTeamId}`}>
          <button>Reporter le résultat</button>
        </Link>
      </div>
    )}

    {isTeamInMatch && hasAlreadyReported && (
      <p style={{ marginTop: '20px', fontStyle: 'italic', color: 'gray' }}>
        Vous avez déjà reporté ce match.
      </p>
    )}

    {/* Ticket de preuve */}
    {match.result === 'disputed' && isTeamInMatch && !ticketSent && !hasAlreadySentTicket && (
      <div style={{ marginTop: '30px' }}>
        {!showTicketForm ? (
          <button onClick={() => setShowTicketForm(true)}>
            Créer un ticket de preuve
          </button>
        ) : (
          <>
            <textarea
              placeholder="Expliquez les preuves du litige (screens, infos...)"
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              rows={5}
              cols={50}
            />
            <br />
            <button onClick={handleSubmitTicket}>
              Envoyer le ticket
            </button>
          </>
        )}
      </div>
    )}

    {ticketSent && (
      <p style={{ color: 'green', marginTop: '20px' }}>
        Ticket envoyé avec succès.
      </p>
    )}

    {hasAlreadySentTicket && (
      <p style={{ marginTop: '20px', fontStyle: 'italic', color: 'gray' }}>
        Votre équipe a déjà envoyé un ticket pour ce match.
      </p>
    )}
  </div>
);
}

export default MatchDetails;
