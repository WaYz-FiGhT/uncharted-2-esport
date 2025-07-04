import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [psn, setPsn] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
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
      const res = await axios.post('http://localhost:3000/auth/register', {
        username,
        password,
        confirmPassword,
        email,
        psn,
        profile_picture_url: profilePictureUrl
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
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Email :</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <label>Confirm password:</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

        <label>PSN :</label>
        <input value={psn} onChange={(e) => setPsn(e.target.value)} required />

        <label>Profile picture URL:</label>
        <input value={profilePictureUrl} onChange={(e) => setProfilePictureUrl(e.target.value)} />

        <button type="submit">Create my account</button>
        </form>
        {message && <p className="error">{message}</p>}
      </div>
  );
}

export default Register;
