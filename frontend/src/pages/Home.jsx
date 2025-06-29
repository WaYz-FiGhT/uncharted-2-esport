import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Home() {
  const navigate = useNavigate();
  const [ladder1, setLadder1] = useState([]);
  const [ladder2, setLadder2] = useState([]);
  const [ladder1Name, setLadder1Name] = useState('');
  const [ladder2Name, setLadder2Name] = useState('');
  const [message1, setMessage1] = useState('');
  const [message2, setMessage2] = useState('');

    useEffect(() => {
    axios
      .get('http://localhost:3000/teams/ranking', { params: { ladder_id: 1 } })
      .then((res) => setLadder1(res.data))
      .catch(() => setMessage1('Erreur lors du chargement du classement.'));

    axios
      .get('http://localhost:3000/teams/ranking', { params: { ladder_id: 2 } })
      .then((res) => setLadder2(res.data))
      .catch(() => setMessage2('Erreur lors du chargement du classement.'));

    axios
      .get('http://localhost:3000/ladders/name', { params: { id: 1 } })
      .then((res) => setLadder1Name(res.data.ladder_name))
      .catch(() => setLadder1Name('Ladder 1'));

    axios
      .get('http://localhost:3000/ladders/name', { params: { id: 2 } })
      .then((res) => setLadder2Name(res.data.ladder_name))
      .catch(() => setLadder2Name('Ladder 2'));
  }, []);


  return (
    <div className="page-center">
<h1>Classements</h1>
      <div className="ladder-container">
        <div className="ladder-block">
          <h2>{ladder1Name || 'Ladder 1'}</h2>
          {ladder1.length > 0 ? (
            <ul className="ranking-list">
              {ladder1.map((team, index) => (
                <li key={team.id} className="ranking-row">
                  <span>
                    {index + 1}
                    {index === 0 && (
                      <i className="fa-solid fa-trophy trophy gold" />
                    )}
                    {index === 1 && (
                      <i className="fa-solid fa-trophy trophy silver" />
                    )}
                    {index === 2 && (
                      <i className="fa-solid fa-trophy trophy bronze" />
                    )}
                  </span>
                  <Link to={`/team/${team.id}`}>{team.name}</Link>
                  <span>{team.xp} XP</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{message1 || 'Aucune équipe trouvée.'}</p>
          )}
        </div>
        <div className="ladder-block">
          <h2>{ladder2Name || 'Ladder 2'}</h2>
          {ladder2.length > 0 ? (
            <ul className="ranking-list">
              {ladder2.map((team, index) => (
                <li key={team.id} className="ranking-row">
                  <span>
                    {index + 1}
                    {index === 0 && (
                      <i className="fa-solid fa-trophy trophy gold" />
                    )}
                    {index === 1 && (
                      <i className="fa-solid fa-trophy trophy silver" />
                    )}
                    {index === 2 && (
                      <i className="fa-solid fa-trophy trophy bronze" />
                    )}
                  </span>
                  <Link to={`/team/${team.id}`}>{team.name}</Link>
                  <span>{team.xp} XP</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>{message2 || 'Aucune équipe trouvée.'}</p>
          )}
        </div>
    </div>
  </div>
  );
}

export default Home;
