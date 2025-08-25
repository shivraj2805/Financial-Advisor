const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['game', 'learning', 'social', 'special']
  },
  gameType: {
    type: String,
    enum: ['quiz', 'memory', 'budget', 'investment', 'wordpuzzle', 'all']
  },
  criteria: {
    type: {
      type: String,
      required: true,
      enum: ['score', 'games_played', 'win_streak', 'time_spent', 'perfect_score', 'first_win', 'level_reach']
    },
    value: {
      type: Number,
      required: true
    },
    condition: {
      type: String,
      enum: ['greater_than', 'equal_to', 'less_than'],
      default: 'greater_than'
    }
  },
  rewards: {
    points: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    badge: { type: String, default: null },
    unlock: { type: String, default: null }
  },
  icon: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Predefined achievements
const predefinedAchievements = [
  {
    name: "First Steps",
    description: "Complete your first game",
    category: "game",
    gameType: "all",
    criteria: { type: "games_played", value: 1, condition: "greater_than" },
    rewards: { points: 50, experience: 10 },
    icon: "🎯",
    rarity: "common"
  },
  {
    name: "Quiz Master",
    description: "Score 100% in a quiz game",
    category: "game",
    gameType: "quiz",
    criteria: { type: "perfect_score", value: 100, condition: "equal_to" },
    rewards: { points: 200, experience: 50, badge: "quiz_master" },
    icon: "🧠",
    rarity: "rare"
  },
  {
    name: "Memory Champion",
    description: "Complete memory game in under 10 moves",
    category: "game",
    gameType: "memory",
    criteria: { type: "score", value: 80, condition: "greater_than" },
    rewards: { points: 150, experience: 40 },
    icon: "🎯",
    rarity: "rare"
  },
  {
    name: "Budget Expert",
    description: "Achieve 90+ score in budget challenge",
    category: "game",
    gameType: "budget",
    criteria: { type: "score", value: 90, condition: "greater_than" },
    rewards: { points: 180, experience: 45 },
    icon: "💰",
    rarity: "epic"
  },
  {
    name: "Investment Guru",
    description: "Earn 15%+ return in investment simulator",
    category: "game",
    gameType: "investment",
    criteria: { type: "score", value: 85, condition: "greater_than" },
    rewards: { points: 250, experience: 60 },
    icon: "📈",
    rarity: "epic"
  },
  {
    name: "Word Wizard",
    description: "Complete word puzzle without hints",
    category: "game",
    gameType: "wordpuzzle",
    criteria: { type: "perfect_score", value: 100, condition: "equal_to" },
    rewards: { points: 120, experience: 30 },
    icon: "📚",
    rarity: "rare"
  },
  {
    name: "Dedicated Learner",
    description: "Play 50 games total",
    category: "learning",
    gameType: "all",
    criteria: { type: "games_played", value: 50, condition: "greater_than" },
    rewards: { points: 500, experience: 100, badge: "dedicated_learner" },
    icon: "🎓",
    rarity: "epic"
  },
  {
    name: "Streak Master",
    description: "Win 5 games in a row",
    category: "game",
    gameType: "all",
    criteria: { type: "win_streak", value: 5, condition: "greater_than" },
    rewards: { points: 300, experience: 75 },
    icon: "🔥",
    rarity: "legendary"
  },
  {
    name: "Time Investment",
    description: "Spend 2 hours playing games",
    category: "learning",
    gameType: "all",
    criteria: { type: "time_spent", value: 120, condition: "greater_than" },
    rewards: { points: 400, experience: 80 },
    icon: "⏰",
    rarity: "rare"
  },
  {
    name: "Level 10",
    description: "Reach level 10",
    category: "learning",
    gameType: "all",
    criteria: { type: "level_reach", value: 10, condition: "equal_to" },
    rewards: { points: 1000, experience: 200, badge: "level_10" },
    icon: "⭐",
    rarity: "legendary"
  }
];

// Initialize achievements if they don't exist
achievementSchema.statics.initializeAchievements = async function() {
  try {
    for (const achievement of predefinedAchievements) {
      await this.findOneAndUpdate(
        { name: achievement.name },
        achievement,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Achievements initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing achievements:', error);
  }
};

module.exports = mongoose.model('Achievement', achievementSchema);