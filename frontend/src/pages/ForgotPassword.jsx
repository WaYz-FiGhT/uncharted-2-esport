import { useState } from 'react';
import axios from 'axios';
import '../App.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Request error.');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send reset link</button>
        {message && <p className="error">{message}</p>}
      </form>
    </div>
  );
}

export default ForgotPassword;