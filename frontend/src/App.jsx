import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import CreateTeam from './pages/CreateTeam';
import MyTeams from './pages/MyTeams';
import TeamDetails from './pages/TeamDetails';
import AddMember from './pages/AddMember';
import PostMatch from './pages/PostMatch';
import AcceptMatch from './pages/AcceptMatch';
import MatchDetails from './pages/MatchDetails';
import ReportMatch from './pages/ReportMatch';
import Ranking from './pages/Ranking';
import DisputeTickets from './pages/DisputeTickets';
import TicketDetails from './pages/TicketDetails';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Invitations from './pages/Invitations';
import Profile from './pages/Profile';
import Rules from './pages/Rules';

import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('/session-info')
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/create-team" element={<CreateTeam />} />
        <Route path="/mes-equipes" element={<MyTeams />} />
        <Route path="/team/:team_id" element={<TeamDetails />} />
        <Route path="/team/:team_id/:ladder_id/add-member" element={<AddMember />} />
        <Route path="/team/:team_id/:ladder_id/create-match" element={<PostMatch />} />
        <Route path="/team/:team_id/accept-match" element={<AcceptMatch />} />
        <Route path="/match/:match_id" element={<MatchDetails />} />
        <Route path="/report/:match_id/:team_id" element={<ReportMatch />} />
        <Route path="/ladder/:ladder_id/ranking" element={<Ranking />} />
        <Route path="/invitations" element={<Invitations />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/rules" element={<Rules />} />

        {/* 🔒 Routes admin-only */}
        <Route
          path="/tickets"
          element={user?.is_admin ? <DisputeTickets /> : <Navigate to="/" />}
        />
        <Route
          path="/ticket/:ticket_id"
          element={user?.is_admin ? <TicketDetails /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
