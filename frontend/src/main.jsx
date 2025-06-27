import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // tu peux le créer ou le supprimer si tu n’en as pas besoin

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
