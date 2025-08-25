const express = require('express');
const router = express.Router();
const { 
  getUserProfile,
  getUserProgress, 
  saveProgress, 
  getGameData, 
  createMultiplayerGame,
  joinMultiplayerGame,
  getAvailableGames,
  getLeaderboard, 
  getUserStats 
} = require('../controllers/gameController');
const Auth = require('../middlewares/Auth');

// Apply authentication middleware to all routes
router.use(Auth);

// User profile and progress
router.get('/profile', getUserProfile);
router.get('/progress', getUserProgress);
router.get('/stats/user', getUserStats);

// Game progress and data
router.post('/save-progress', saveProgress);
router.get('/:gameType/data', getGameData);

// Multiplayer functionality
router.post('/multiplayer/create', createMultiplayerGame);
router.post('/multiplayer/:gameId/join', joinMultiplayerGame);
router.get('/multiplayer/available', getAvailableGames);

// Leaderboards and rankings
router.get('/:gameType/leaderboard', getLeaderboard);

module.exports = router;