import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL;

function TeamDetails() {
  const { team_id } = useParams();
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState('');
  const [ladderName, setLadderName] = useState('');
  const [gameName, setGameName] = useState('');
  const [teamPictureUrl, setTeamPictureUrl] = useState('');
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
  const [newTeamPictureFile, setNewTeamPictureFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [pictureMessage, setPictureMessage] = useState('');

  useEffect(() => {
    axios.get('/session-info')
      .then(res => setUserId(res.data.id))
      .catch(() => setUserId(null));
  }, []);

  useEffect(() => {
    axios.get(`/teams/details?id=${team_id}`)
      .then(res => {
        setTeamName(res.data.team_name);
        setLadderName(res.data.ladder_name);
        setCaptainId(res.data.captain_id);
        setLadderId(res.data.ladder_id);
        setGameName(res.data.name_games);
        setTeamPictureUrl(res.data.team_picture_url);
      })
      .catch(() => setMessage('Error retrieving team.'));

    axios.get(`/teams/members?team_id=${team_id}`)
      .then(res => setMembers(res.data))
      .catch(() => {
        setMessage('Error retrieving members.');
        setMembers([]); // clear previous members when team not found
      });
  }, [team_id]);

  useEffect(() => {
    if (!ladderId) return;

    axios.get('/matches/team', {
      params: { ladder_id: ladderId, team_id }
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

  const handleNewPictureFileChange = (e) => {
    const file = e.target.files[0];
    setNewTeamPictureFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview('');
    }
  };

  const isCaptain = parseInt(userId) === parseInt(captainId);
  const isMember = members.some(m => parseInt(m.id) === parseInt(userId));
  const hasOngoingMatch = matchs.some(m =>
    ['pending', 'accepted', 'disputed'].includes(m.status)
  );
  const canDelete = isCaptain && members.length === 1 && !hasOngoingMatch;

  const handleLeave = async () => {
    try {
      const res = await axios.post('/teams/leave', {
        team_id,
        player_id: userId
      });
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
      const res = await axios.post('/teams/kick-member', {
        team_id,
        captain_id: userId,
        player_id: playerId
      });

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
      await axios.delete('/matches/delete-pending', {
        data: { match_id: matchId }
      });
      setMatchs(matchs.filter(m => m.id !== matchId));
    } catch (err) {
      setMessage('Error deleting match.');
    }
  };

  const handleDeleteTeam = async () => {
    try {
      const res = await axios.delete('/teams/delete', {
        data: { team_id, captain_id: userId }
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


  const handleUpdatePicture = async () => {
    if (!newTeamPictureFile) return;
    const ext = newTeamPictureFile.name.split('.').pop().toLowerCase();
    const allowed = ['png', 'jpg', 'jpeg', 'gif'];
    if (!allowed.includes(ext)) {
      setPictureMessage('Invalid file type (png, jpg, jpeg or gif are authorized).');
      return;
    }
    if (newTeamPictureFile.size > 2 * 1024 * 1024) {
      setPictureMessage('File too large (max 2MB).');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('team_id', team_id);
      formData.append('captain_id', userId);
      formData.append('picture', newTeamPictureFile);

      const res = await axios.post('/teams/update-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 200) {
        setTeamPictureUrl(res.data.url);
        setNewTeamPictureFile(null);
        setPreview('');
        setPictureMessage('');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setPictureMessage(err.response.data.error);
      } else {
        setPictureMessage('Error updating picture.');
      }
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
            <div className="team-header">
        {teamPictureUrl && (
          <img
            src={`${API_URL}${teamPictureUrl}`}
            alt="team"
            className="team-avatar"
          />
        )}
        <h1>{teamName || 'Name not available'}</h1>
      </div>
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
                  <span className="member-name">
                    {membre.profile_picture_url && (
                      <img
                        src={`${API_URL}${membre.profile_picture_url}`}
                        alt="avatar"
                        className="member-avatar"
                      />
                    )}
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
          {isCaptain && ladderId !== 3 && (
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

          {isCaptain && (
                          <div style={{ marginTop: '10px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNewPictureFileChange}
                />
                              {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    style={{ width: '80px', display: 'block', margin: '5px 0' }}
                  />
                )}
                <button onClick={handleUpdatePicture}>Update picture</button>
                {pictureMessage && (
                  <p style={{ color: 'red' }}>{pictureMessage}</p>
                )}
              </div>
            )}


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
