import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL;

function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [sessionUser, setSessionUser] = useState(null);
  const [newPictureFile, setNewPictureFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    axios.get('/session-info')
      .then(res => setSessionUser(res.data.username))
      .catch(() => setSessionUser(null));

    axios
      .get(`/players/profile/${username}`)
      .then((res) => setProfile(res.data))
      .catch(() => setMessage('Error loading profile.'));
  }, [username]);

    const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewPictureFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview('');
    }
  };

  const handleUpdate = async () => {
    if (!newPictureFile) return;

      const ext = newPictureFile.name.split('.').pop().toLowerCase();
    const allowed = ['png', 'jpg', 'jpeg', 'gif'];
    if (!allowed.includes(ext)) {
      setUpdateMessage('Invalid file type (png, jpg, jpeg or gif are authorized).');
      return;
    }
    if (newPictureFile.size > 2 * 1024 * 1024) {
      setUpdateMessage('File too large (max 2MB).');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('player_id', profile.id);
      formData.append('picture', newPictureFile);
      const res = await axios.post('/players/update-profile-picture', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile({ ...profile, profile_picture_url: res.data.url });
      setNewPictureFile(null);
      setPreview('');
      setUpdateMessage('');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setUpdateMessage(err.response.data.error);
      } else {
        setUpdateMessage('Error updating picture.');
      }
    }
  };

  return (
    <div className="page-center">
      {profile ? (
        <div className="profile-page">
          <div className="profile-header">
            {profile.profile_picture_url && (
              <img
                src={`${API_URL}${profile.profile_picture_url}`}
                alt="avatar"
                className="profile-avatar"
              />
            )}
            <h1>{profile.username}</h1>
          </div>
          <p>PSN: {profile.psn || '-'}</p>
          <p>
            {profile.wins} <span style={{ color: 'green' }}>W</span> / {profile.losses}{' '}
            <span style={{ color: 'red' }}>L</span>
          </p>
          <h2>Teams</h2>
          {profile.teams.length > 0 ? (
            <ul>
              {profile.teams.map((team) => (
                <li key={team.id}>
                  <Link to={`/team/${team.id}`}>{team.name}</Link>{' '}
                  <span>
                    {team.ladder_name && ${team.ladder_name}} —{' '}
                    <span className="xp-yellow">{team.xp} XP</span> — #{team.rank}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No teams found.</p>
          )}
          {sessionUser === profile.username && (
            <div style={{ marginTop: '10px' }}>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {preview && (
                <img src={preview} alt="preview" style={{ width: '80px', display: 'block', margin: '5px 0' }} />
              )}
              <button onClick={handleUpdate}>Update picture</button>
              {updateMessage && (
                <p style={{ color: 'red' }}>{updateMessage}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p>{message || 'Loading...'}</p>
      )}
    </div>
  );
}

export default Profile;
