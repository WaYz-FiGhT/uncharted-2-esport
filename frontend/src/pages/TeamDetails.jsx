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
  const [deleteMessage, setDeleteMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [captainId, setCaptainId] = useState(null);
  const [ladderId, setLadderId] = useState(null);
  const [winCount, setWinCount] = useState(0);
  const [loseCount, setLoseCount] = useState(0);
  const [kickMessage, setKickMessage] = useState('');
  const [kickConfirmId, setKickConfirmId] = useState(null);

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
      .catch(() => setMessage('Error retrieving team.'));

    axios.get(`http://localhost:3000/teams/members?team_id=${team_id}`)
      .then(res => setMembers(res.data))
      .catch(() => setMessage('Error retrieving members.'));
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
      .catch(() => setMessage('Error retrieving matches.'));
  }, [ladderId, team_id]);

  const isCaptain = parseInt(userId) === parseInt(captainId);
  const isMember = members.some(m => parseInt(m.id) === parseInt(userId));
  const hasOngoingMatch = matchs.some(m =>
    ['pending', 'accepted', 'disputed'].includes(m.status)
  );
  const canDelete = isCaptain && members.length === 1 && !hasOngoingMatch;

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
        setLeaveMessage(res.data.error || 'Error.');
      }
    } catch (err) {
      setLeaveMessage('Request error.');
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
        setKickConfirmId(null);
      } else {
        setKickMessage(res.data.error || 'Error.');
      }
    } catch (err) {
      setKickMessage('Request error.');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    try {
      await axios.delete('http://localhost:3000/matches/delete-pending', {
        data: { match_id: matchId },
        withCredentials: true
      });
      setMatchs(matchs.filter(m => m.id !== matchId));
    } catch (err) {
      setMessage('Error deleting match.');
    }
  };

  const handleDeleteTeam = async () => {
    try {
      const res = await axios.delete('http://localhost:3000/teams/delete', {
        data: { team_id, captain_id: userId },
        withCredentials: true
      });
      if (res.status === 200) {
        setShowDeleteConfirm(false);
        navigate('/mes-equipes');
      } else {
        setDeleteMessage(res.data.error || 'Error.');
      }
    } catch (err) {
      setDeleteMessage('Request error.');
    }
  };



  const getResultTag = (match) => {
    const teamIdInt = parseInt(team_id);
    const isTeam1 = teamIdInt === match.team_1_id;
    const isTeam2 = teamIdInt === match.team_2_id;

    switch (match.official_result) {
      case 'win_team_1':
        return isTeam1
          ? <span style={{ color: 'green', fontSize: '1.2rem', fontWeight: 'bold' }}>W</span>
          : <span style={{ color: 'red', fontSize: '1.2rem', fontWeight: 'bold' }}>L</span>;
      case 'win_team_2':
        return isTeam2
          ? <span style={{ color: 'green', fontSize: '1.2rem', fontWeight: 'bold' }}>W</span>
          : <span style={{ color: 'red', fontSize: '1.2rem', fontWeight: 'bold' }}>L</span>;
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
    <div className="page-center team-details-page">
      <h1>{teamName || 'Name not available'}</h1>
      <h2>{gameName && ladderName ? `${gameName} - ${ladderName}` : 'Name not available'}</h2>

      <div className="team-stats">
        <p>
          {winCount}{' '}
          <span style={{ color: 'green', fontSize: '1.5rem', fontWeight: 'bold' }}>W</span>
          {' | '}
          {loseCount}{' '}
          <span style={{ color: 'red', fontSize: '1.5rem', fontWeight: 'bold' }}>L</span>
        </p>
      </div>

      <div className="team-sections">
        <div className="members-section">
          <h3>Team members</h3>
          {members.length > 0 ? (
            <div className="members-container">
              {members.map((membre, index) => (
                <div key={index} className="member-row">
                  <span>
                    <Link to={`/profile/${membre.username}`}>{membre.username}</Link>
                  </span>
                  <span>{membre.psn || '-'}</span>
                  <span>{membre.role}</span>
                  {isCaptain && parseInt(membre.id) !== parseInt(captainId) ? (
                    kickConfirmId === membre.id ? (
                      <div className="confirm-box">
                        <p>Are you sure you want to kick this member?</p>
                        <button onClick={() => handleKick(membre.id)}>Yes</button>
                        <button onClick={() => setKickConfirmId(null)}>No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setKickConfirmId(membre.id)}
                        disabled={hasOngoingMatch}
                      >
                        Kick
                      </button>
                    )
                  ) : (
                    <button style={{ visibility: 'hidden' }} disabled>
                      Kick
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>{message || 'No members found.'}</p>
          )}
        </div>
        {kickMessage && (
          <p style={{ color: 'red' }}>{kickMessage}</p>
        )}

        <div className="matches-section">
          <h3>Matches in this ladder</h3>
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
                    <>
                      <span style={{ color: 'gray' }}>pending</span>
                      {isCaptain && match.team_1_id === Number(team_id) && (
                        <button
                          style={{ marginLeft: '10px' }}
                          onClick={() => handleDeleteMatch(match.id)}
                        >
                          Delete
                        </button>
                      )}
                    </>
                  ) : (
                    getResultTag(match)
                  )}
                  {match.status !== 'pending' && (
                    <button
                      style={{ marginLeft: '10px' }}
                      onClick={() =>
                        navigate(`/match/${match.id}`, { state: { fromTeamId: team_id } })
                      }
                    >
                      Details
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No matches found.</p>
          )}
        </div>
      </div>

      {isMember && (
        <>
          {isCaptain && (
            <button onClick={() => navigate(`/team/${team_id}/${ladderId}/add-member`)}>
              Add a member
            </button>
          )}

          <button onClick={() => navigate(`/team/${team_id}/${ladderId}/create-match`)}>
            Create a match
          </button>

          <button onClick={() => navigate(`/team/${team_id}/accept-match`)}>
            Accept a match
          </button>

          {canDelete && (
            <>
              <button onClick={() => setShowDeleteConfirm(true)}>
                Delete team
              </button>
              {showDeleteConfirm && (
                <div className="confirm-box">
                  <p>Are you sure you want to delete the team?</p>
                  <button onClick={handleDeleteTeam}>Yes</button>
                  <button onClick={() => setShowDeleteConfirm(false)}>No</button>
                </div>
              )}
              {deleteMessage && (
                <p style={{ color: 'red' }}>{deleteMessage}</p>
              )}
            </>
          )}

          {!isCaptain && (
            <button onClick={() => setShowLeaveConfirm(true)} disabled={hasOngoingMatch}>
              Leave team
            </button>
          )}

          {showLeaveConfirm && (
            <div className="confirm-box">
              <p>Are you sure you want to leave the team?</p>
              <button onClick={handleLeave}>Yes</button>
              <button onClick={() => setShowLeaveConfirm(false)}>No</button>
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
