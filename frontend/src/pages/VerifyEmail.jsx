import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Vérification en cours...');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage('Token manquant.');
      return;
    }

    axios
      .get('http://localhost:3000/auth/verify-email', { params: { token } })
      .then((res) => setMessage(res.data.message))
      .catch((err) => {
        setMessage(err?.response?.data?.error || 'Erreur lors de la vérification');
      });
  }, [token]);

  return (
    <div>
      <p>{message}</p>
    </div>
  );
}

export default VerifyEmail;
