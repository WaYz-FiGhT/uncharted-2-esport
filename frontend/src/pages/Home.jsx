import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Home() {
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

  return (
    <div className="page-center home-page">
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
              {ladder3.map((team, index) => (
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
  );
}

export default Home;
