import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function YouTubeEmbed({ id }) {
  return (
    <iframe
      width="300"
      height="169"
      src={`https://www.youtube.com/embed/${id}`}
      title="YouTube video"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

function Leaderboards() {
  const navigate = useNavigate();
  const [ladder1, setLadder1] = useState([]);
  const [ladder2, setLadder2] = useState([]);
  const [ladder3, setLadder3] = useState([]);
  const [ladder1Name, setLadder1Name] = useState('');
  const [ladder2Name, setLadder2Name] = useState('');
  const [ladder3Name, setLadder3Name] = useState('');
  const [message1, setMessage1] = useState('');
  const [message2, setMessage2] = useState('');
  const [message3, setMessage3] = useState('');

  useEffect(() => {
    axios
      .get('/teams/ranking', { params: { ladder_id: 1 } })
      .then((res) => setLadder1(res.data))
      .catch(() => setMessage1('Error loading ranking.'));

    axios
      .get('/teams/ranking', { params: { ladder_id: 2 } })
      .then((res) => setLadder2(res.data))
      .catch(() => setMessage2('Error loading ranking.'));

    axios
      .get('/teams/ranking', { params: { ladder_id: 3 } })
      .then((res) => setLadder3(res.data))
      .catch(() => setMessage3('Error loading ranking.'));

    axios
      .get('/ladders/name', { params: { id: 1 } })
      .then((res) => setLadder1Name(res.data.ladder_name))
      .catch(() => setLadder1Name('Ladder 1'));

    axios
      .get('/ladders/name', { params: { id: 2 } })
      .then((res) => setLadder2Name(res.data.ladder_name))
      .catch(() => setLadder2Name('Ladder 2'));

    axios
      .get('/ladders/name', { params: { id: 3 } })
      .then((res) => setLadder3Name(res.data.ladder_name))
      .catch(() => setLadder3Name('Ladder 3'));

  }, []);

  const getTrophyEmoji = (index) => {
    if (index === 0) return '🥇'; // Médaille d'or
    if (index === 1) return '🥈'; // Médaille d'argent
    if (index === 2) return '🥉'; // Médaille de bronze
    return '';
  };

function Home() {

  return (
    <div className="page-center">
      <section className="home-section">
        <h1>Welcome to Uncharted Esport</h1>
        <p>Welcome to Uncharted Esport!</p>
        <div className="page-center leaderboards-page">
      <h1>LEADERBOARDS</h1>
      <div className="ladder-container">
        <div className="ladder-block ladder-1">
          <h2 className="ladder-name">{ladder1Name || 'Ladder 1'}</h2>
          {ladder1.length > 0 ? (
            <ul className="ranking-list">
              {ladder1.map((team, index) => (
                <li
                  key={team.id}
                  className={`ranking-row ${
                    index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''
                  }`}
                >
                  <span>
                    {index + 1}
                    {index < 3 && (
                      <span
                        className={`trophy ${
                          index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''
                        }`}
                      >
                        {getTrophyEmoji(index)}
                      </span>
                    )}
                  </span>
                  <Link to={`/team/${team.id}`}>{team.name}</Link>
                  <span>
                    {team.wins} <span style={{ color: 'green' }}>W</span> / {team.losses} <span style={{ color: 'red' }}>L</span>
                  </span>
                  <span className="xp-yellow">{team.xp} XP</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{message1 || 'No teams found.'}</p>
          )}
        </div>
        <div className="ladder-block big-ladder">
          <h2 className="ladder-name">{ladder2Name || 'Ladder 2'}</h2>
          {ladder2.length > 0 ? (
            <ul className="ranking-list">
              {ladder2.map((team, index) => (
                <li
                  key={team.id}
                  className={`ranking-row ${
                    index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''
                  }`}
                >
                  <span>
                    {index + 1}
                    {index < 3 && (
                      <span
                        className={`trophy ${
                          index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''
                        }`}
                      >
                        {getTrophyEmoji(index)}
                      </span>
                    )}
                  </span>
                  <Link to={`/team/${team.id}`}>{team.name}</Link>
                  <span>
                    {team.wins} <span style={{ color: 'green' }}>W</span> / {team.losses} <span style={{ color: 'red' }}>L</span>
                  </span>
                  <span className="xp-yellow">{team.xp} XP</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{message2 || 'No teams found.'}</p>
          )}
        </div>
        <div className="ladder-block ladder-1">
          <h2 className="ladder-name">{ladder3Name || 'Ladder 3'}</h2>
          {ladder3.length > 0 ? (
            <ul className="ranking-list">
              {ladder3.slice(0, 2).map((team, index) => (
                <li
                  key={team.id}
                  className={`ranking-row ${
                    index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''
                  }`}
                >
                  <span>
                    {index + 1}
                    {index < 3 && (
                      <span
                        className={`trophy ${
                          index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''
                        }`}
                      >
                        {getTrophyEmoji(index)}
                      </span>
                    )}
                  </span>
                  <Link to={`/team/${team.id}`}>{team.name}</Link>
                    <span>
                    {team.wins} <span style={{ color: 'green' }}>W</span> / {team.losses} <span style={{ color: 'red' }}>L</span>
                  </span>
                  <span className="xp-yellow">{team.xp} XP</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{message3 || 'No teams found.'}</p>
          )}
        </div>
      </div>
      <div className="footer-bar">
        <Link to="/mentions-legales">Terms of use</Link>
        <span className="separator">|</span>
        <Link to="/politique-de-confidentialite">Privacy policy</Link>
      </div>
    </div>
      </section>
      <section className="home-section">
        <h2>Uncharted Community</h2>
        <p>Check out YouTube channels and latest videos.</p>
        <div className="youtube-grid">
          {['xTdNBjY5i1Q', 'DWy8iSss-Xs', 'GYY9qXq-DAA', 'mylsM4ZQ4Ng'].map(id => (
            <YouTubeEmbed key={id} id={id} />
          ))}
        </div>
      </section>
      <section className="home-section">
        <h2>Discord </h2>
      <p><a href="https://discord.gg/uc4Xj793">Events & Ladders uncharted</a></p>
      <p><a href="https://discord.gg/E7TQzJhX">ThuggzBunney Events</a></p>
      <p><a href="https://discord.gg/unchartedmultiplayer">Uncharted Reloaded</a></p>
      </section>
      <section className="home-section">
        <h2>Future releases</h2>
        <p>Stay tuned for upcoming features.</p>
      </section>
    </div>
  );
}

export default Home;
