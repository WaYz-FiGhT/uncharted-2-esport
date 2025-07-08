import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/auth/login', {
        username,
        password
      });

      // ✅ Met à jour l'état utilisateur global
      setUser(res.data);

      // ✅ Redirige immédiatement après la connexion
      navigate('/');
    } catch (err) {
     console.error('Login error', err);
      setError(err?.response?.data?.error || 'Incorrect credentials.');
    }
  };

  return (
    <div className="container">
        <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Log in</button>
        <button type="button" onClick={() => navigate('/forgot-password')}>
          Forgot password?
        </button>
        {error && <p className="error">{error}</p>}
        </form>
      </div>

  );
}

export default Login;
