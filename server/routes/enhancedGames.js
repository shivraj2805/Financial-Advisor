const express = require('express');
const router = express.Router();
const Auth = require('../middlewares/Auth');

// Import the enhanced controller
const {
  getUserProfile,
  getUserProgress,
  getUserStats,
  saveProgress,
  updateProgress,
  deleteProgress,
  getGameData,
  createMultiplayerGame,
  joinMultiplayerGame,
  getAvailableGames,
  startMultiplayerGame,
  getLeaderboard,
  checkAchievements
} = require('../controllers/gameController');

// Apply authentication middleware to all routes
router.use(Auth);

// ==================== USER PROFILE & PROGRESS ====================
router.get('/profile', getUserProfile);
router.get('/progress', getUserProgress);
router.get('/stats/user', getUserStats);

// ==================== GAME PROGRESS CRUD ====================
router.post('/save-progress', saveProgress);
router.put('/progress/:gameType', updateProgress);
router.delete('/progress/:gameType', deleteProgress);

// ==================== GAME DATA ====================
router.get('/:gameType/data', getGameData);

// ==================== MULTIPLAYER FUNCTIONALITY ====================
router.post('/multiplayer/create', createMultiplayerGame);
router.post('/multiplayer/:gameId/join', joinMultiplayerGame);
router.get('/multiplayer/available', getAvailableGames);
router.post('/multiplayer/:gameId/start', startMultiplayerGame);

// ==================== LEADERBOARDS & STATISTICS ====================
router.get('/:gameType/leaderboard', getLeaderboard);

module.exports = router;