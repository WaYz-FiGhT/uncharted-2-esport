import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function VerifyEmail() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Verifying...');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const token = params.get('token');
    axios.get(`http://localhost:3000/auth/verify-email?token=${token}`)
      .then(() => setMessage('Email verified! You can now log in.'))
      .catch(() => setMessage('Invalid or expired verification link.'));
  }, [params]);

  return (
    <div className="page-center">
      <div className="page-content">
        <p>{message}</p>
      </div>
    </div>
  );
}

export default VerifyEmail;