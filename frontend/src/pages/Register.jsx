import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [psn, setPsn] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/auth/register', {
        username,
        password,
        confirmPassword,
        email,
        psn
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err?.response?.data?.error || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="page-center">
      <div className="page-content">
        <h1>Inscription</h1>
        <form onSubmit={handleSubmit}>
        <label>Nom d'utilisateur :</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Email :</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Mot de passe :</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <label>Confirmer le mot de passe :</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

        <label>PSN :</label>
        <input value={psn} onChange={(e) => setPsn(e.target.value)} required />

        <button type="submit">Créer mon compte</button>
        </form>
        {message && <p className="error">{message}</p>}
      </div>
    </div>
  );
}

export default Register;
