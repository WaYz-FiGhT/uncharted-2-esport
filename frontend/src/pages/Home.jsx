import { useNavigate } from 'react-router-dom';
import '../App.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="page-center">
      <div className="page-content">
        <h1>Menu</h1>
        <h2>Créer son profil</h2>
        <button onClick={() => navigate('/register')}>S'inscrire</button>
        <button onClick={() => navigate('/login')}>Se connecter</button>
      </div>
    </div>
  );
}

export default Home;
