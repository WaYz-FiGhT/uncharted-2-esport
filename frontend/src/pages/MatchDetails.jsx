import { useEffect, useState } from 'react';
import { formatUTCDate } from '../utils/date';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL;

function MatchDetails() {
  const { match_id } = useParams();
  const location = useLocation();
  const [match, setMatch] = useState(null);
  const fromTeamId = location.state?.fromTeamId;
  const [teamId1, setTeamId1] = useState(null);
  const [teamId2, setTeamId2] = useState(null);
  const [teamId3, setTeamId3] = useState(null);
  const [userTeamId, setUserTeamId] = useState(null);
  const [hasAlreadyReported, setHasAlreadyReported] = useState(false);
  const [hasAlreadySentTicket, setHasAlreadySentTicket] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

    const slugify = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const getMapImage = (name) => `/images/maps/${slugify(name)}.png`;

  useEffect(() => {
    axios.get('/session-info')
      .then(res => {
        setTeamId1(res.data.team_id_ladder1);
        setTeamId2(res.data.team_id_ladder2);
        setTeamId3(res.data.team_id_ladder3);
      })
      .catch(() => {
        setTeamId1(null);
        setTeamId2(null);
        setTeamId3(null);
      });
  }, []);

  useEffect(() => {
    axios.get(`/matches/details/${match_id}`)
      .then(res => setMatch(res.data))
      .catch(() => setError('Error loading match.'));
  }, [match_id]);

    // Détermine l'id de l'équipe de l'utilisateur pour le ladder du match
  useEffect(() => {
    if (!match) return;
    if (match.ladder_id === 1) {
      setUserTeamId(teamId1);
    } else if (match.ladder_id === 2) {
      setUserTeamId(teamId2);
    } else if (match.ladder_id === 3) {
      setUserTeamId(teamId3);
    } else {
      setUserTeamId(null);
    }
  }, [match, teamId1, teamId2, teamId3]);


  useEffect(() => {
    if (!userTeamId) return;

    axios.get(`/matches/report/check?match_id=${match_id}&team_id=${userTeamId}`)
      .then(res => setHasAlreadyReported(res.data.alreadyReported))
      .catch(() => setHasAlreadyReported(false));

    axios.get(`/tickets/check?match_id=${match_id}&team_id=${userTeamId}`)
      .then(res => setHasAlreadySentTicket(res.data.alreadySent))
      .catch(() => setHasAlreadySentTicket(false));
  }, [userTeamId, match_id]);

  const isTeamInMatch =
    Number(userTeamId) === match?.team_1_id || Number(userTeamId) === match?.team_2_id;
  const canReport =
    isTeamInMatch && fromTeamId && Number(fromTeamId) === Number(userTeamId);

  const getResultTag = (teamNumber) => {
    switch (match.result) {
      case 'win_team_1':
        return teamNumber === 1
          ? <span style={{ color: 'green' }}>W</span>
          : <span style={{ color: 'red' }}>L</span>;
      case 'win_team_2':
            return teamNumber === 2
          ? <span style={{ color: 'green' }}>W</span>
          : <span style={{ color: 'red' }}>L</span>;
      default:
        return null;
    }
  };

  const handleSubmitTicket = () => {
    axios.post('/tickets/create', {
      match_id: match.id,
      team_id: userTeamId,
      message: ticketMessage
    })
      .then(() => {
        setTicketSent(true);
        setShowTicketForm(false);
        setTicketMessage('');
        setHasAlreadySentTicket(true);
      })
      .catch(() => alert("Erreur lors de l'envoi du ticket."));
  };

  if (error) return <p>{error}</p>;
  if (!match) return <p>Loading...</p>;

  return (
  <div className="page-center">
    <div className="match-info">
      <div><strong>Mode:</strong> {match.game_mode}</div>
      <div><strong>Format:</strong> {match.format?.toUpperCase()}</div>
      <div><strong>Status:</strong> {match.status}</div>
      <div><strong>Scheduled date:</strong> {formatUTCDate(match.scheduled_time)}</div>
    </div>
    <h3>Played maps:</h3>
    <ul className="map-list">
      {match.maps.map((m, i) => (
        <li key={i}>
          <span>{m.game_mode} — {m.map_name}</span>
          <img
            src={getMapImage(m.map_name)}
            alt={m.map_name}
            className="map-thumb"
          />
        </li>
      ))}
    </ul>
    
    <div className="match-teams">
      <div className="team-block">
        <h2>
          {match.team_1_picture_url && (
            <img
              src={`${API_URL}${match.team_1_picture_url}`}
              alt="team"
              className="team-avatar-small"
            />
          )}
          <Link to={`/team/${match.team_1_id}`}>{match.team_1_name}</Link>{' '}
          {getResultTag(1)}
        </h2>
        <ul>
          {(match.players[match.team_1_id]?.players || []).map((p, i) => (
            <li key={i}>
              {p.profile_picture_url && (
                <img src={`${API_URL}${p.profile_picture_url}`} alt="avatar" />
              )}
              {p.psn}
            </li>
          ))}
        </ul>
      </div>
      <div className="vs">vs</div>
      <div className="team-block">
        <h2>
          {match.team_2_id ? (
            <>
                {match.team_2_picture_url && (
                  <img
                    src={`${API_URL}${match.team_2_picture_url}`}
                    alt="team"
                    className="team-avatar-small"
                  />
                )}
              <Link to={`/team/${match.team_2_id}`}>{match.team_2_name}</Link>{' '}
              {getResultTag(2)}
            </>
          ) : (
            'Pending'
          )}
        </h2>
        {match.team_2_id && (
          <ul>
            {(match.players[match.team_2_id]?.players || []).map((p, i) => (
              <li key={i}>
                {p.profile_picture_url && (
                  <img src={p.profile_picture_url} alt="avatar" />
                )}
                {p.psn}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    {/* Bouton pour reporter */}
    {canReport && !hasAlreadyReported && (
      <div style={{ marginTop: '20px' }}>
        <Link to={`/report/${match.id}/${userTeamId}`}>
          <button>Report result</button>
        </Link>
      </div>
    )}

    {canReport && hasAlreadyReported && (
      <p style={{ marginTop: '20px', fontStyle: 'italic', color: 'gray' }}>
        You have already reported this match.
      </p>
    )}

    {/* Ticket de preuve */}
    {match.result === 'disputed' && canReport && !ticketSent && !hasAlreadySentTicket && (
      <div style={{ marginTop: '30px' }}>
        {!showTicketForm ? (
          <button onClick={() => setShowTicketForm(true)}>
            Create proof ticket
          </button>
        ) : (
          <>
            <textarea
              placeholder="Explain dispute proof (screens, info...)"
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              rows={5}
              cols={50}
            />
            <br />
            <button onClick={handleSubmitTicket}>
              Send ticket
            </button>
          </>
        )}
      </div>
    )}

    {ticketSent && (
      <p style={{ color: 'green', marginTop: '20px' }}>
        Ticket sent successfully.
      </p>
    )}

    {hasAlreadySentTicket && (
      <p style={{ marginTop: '20px', fontStyle: 'italic', color: 'gray' }}>
        Your team already sent a ticket for this match.
      </p>
    )}
    </div>
);
}

export default MatchDetails;
