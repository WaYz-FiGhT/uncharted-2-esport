import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    try {
      const res = await axios.post('/auth/reset-password', { token, password });
      setMessage(res.data.message);
      navigate('/login');
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Reset error.');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <label>New password:</label>
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
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          maxLength={24}
          required
        />
        <button type="submit">Change password</button>
        {message && <p className="error">{message}</p>}
      </form>
    </div>
  );
}

export default ResetPassword;