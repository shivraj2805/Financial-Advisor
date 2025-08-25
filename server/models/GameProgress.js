const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    required: true,
    enum: ['quiz', 'memory', 'budget', 'investment', 'wordpuzzle', 'break-the-bank-sorting', 'dolphin-dash-counting', 'money-bingo', 'budget-challenge', 'investment-simulator', 'financial-quiz', 'savings-goals', 'expense-tracker']
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Enhanced user-specific data
  totalPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  achievements: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  rewards: [{
    type: String, // 'badge', 'points', 'unlock'
    name: String,
    description: String,
    value: Number,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  gameStats: {
    totalGamesPlayed: { type: Number, default: 0 },
    totalTimePlayed: { type: Number, default: 0 }, // in minutes
    bestScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    winStreak: { type: Number, default: 0 },
    lastPlayed: { type: Date, default: Date.now }
  },
  // Multiplayer data
  multiplayerStats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    gamesLost: { type: Number, default: 0 },
    totalMultiplayerPoints: { type: Number, default: 0 },
    rank: { type: String, default: 'Bronze' }
  },
  // Learning progress tracking
  learningProgress: {
    topicsCompleted: [String],
    skillsMastered: [String],
    knowledgeLevel: { type: String, default: 'Beginner' },
    certificates: [{
      name: String,
      issuedAt: Date,
      score: Number
    }]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress record per user per game type
gameProgressSchema.index({ userId: 1, gameType: 1 }, { unique: true });

// Index for leaderboards and rankings
gameProgressSchema.index({ score: -1, timestamp: 1 });
gameProgressSchema.index({ 'gameStats.totalGamesPlayed': -1 });
gameProgressSchema.index({ 'multiplayerStats.gamesWon': -1 });

module.exports = mongoose.model('GameProgress', gameProgressSchema);