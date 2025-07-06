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
      setMessage('Passwords do not match.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      formData.append('email', email);
      formData.append('psn', psn);

      const res = await axios.post('http://localhost:3000/auth/register', formData);
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
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Email :</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <label>Confirm password:</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

        <label>PSN :</label>
        <input value={psn} onChange={(e) => setPsn(e.target.value)} required />

        <button type="submit">Create my account</button>

        {message && <p className="error">{message}</p>}
        </form>
      </div>
  );
}

export default Register;
