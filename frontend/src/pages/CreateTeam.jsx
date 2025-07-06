import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function CreateTeam() {
  const [name, setName] = useState('');
  const [ladderId, setLadderId] = useState('');
  const [teamPictureFile, setTeamPictureFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Vérifie la session
  useEffect(() => {
    axios.get('http://localhost:3000/session-info', { withCredentials: true })
      .then(res => setUserId(res.data.id))
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setTeamPictureFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview('');
    }
  };


  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !ladderId) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('user_id', userId);
      formData.append('ladder_id', ladderId);
      if (teamPictureFile) {
        formData.append('picture', teamPictureFile);
      }

      const res = await axios.post('http://localhost:3000/teams/create', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 201) {
        setMessage('Team created successfully.');
        setName('');
        setLadderId('');
        setTeamPictureFile(null);
        setPreview('');
      } else {
        setMessage(res.data.error || 'Error creating team.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Network error during creation.';
      setMessage(errorMsg);
    }
  };

  return (
     <div className="container">

      <form onSubmit={handleSubmit}>
        <label>Team name:</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Team name"
          maxLength={24}
          required
        />

        <label>Ladder :</label>
        <select value={ladderId} onChange={e => setLadderId(e.target.value)} required>
          <option value="">-- Select a ladder --</option>
          <option value="1">Uncharted 2 - 2vs2</option>
          <option value="2">Uncharted 2 - 3vs3, 4vs4, 5vs5</option>
          <option value="3">Uncharted 2 - 1vs1</option>
        </select>

        <label>Team picture:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ width: '100px', marginTop: '10px' }}
          />
        )}

        <button type="submit">Create</button>
      </form>

      {message && <p>{message}</p>}
      </div>
  );
}

export default CreateTeam;
