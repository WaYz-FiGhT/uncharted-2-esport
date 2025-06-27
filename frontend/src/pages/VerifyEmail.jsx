import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    const token = params.get('token');
    axios.get(`http://localhost:3000/auth/verify-email?token=${token}`)
      .then(() => setMessage('Email vérifié ! Vous pouvez maintenant vous connecter.'))
      .catch(() => setMessage('Lien de vérification invalide ou expiré.'));
  }, [params]);

  return (
    <div className="page-center">
      <p>{message}</p>
    </div>
  );
}

export default VerifyEmail;