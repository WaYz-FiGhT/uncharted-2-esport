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

    if (!username.trim() || !psn.trim()) {
      setMessage('Username and PSN cannot be empty.');
      return;
    }

    if (password.length < 8 || password.length > 24) {
      setMessage('Password must be between 8 and 24 characters.');
      return;
    }


    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post('/auth/register', {
        username,
        password,
        confirmPassword,
        email,
        psn,
      });
      setMessage(res.data.message);
      navigate('/login');
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Registration error.');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={16}
          required
        />

        <label>Email :</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          maxLength={24}
          required
        />

        <label>Confirm password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          maxLength={24}
          required
        />

        <label>PSN :</label>
        <input
          value={psn}
          onChange={(e) => setPsn(e.target.value)}
          maxLength={16}
          required
        />

        <button type="submit">Create my account</button>

        {message && <p className="error">{message}</p>}
        </form>
      </div>
  );
}

export default Register;
