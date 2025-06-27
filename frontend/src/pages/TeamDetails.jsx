import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
        setMatchs(res.data);
        calculateStats(res.data);
      })
      .catch(() => setMessage("Erreur lors de la récupération des matchs."));
  }, [ladderId, team_id]);

  const isCaptain = parseInt(userId) === parseInt(captainId);

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
            </li>
          ))}
        </ul>
      ) : (
        <p>{message || 'Aucun membre trouvé.'}</p>
      )}

      <h3>Matchs dans ce ladder</h3>
      {matchs.length > 0 ? (
        <ul>
          {matchs.map((match, index) => (
            <li key={index}>
              {match.team_1_name} vs {match.team_2_name} {' '}
              {match.status === 'pending' ? (
                <span style={{ color: 'gray' }}>pending</span>
              ) : (
                getResultTag(match)
              )}
              <button style={{ marginLeft: '10px' }} onClick={() => navigate(`/match/${match.id}`)}>Détails</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun match trouvé.</p>
      )}

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
    </div>
  );
}

export default TeamDetails;
