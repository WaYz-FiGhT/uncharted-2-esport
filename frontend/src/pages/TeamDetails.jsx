import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function TeamDetails() {
  const { team_id } = useParams();
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState('');
  const [ladderName, setLadderName] = useState('');
  const [gameName, setGameName] = useState('');
  const [members, setMembers] = useState([]);
  const [matchs, setMatchs] = useState([]);
  const [message, setMessage] = useState('');
  const [leaveMessage, setLeaveMessage] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [captainId, setCaptainId] = useState(null);
  const [ladderId, setLadderId] = useState(null);
  const [winCount, setWinCount] = useState(0);
  const [loseCount, setLoseCount] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:3000/session-info', { withCredentials: true })
      .then(res => setUserId(res.data.id))
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    axios.get(`http://localhost:3000/teams/details?id=${team_id}`)
      .then(res => {
        setTeamName(res.data.team_name);
        setLadderName(res.data.ladder_name);
        setCaptainId(res.data.captain_id);
        setLadderId(res.data.ladder_id);
        setGameName(res.data.name_games);
      })
      .catch(() => setMessage("Erreur lors de la récupération de l'équipe."));

    axios.get(`http://localhost:3000/teams/members?team_id=${team_id}`)
      .then(res => setMembers(res.data))
      .catch(() => setMessage("Erreur lors de la récupération des membres."));
  }, [team_id]);

  useEffect(() => {
    if (!ladderId) return;

    axios.get('http://localhost:3000/matches/team', {
      params: { ladder_id: ladderId, team_id },
      withCredentials: true
    })
      .then(res => {
        const sorted = res.data.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );
        setMatchs(sorted);
        calculateStats(sorted);
      })
      .catch(() => setMessage("Erreur lors de la récupération des matchs."));
  }, [ladderId, team_id]);

  const isCaptain = parseInt(userId) === parseInt(captainId);
  const isMember = members.some(m => parseInt(m.id) === parseInt(userId));
  const hasOngoingMatch = matchs.some(m =>
    ['pending', 'accepted', 'disputed'].includes(m.status)
  );

  const handleLeave = async () => {
    try {
      const res = await axios.post('http://localhost:3000/teams/leave', {
        team_id,
        player_id: userId
      }, { withCredentials: true });
      if (res.status === 200) {
        setShowLeaveConfirm(false);
        navigate('/mes-equipes');
      } else {
        setLeaveMessage(res.data.error || 'Erreur.');
      }
    } catch (err) {
      setLeaveMessage("Erreur lors de la requête.");
    }
  };

    const handleKick = async (playerId) => {
    try {
      const res = await axios.post('http://localhost:3000/teams/kick-member', {
        team_id,
        captain_id: userId,
        player_id: playerId
      }, { withCredentials: true });

      if (res.status === 200) {
        setMembers(members.filter(m => m.id !== playerId));
      } else {
        setMessage(res.data.error || 'Erreur.');
      }
    } catch (err) {
      setMessage('Erreur lors de la requête.');
    }
  };

  const getResultTag = (match) => {
    const teamIdInt = parseInt(team_id);
    const isTeam1 = teamIdInt === match.team_1_id;
    const isTeam2 = teamIdInt === match.team_2_id;

    switch (match.official_result) {
      case 'win_team_1':
        return isTeam1 ? <span style={{ color: 'green' }}>W</span> : <span style={{ color: 'red' }}>L</span>;
      case 'win_team_2':
        return isTeam2 ? <span style={{ color: 'green' }}>W</span> : <span style={{ color: 'red' }}>L</span>;
      case 'disputed':
        return <span style={{ color: 'orange' }}>D</span>;
      default:
        return null;
    }
  };

  const calculateStats = (matchList) => {
    let wins = 0;
    let losses = 0;
    const teamIdInt = parseInt(team_id);

    matchList.forEach(match => {
      if (match.official_result === 'win_team_1' && match.team_1_id === teamIdInt) wins++;
      else if (match.official_result === 'win_team_2' && match.team_2_id === teamIdInt) wins++;
      else if (match.official_result === 'win_team_1' && match.team_2_id === teamIdInt) losses++;
      else if (match.official_result === 'win_team_2' && match.team_1_id === teamIdInt) losses++;
    });

    setWinCount(wins);
    setLoseCount(losses);
  };

  return (
    <div className="page-center">
      <h1>Détails de l’équipe</h1>
      <h2>{teamName || 'Nom non disponible'}</h2>
      <h3>{gameName && ladderName ? `${gameName} - ${ladderName}` : 'Nom non disponible'}</h3>

      <p><strong>Victoires :</strong> {winCount} | <strong>Défaites :</strong> {loseCount}</p>

      <h3>Membres de l’équipe</h3>
      {members.length > 0 ? (
        <ul>
          {members.map((membre, index) => (
            <li key={index}>
              {membre.username} — {membre.role}
              {isCaptain && parseInt(membre.id) !== parseInt(captainId) && (
                <button
                  style={{ marginLeft: '10px' }}
                  onClick={() => handleKick(membre.id)}
                  disabled={hasOngoingMatch}
                >
                  Expulser
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>{message || 'Aucun membre trouvé.'}</p>
      )}

      <h3>Matchs dans ce ladder</h3>
      {matchs.length > 0 ? (
        <ul className="match-list">
          {matchs.map((match, index) => (
            <li key={index}>
              <Link to={`/team/${match.team_1_id}`}>{match.team_1_name}</Link>
              {' '}vs{' '}
              {match.team_2_name ? (
                <Link to={`/team/${match.team_2_id}`}>{match.team_2_name}</Link>
              ) : (
                '???'
              )}{' '}
              {match.status === 'pending' ? (
                <span style={{ color: 'gray' }}>pending</span>
              ) : (
                getResultTag(match)
              )}
              {match.status !== 'pending' && (
                <button
                  style={{ marginLeft: '10px' }}
                  onClick={() => navigate(`/match/${match.id}`)}
                >
                  Détails
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun match trouvé.</p>
      )}

      {isMember && (
        <>
          {isCaptain && (
            <button onClick={() => navigate(`/team/${team_id}/${ladderId}/add-member`)}>
              Ajouter un membre
            </button>
          )}

          <button onClick={() => navigate(`/team/${team_id}/${ladderId}/create-match`)}>
            Créer un match
          </button>

          <button onClick={() => navigate(`/team/${team_id}/accept-match`)}>
            Accepter un match
          </button>

          <button onClick={() => navigate(`/ladder/${ladderId}/ranking`)}>
            Voir le classement
          </button>

          {!isCaptain && (
            <button onClick={() => setShowLeaveConfirm(true)} disabled={hasOngoingMatch}>
              Quitter l'équipe
            </button>
          )}

          {showLeaveConfirm && (
            <div className="confirm-box">
              <p>Êtes-vous sûr de vouloir quitter l'équipe&nbsp;?</p>
              <button onClick={handleLeave}>Oui</button>
              <button onClick={() => setShowLeaveConfirm(false)}>Non</button>
            </div>
          )}

      {leaveMessage && (
        <p style={{ color: 'red' }}>{leaveMessage}</p>
      )}
        </>
        )}
    </div>
  );
}

export default TeamDetails;
