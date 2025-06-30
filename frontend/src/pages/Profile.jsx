import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios
      .get(`http://localhost:3000/players/profile/${username}`)
      .then((res) => setProfile(res.data))
      .catch(() => setMessage("Erreur lors du chargement du profil."));
  }, [username]);

  return (
    <div className="page-center">
      {profile ? (
        <div className="profile-page">
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
            <p>Aucune équipe trouvée.</p>
          )}
        </div>
      ) : (
        <p>{message || 'Chargement...'}</p>
      )}
    </div>
  );
}

export default Profile;