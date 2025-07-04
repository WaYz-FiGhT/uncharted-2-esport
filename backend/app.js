const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const isAdmin = require('./routes/tickets/isAdmin');
const startReportProcessing = require('./jobs/processReports');
const logger = require('./logger');
const morgan = require('morgan');

const app = express();

app.use(morgan('combined', { stream: logger.stream }));
// CORS : autorise React à faire des requêtes
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Sessions
app.use(session({
  secret: 'un-secret-securise',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 3600000
  }
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// ✅ ROUTES STRUCTURÉES

// Auth
app.use('/auth/login', require('./routes/auth/login'));
app.use('/auth/logout', require('./routes/auth/logout'));
app.use('/auth/register', require('./routes/auth/register'));
app.use('/auth/verify-email', require('./routes/auth/verify_email'));

// Session info
app.get('/session-info', (req, res) => {
  if (req.session.user) {
    const { id, username, team_id_ladder1, team_id_ladder2, team_id_ladder3, is_admin } = req.session.user;
    return res.json({ id, username, team_id_ladder1, team_id_ladder2, team_id_ladder3, is_admin });
  } else {
    return res.status(401).json({ error: 'Non connecté' });
  }
});


// Teams
app.use('/teams/create', require('./routes/teams/create_team'));
app.use('/teams/get_myteams', require('./routes/teams/get_myteams'));
app.use('/teams/get_myteamsasmember', require('./routes/teams/get_myteamsasmember'));
app.use('/teams/members', require('./routes/teams/get_membersteam'));
app.use('/teams/get_teamselected', require('./routes/teams/get_teamselected'));
app.use('/teams/add-member', require('./routes/teams/add_memteam'));
app.use('/teams/invite', require('./routes/teams/invite_member'));
app.use('/teams/invitations', require('./routes/teams/get_invitations'));
app.use('/teams/respond-invitation', require('./routes/teams/respond_invitation'));
app.use('/teams/leave', require('./routes/teams/leave_team'));
app.use('/teams/delete', require('./routes/teams/delete_team'));
app.use('/teams/kick-member', require('./routes/teams/kick_member'));
app.use('/teams/by-captain', require('./routes/teams/byCaptain'));
app.use('/teams/by-member', require('./routes/teams/byMember'));
app.use('/teams/details', require('./routes/teams/get_teamselected'));
app.use('/teams/get_playerid', require('./routes/teams/get_playerid'));
app.use('/teams/ranking', require('./routes/teams/get_ranking'));
app.use('/teams/update-picture', require('./routes/teams/update_picture'));


// Players
app.use('/players/profile', require('./routes/players/get_profile'));
app.use('/players/update-profile-picture', require('./routes/players/update_profile_picture'));

// tickets
app.use('/tickets/create', require('./routes/tickets/create'));
app.use('/tickets/check', require('./routes/tickets/check'));
app.use('/tickets/get_single', isAdmin, require('./routes/tickets/get_single'));


// Matches
app.use('/matches/create', require('./routes/matches/create_match'));
app.use('/matches/accept', require('./routes/matches/accept_match'));
app.use('/matches/pending', require('./routes/matches/get_matchpending'));
app.use('/matches/team', require('./routes/matches/get_matchteam'));
app.use('/matches/details', require('./routes/matches/get_matchdetails'));
app.use('/matches/report', require('./routes/matches/report'));
app.use('/matches/delete-pending', require('./routes/matches/delete_pending'));

// Ladders
app.use('/ladders/name', require('./routes/ladders/get_laddername'));

// Redondance à supprimer (❌ à ne pas faire)
// app.use('/create_team', require('./routes/create_team')); etc.
// app.use('/login', require('./routes/login')); etc.

// 🔄 Traitement automatique des reports
startReportProcessing();

// ✅ Lancement
app.listen(3000, () => {
  logger.info('✅ Backend lancé sur http://localhost:3000');
});
