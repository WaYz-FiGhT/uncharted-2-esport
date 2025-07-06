import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [sessionUser, setSessionUser] = useState(null);
  const [newPictureFile, setNewPictureFile] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/session-info', { withCredentials: true })
      .then(res => setSessionUser(res.data.username))
      .catch(() => setSessionUser(null));

    axios
      .get(`http://localhost:3000/players/profile/${username}`)
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
    try {
      const formData = new FormData();
      formData.append('player_id', profile.id);
      formData.append('picture', newPictureFile);
      const res = await axios.post('http://localhost:3000/players/update-profile-picture', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile({ ...profile, profile_picture_url: res.data.url });
      setNewPictureFile(null);
      setPreview('');
    } catch (err) {
      setMessage('Error updating picture.');
    }
  };

  return (
    <div className="page-center">
      {profile ? (
        <div className="profile-page">
          {profile.profile_picture_url && (
            <img src={profile.profile_picture_url} alt="avatar" style={{ width: '120px' }} />
          )}
          <h1>{profile.username}</h1>
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
                  <Link to={`/team/${team.id}`}>{team.name}</Link>
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