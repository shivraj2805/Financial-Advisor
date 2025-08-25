const GameProgress = require('../models/GameProgress');
const MultiplayerGame = require('../models/MultiplayerGame');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize achievements on startup
Achievement.initializeAchievements();

// ==================== USER PROFILE & PROGRESS ====================

// Get user's complete game profile with all stats
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's game progress
    const progress = await GameProgress.find({ userId })
      .select('gameType score totalPoints level experience achievements rewards gameStats multiplayerStats learningProgress')
      .sort({ timestamp: -1 });

    // Get user info
    const user = await User.findById(userId).select('name email picture');
    
    // Calculate overall stats
    const overallStats = {
      totalPoints: 0,
      totalExperience: 0,
      totalGames: 0,
      averageScore: 0,
      achievements: [],
      rewards: [],
      level: 1,
      rank: 'Bronze',
      winRate: 0,
      totalPlayTime: 0
    };

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.gameType] = p;
      overallStats.totalPoints += p.totalPoints || 0;
      overallStats.totalExperience += p.experience || 0;
      overallStats.totalGames += p.gameStats?.totalGamesPlayed || 0;
      overallStats.totalPlayTime += p.gameStats?.totalTimePlayed || 0;
      overallStats.achievements.push(...(p.achievements || []));
      overallStats.rewards.push(...(p.rewards || []));
    });

    if (progress.length > 0) {
      const totalScore = progress.reduce((sum, p) => sum + (p.score || 0), 0);
      overallStats.averageScore = Math.round(totalScore / progress.length);
    }

    // Calculate level and rank
    overallStats.level = Math.floor(overallStats.totalExperience / 100) + 1;
    
    if (overallStats.totalPoints >= 5000) overallStats.rank = 'Diamond';
    else if (overallStats.totalPoints >= 3000) overallStats.rank = 'Platinum';
    else if (overallStats.totalPoints >= 1500) overallStats.rank = 'Gold';
    else if (overallStats.totalPoints >= 500) overallStats.rank = 'Silver';
    else overallStats.rank = 'Bronze';

    // Calculate win rate
    const totalMultiplayerGames = progress.reduce((sum, p) => sum + (p.multiplayerStats?.gamesPlayed || 0), 0);
    const totalWins = progress.reduce((sum, p) => sum + (p.multiplayerStats?.gamesWon || 0), 0);
    overallStats.winRate = totalMultiplayerGames > 0 ? Math.round((totalWins / totalMultiplayerGames) * 100) : 0;

    res.json({ 
      success: true, 
      profile: {
        user,
        overallStats,
        gameProgress: progressMap,
        recentAchievements: overallStats.achievements.slice(-5),
        recentActivity: progress.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch profile' 
    });
  }
};

// Get user's game progress
const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const progress = await GameProgress.find({ userId })
      .select('gameType score totalPoints level experience gameStats lastPlayed achievements')
      .sort({ timestamp: -1 });

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.gameType] = {
        score: p.score,
        totalPoints: p.totalPoints,
        level: p.level,
        experience: p.experience,
        gamesPlayed: p.gameStats?.totalGamesPlayed || 0,
        lastPlayed: p.lastPlayed,
        achievements: p.achievements || []
      };
    });

    res.json({ 
      success: true, 
      progress: progressMap 
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch progress' 
    });
  }
};

// ==================== GAME PROGRESS CRUD ====================

// Save user's game progress with rewards and achievements
const saveProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType, score, timestamp, gameTime, details, difficulty } = req.body;

    if (!gameType || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Game type and score are required'
      });
    }

    const validGameTypes = ['quiz', 'memory', 'budget', 'investment', 'wordpuzzle'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game type'
      });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        error: 'Score must be between 0 and 100'
      });
    }

    // Calculate rewards and experience based on difficulty
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2
    };
    
    const multiplier = difficultyMultiplier[difficulty] || 1;
    const basePoints = Math.floor(score * 2 * multiplier);
    const timeBonus = gameTime ? Math.floor(gameTime / 60) * 5 : 0;
    const totalPoints = basePoints + timeBonus;
    const experience = Math.floor(totalPoints / 2);

    let progress = await GameProgress.findOne({ userId, gameType });
    
    if (!progress) {
      progress = new GameProgress({
        userId,
        gameType,
        score: 0,
        totalPoints: 0,
        level: 1,
        experience: 0,
        gameStats: {
          totalGamesPlayed: 0,
          totalTimePlayed: 0,
          bestScore: 0,
          averageScore: 0,
          winStreak: 0
        },
        achievements: [],
        rewards: []
      });
    }

    const oldScore = progress.score;
    const oldGamesPlayed = progress.gameStats?.totalGamesPlayed || 0;
    const oldTimePlayed = progress.gameStats?.totalTimePlayed || 0;

    // Update progress
    progress.score = Math.max(progress.score, score);
    progress.totalPoints += totalPoints;
    progress.experience += experience;
    progress.level = Math.floor(progress.experience / 100) + 1;
    progress.timestamp = timestamp || new Date();
    progress.details = details || {};

    // Update game stats
    progress.gameStats.totalGamesPlayed = oldGamesPlayed + 1;
    progress.gameStats.totalTimePlayed = oldTimePlayed + (gameTime || 0);
    progress.gameStats.bestScore = Math.max(progress.gameStats.bestScore || 0, score);
    progress.gameStats.lastPlayed = new Date();

    // Calculate average score
    const allProgress = await GameProgress.find({ userId, gameType });
    const totalScore = allProgress.reduce((sum, p) => sum + p.score, 0) + score;
    progress.gameStats.averageScore = Math.round(totalScore / (allProgress.length + 1));

    // Update win streak
    if (score > oldScore) {
      progress.gameStats.winStreak = (progress.gameStats.winStreak || 0) + 1;
    } else {
      progress.gameStats.winStreak = 0;
    }

    await progress.save();

    // Check and award achievements
    const newAchievements = await checkAchievements(userId, gameType, score, progress);

    // Update multiplayer stats if applicable
    if (details?.multiplayer) {
      await updateMultiplayerStats(userId, gameType, score, details);
    }

    res.json({
      success: true,
      message: 'Progress saved successfully',
      progress: {
        gameType: progress.gameType,
        score: progress.score,
        totalPoints: progress.totalPoints,
        level: progress.level,
        experience: progress.experience,
        rewards: {
          points: totalPoints,
          experience: experience,
          timeBonus: timeBonus,
          difficultyBonus: multiplier
        }
      },
      achievements: newAchievements
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save progress'
    });
  }
};

// Update user's game progress
const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType } = req.params;
    const updateData = req.body;

    const progress = await GameProgress.findOne({ userId, gameType });
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Progress not found'
      });
    }

    // Update allowed fields
    if (updateData.score !== undefined) progress.score = updateData.score;
    if (updateData.totalPoints !== undefined) progress.totalPoints = updateData.totalPoints;
    if (updateData.experience !== undefined) progress.experience = updateData.experience;
    if (updateData.level !== undefined) progress.level = updateData.level;
    if (updateData.gameStats) progress.gameStats = { ...progress.gameStats, ...updateData.gameStats };

    await progress.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update progress'
    });
  }
};

// Delete user's game progress
const deleteProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType } = req.params;

    const result = await GameProgress.findOneAndDelete({ userId, gameType });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Progress not found'
      });
    }

    res.json({
      success: true,
      message: 'Progress deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete progress'
    });
  }
};

// ==================== GAME DATA & CONTENT ====================

// Get game data with difficulty levels
const getGameData = async (req, res) => {
  try {
    const { gameType } = req.params;
    const { difficulty = 'medium' } = req.query;
    
    const validGameTypes = ['quiz', 'memory', 'budget', 'investment', 'wordpuzzle'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game type'
      });
    }

    let gameData;

    switch (gameType) {
      case 'quiz':
        gameData = await generateQuizQuestions(difficulty);
        break;
      case 'memory':
        gameData = getMemoryGameData(difficulty);
        break;
      case 'budget':
        gameData = getBudgetGameData(difficulty);
        break;
      case 'investment':
        gameData = getInvestmentGameData(difficulty);
        break;
      case 'wordpuzzle':
        gameData = getWordPuzzleData(difficulty);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Unknown game type'
        });
    }

    res.json({
      success: true,
      data: gameData,
      difficulty,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting game data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game data'
    });
  }
};

// ==================== MULTIPLAYER FUNCTIONALITY ====================

// Create multiplayer game
const createMultiplayerGame = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType, maxPlayers = 4, settings = {} } = req.body;

    const validGameTypes = ['quiz', 'memory', 'budget', 'investment', 'wordpuzzle'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game type'
      });
    }

    const user = await User.findById(userId).select('name');
    
    const game = new MultiplayerGame({
      gameType,
      maxPlayers,
      settings,
      createdBy: userId,
      players: [{
        userId,
        username: user.name,
        isHost: true,
        isReady: true
      }]
    });

    await game.save();

    res.json({
      success: true,
      game: {
        id: game._id,
        gameType: game.gameType,
        status: game.status,
        players: game.players,
        maxPlayers: game.maxPlayers,
        settings: game.settings,
        createdAt: game.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating multiplayer game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create multiplayer game'
    });
  }
};

// Join multiplayer game
const joinMultiplayerGame = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;

    const game = await MultiplayerGame.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        error: 'Game is not accepting players'
      });
    }

    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({
        success: false,
        error: 'Game is full'
      });
    }

    const existingPlayer = game.players.find(p => p.userId.toString() === userId);
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        error: 'Already in this game'
      });
    }

    const user = await User.findById(userId).select('name');
    
    game.players.push({
      userId,
      username: user.name,
      isReady: false
    });

    await game.save();

    res.json({
      success: true,
      message: 'Joined game successfully',
      game: {
        id: game._id,
        gameType: game.gameType,
        status: game.status,
        players: game.players,
        maxPlayers: game.maxPlayers
      }
    });
  } catch (error) {
    console.error('Error joining multiplayer game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join game'
    });
  }
};

// Get available multiplayer games
const getAvailableGames = async (req, res) => {
  try {
    const { gameType } = req.query;
    
    const filter = { status: 'waiting' };
    if (gameType) {
      filter.gameType = gameType;
    }

    const games = await MultiplayerGame.find(filter)
      .populate('createdBy', 'name')
      .populate('players.userId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      games: games.map(game => ({
        id: game._id,
        gameType: game.gameType,
        players: game.players.length,
        maxPlayers: game.maxPlayers,
        createdBy: game.createdBy.name,
        createdAt: game.createdAt,
        settings: game.settings
      }))
    });
  } catch (error) {
    console.error('Error fetching available games:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available games'
    });
  }
};

// Start multiplayer game
const startMultiplayerGame = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;

    const game = await MultiplayerGame.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    if (game.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only host can start the game'
      });
    }

    if (game.players.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Need at least 2 players to start'
      });
    }

    game.status = 'active';
    game.startedAt = new Date();
    await game.save();

    res.json({
      success: true,
      message: 'Game started successfully',
      game: {
        id: game._id,
        status: game.status,
        startedAt: game.startedAt
      }
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start game'
    });
  }
};

// ==================== LEADERBOARDS & STATISTICS ====================

// Get leaderboard for a specific game
const getLeaderboard = async (req, res) => {
  try {
    const { gameType } = req.params;
    const { limit = 10 } = req.query;
    
    const validGameTypes = ['quiz', 'memory', 'budget', 'investment', 'wordpuzzle'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game type'
      });
    }

    const leaderboard = await GameProgress.find({ gameType })
      .populate('userId', 'name email picture')
      .sort({ score: -1, timestamp: 1 })
      .limit(parseInt(limit))
      .select('score timestamp userId totalPoints level');

    res.json({
      success: true,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        score: entry.score,
        totalPoints: entry.totalPoints,
        level: entry.level,
        timestamp: entry.timestamp,
        user: {
          name: entry.userId.name,
          email: entry.userId.email,
          picture: entry.userId.picture
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await GameProgress.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: '$gameStats.totalGamesPlayed' },
          averageScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          totalScore: { $sum: '$score' },
          totalPoints: { $sum: '$totalPoints' },
          totalExperience: { $sum: '$experience' },
          maxLevel: { $max: '$level' },
          totalPlayTime: { $sum: '$gameStats.totalTimePlayed' }
        }
      }
    ]);

    const gameStats = await GameProgress.find({ userId })
      .select('gameType score totalPoints level experience gameStats multiplayerStats')
      .sort({ timestamp: -1 });

    const achievements = await GameProgress.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $unwind: '$achievements' },
      { $group: { _id: null, achievements: { $push: '$achievements' } } }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalGames: 0,
        averageScore: 0,
        highestScore: 0,
        totalScore: 0,
        totalPoints: 0,
        totalExperience: 0,
        maxLevel: 1,
        totalPlayTime: 0
      },
      gameStats: gameStats,
      achievements: achievements[0]?.achievements || []
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
};

// ==================== ACHIEVEMENTS & REWARDS ====================

// Check and award achievements
const checkAchievements = async (userId, gameType, score, progress) => {
  try {
    const achievements = await Achievement.find({ 
      isActive: true,
      $or: [
        { gameType: gameType },
        { gameType: 'all' }
      ]
    });

    const newAchievements = [];
    const userProgress = await GameProgress.find({ userId });

    for (const achievement of achievements) {
      const hasAchievement = userProgress.some(p => 
        p.achievements?.some(a => a.name === achievement.name)
      );

      if (hasAchievement) continue;

      let shouldAward = false;
      const criteria = achievement.criteria;

      switch (criteria.type) {
        case 'score':
          shouldAward = checkCondition(score, criteria.value, criteria.condition);
          break;
        case 'games_played':
          const totalGames = userProgress.reduce((sum, p) => sum + (p.gameStats?.totalGamesPlayed || 0), 0);
          shouldAward = checkCondition(totalGames, criteria.value, criteria.condition);
          break;
        case 'perfect_score':
          shouldAward = score === 100;
          break;
        case 'win_streak':
          const maxStreak = Math.max(...userProgress.map(p => p.gameStats?.winStreak || 0));
          shouldAward = checkCondition(maxStreak, criteria.value, criteria.condition);
          break;
        case 'time_spent':
          const totalTime = userProgress.reduce((sum, p) => sum + (p.gameStats?.totalTimePlayed || 0), 0);
          shouldAward = checkCondition(totalTime, criteria.value, criteria.condition);
          break;
        case 'level_reach':
          const maxLevel = Math.max(...userProgress.map(p => p.level || 1));
          shouldAward = checkCondition(maxLevel, criteria.value, criteria.condition);
          break;
      }

      if (shouldAward) {
        await GameProgress.updateMany(
          { userId },
          {
            $push: {
              achievements: {
                name: achievement.name,
                description: achievement.description,
                earnedAt: new Date(),
                icon: achievement.icon
              },
              rewards: {
                type: 'achievement',
                name: achievement.name,
                description: `Earned ${achievement.rewards.points} points and ${achievement.rewards.experience} XP`,
                value: achievement.rewards.points,
                earnedAt: new Date()
              }
            },
            $inc: {
              totalPoints: achievement.rewards.points,
              experience: achievement.rewards.experience
            }
          }
        );

        newAchievements.push({
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          rewards: achievement.rewards
        });
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

// Helper function to check conditions
const checkCondition = (value, target, condition) => {
  switch (condition) {
    case 'greater_than':
      return value > target;
    case 'equal_to':
      return value === target;
    case 'less_than':
      return value < target;
    default:
      return false;
  }
};

// Update multiplayer stats
const updateMultiplayerStats = async (userId, gameType, score, details) => {
  try {
    const progress = await GameProgress.findOne({ userId, gameType });
    if (!progress) return;

    if (!progress.multiplayerStats) {
      progress.multiplayerStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        totalMultiplayerPoints: 0,
        rank: 'Bronze'
      };
    }

    progress.multiplayerStats.gamesPlayed += 1;
    progress.multiplayerStats.totalMultiplayerPoints += score;

    if (details.rank === 1) {
      progress.multiplayerStats.gamesWon += 1;
    } else {
      progress.multiplayerStats.gamesLost += 1;
    }

    const winRate = progress.multiplayerStats.gamesWon / progress.multiplayerStats.gamesPlayed;
    if (winRate >= 0.8) progress.multiplayerStats.rank = 'Diamond';
    else if (winRate >= 0.6) progress.multiplayerStats.rank = 'Platinum';
    else if (winRate >= 0.4) progress.multiplayerStats.rank = 'Gold';
    else if (winRate >= 0.2) progress.multiplayerStats.rank = 'Silver';
    else progress.multiplayerStats.rank = 'Bronze';

    await progress.save();
  } catch (error) {
    console.error('Error updating multiplayer stats:', error);
  }
};

// ==================== GAME DATA GENERATORS ====================

// Generate quiz questions using AI with difficulty
const generateQuizQuestions = async (difficulty = 'medium') => {
  try {
    const difficultyPrompts = {
      easy: 'Generate 5 basic multiple choice questions about personal finance suitable for beginners.',
      medium: 'Generate 5 intermediate multiple choice questions about investments and money management.',
      hard: 'Generate 5 advanced multiple choice questions about complex financial concepts and strategies.'
    };

    const prompt = `${difficultyPrompts[difficulty] || difficultyPrompts.medium}
    Each question should have 4 options with one correct answer. 
    Include explanations for the correct answers.
    Format the response as a JSON array with the following structure:
    [
      {
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": 0,
        "explanation": "Explanation of why this is correct"
      }
    ]
    
    Make the questions educational and relevant to Indian financial context.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return getDefaultQuizQuestions();
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    return getDefaultQuizQuestions();
  }
};

// Default quiz questions (fallback)
const getDefaultQuizQuestions = () => {
  return [
    {
      question: "What is compound interest?",
      options: [
        "Interest earned only on the principal amount",
        "Interest earned on both principal and accumulated interest",
        "A type of bank account",
        "A government scheme"
      ],
      correct: 1,
      explanation: "Compound interest is interest earned on both the principal amount and any accumulated interest from previous periods."
    },
    {
      question: "What is the 50/30/20 rule in budgeting?",
      options: [
        "50% needs, 30% wants, 20% savings",
        "50% savings, 30% needs, 20% wants",
        "50% wants, 30% savings, 20% needs",
        "50% investment, 30% spending, 20% emergency"
      ],
      correct: 0,
      explanation: "The 50/30/20 rule suggests allocating 50% of income to needs, 30% to wants, and 20% to savings and debt repayment."
    },
    {
      question: "What is an emergency fund?",
      options: [
        "Money saved for vacations",
        "Money saved for buying a house",
        "Money saved for unexpected expenses",
        "Money invested in stocks"
      ],
      correct: 2,
      explanation: "An emergency fund is money set aside to cover unexpected expenses like medical bills, car repairs, or job loss."
    },
    {
      question: "What is diversification in investing?",
      options: [
        "Putting all money in one stock",
        "Spreading investments across different assets",
        "Investing only in bonds",
        "Keeping money in a savings account"
      ],
      correct: 1,
      explanation: "Diversification means spreading your investments across different asset classes to reduce risk."
    },
    {
      question: "What is a credit score?",
      options: [
        "Your bank balance",
        "A number that represents your creditworthiness",
        "Your monthly income",
        "Your savings amount"
      ],
      correct: 1,
      explanation: "A credit score is a number that lenders use to assess your creditworthiness and likelihood of repaying loans."
    }
  ];
};

// Memory game data with difficulty
const getMemoryGameData = (difficulty = 'medium') => {
  const easyCards = [
    { id: 1, term: "SIP", definition: "Systematic Investment Plan" },
    { id: 2, term: "EMI", definition: "Equated Monthly Installment" },
    { id: 3, term: "FD", definition: "Fixed Deposit" }
  ];

  const mediumCards = [
    { id: 1, term: "SIP", definition: "Systematic Investment Plan" },
    { id: 2, term: "EMI", definition: "Equated Monthly Installment" },
    { id: 3, term: "PPF", definition: "Public Provident Fund" },
    { id: 4, term: "FD", definition: "Fixed Deposit" },
    { id: 5, term: "MF", definition: "Mutual Fund" },
    { id: 6, term: "NPS", definition: "National Pension System" }
  ];

  const hardCards = [
    { id: 1, term: "SIP", definition: "Systematic Investment Plan" },
    { id: 2, term: "EMI", definition: "Equated Monthly Installment" },
    { id: 3, term: "PPF", definition: "Public Provident Fund" },
    { id: 4, term: "FD", definition: "Fixed Deposit" },
    { id: 5, term: "MF", definition: "Mutual Fund" },
    { id: 6, term: "NPS", definition: "National Pension System" },
    { id: 7, term: "ETF", definition: "Exchange Traded Fund" },
    { id: 8, term: "REIT", definition: "Real Estate Investment Trust" }
  ];

  let selectedCards;
  switch (difficulty) {
    case 'easy':
      selectedCards = easyCards;
      break;
    case 'hard':
      selectedCards = hardCards;
      break;
    default:
      selectedCards = mediumCards;
  }

  const cards = [];
  selectedCards.forEach((card, index) => {
    cards.push({ ...card, id: index * 2 + 1, matched: false, flipped: false });
    cards.push({ ...card, id: index * 2 + 2, matched: false, flipped: false });
  });

  return { cards };
};

// Budget game data with difficulty
const getBudgetGameData = (difficulty = 'medium') => {
  const scenarios = {
    easy: {
      title: "Basic Budget Challenge",
      income: 30000,
      expenses: [
        { name: "Rent", amount: 10000, category: "Housing" },
        { name: "Groceries", amount: 5000, category: "Food" },
        { name: "Transportation", amount: 3000, category: "Transport" }
      ]
    },
    medium: {
      title: "Monthly Budget Challenge",
      income: 50000,
      expenses: [
        { name: "Rent", amount: 15000, category: "Housing" },
        { name: "Groceries", amount: 8000, category: "Food" },
        { name: "Transportation", amount: 5000, category: "Transport" },
        { name: "Utilities", amount: 3000, category: "Bills" },
        { name: "Entertainment", amount: 4000, category: "Leisure" },
        { name: "Shopping", amount: 6000, category: "Personal" }
      ]
    },
    hard: {
      title: "Advanced Budget Challenge",
      income: 80000,
      expenses: [
        { name: "Rent", amount: 25000, category: "Housing" },
        { name: "Groceries", amount: 12000, category: "Food" },
        { name: "Transportation", amount: 8000, category: "Transport" },
        { name: "Utilities", amount: 5000, category: "Bills" },
        { name: "Entertainment", amount: 8000, category: "Leisure" },
        { name: "Shopping", amount: 10000, category: "Personal" },
        { name: "Insurance", amount: 5000, category: "Insurance" },
        { name: "Investment", amount: 10000, category: "Investment" }
      ]
    }
  };

  return {
    scenarios: [scenarios[difficulty] || scenarios.medium]
  };
};

// Investment game data with difficulty
const getInvestmentGameData = (difficulty = 'medium') => {
  const assets = {
    easy: [
      { name: "Fixed Deposits", risk: "Very Low", return: 7, volatility: 2 },
      { name: "Government Bonds", risk: "Low", return: 8, volatility: 5 },
      { name: "Mutual Funds", risk: "Medium", return: 12, volatility: 15 }
    ],
    medium: [
      { name: "Stocks", risk: "High", return: 15, volatility: 25 },
      { name: "Bonds", risk: "Low", return: 8, volatility: 8 },
      { name: "Mutual Funds", risk: "Medium", return: 12, volatility: 15 },
      { name: "Fixed Deposits", risk: "Very Low", return: 7, volatility: 2 },
      { name: "Gold", risk: "Medium", return: 10, volatility: 20 }
    ],
    hard: [
      { name: "Stocks", risk: "High", return: 18, volatility: 30 },
      { name: "Bonds", risk: "Low", return: 8, volatility: 8 },
      { name: "Mutual Funds", risk: "Medium", return: 14, volatility: 18 },
      { name: "Fixed Deposits", risk: "Very Low", return: 7, volatility: 2 },
      { name: "Gold", risk: "Medium", return: 10, volatility: 20 },
      { name: "Real Estate", risk: "High", return: 20, volatility: 25 },
      { name: "Cryptocurrency", risk: "Very High", return: 30, volatility: 50 }
    ]
  };

  return {
    initialCapital: difficulty === 'easy' ? 50000 : difficulty === 'hard' ? 200000 : 100000,
    assets: assets[difficulty] || assets.medium
  };
};

// Word puzzle data with difficulty
const getWordPuzzleData = (difficulty = 'medium') => {
  const puzzles = {
    easy: [
      { word: "SAVE", hint: "Keep money for future use", scrambled: "EVAS" },
      { word: "BANK", hint: "Financial institution", scrambled: "KNAB" },
      { word: "CASH", hint: "Physical money", scrambled: "HCSA" }
    ],
    medium: [
      { word: "INVESTMENT", hint: "Putting money into assets to earn returns", scrambled: "TNEVSMETIN" },
      { word: "BUDGET", hint: "A plan for spending and saving money", scrambled: "GEDUTB" },
      { word: "SAVINGS", hint: "Money set aside for future use", scrambled: "SAGVINS" },
      { word: "INTEREST", hint: "Money earned on deposits or paid on loans", scrambled: "TENRESTI" },
      { word: "DIVERSIFICATION", hint: "Spreading investments across different assets", scrambled: "TIONDIVERSIFICA" }
    ],
    hard: [
      { word: "INVESTMENT", hint: "Putting money into assets to earn returns", scrambled: "TNEVSMETIN" },
      { word: "DIVERSIFICATION", hint: "Spreading investments across different assets", scrambled: "TIONDIVERSIFICA" },
      { word: "COMPOUNDING", hint: "Interest on interest", scrambled: "GNDUOPMOCIN" },
      { word: "PORTFOLIO", hint: "Collection of investments", scrambled: "OILFOTROP" },
      { word: "VOLATILITY", hint: "Price fluctuation measure", scrambled: "TILATYLOV" }
    ]
  };

  return {
    puzzles: puzzles[difficulty] || puzzles.medium
  };
};

// ==================== FAVORITES FUNCTIONALITY ====================

/**
 * Get user's favorite games
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's favorite games from their profile
    const user = await User.findById(userId).select('favoriteGames');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      favorites: user.favoriteGames || []
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites',
      error: error.message
    });
  }
};

/**
 * Toggle favorite status for a game
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType } = req.body;

    if (!gameType) {
      return res.status(400).json({
        success: false,
        message: 'Game type is required'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize favorites array if it doesn't exist
    if (!user.favoriteGames) {
      user.favoriteGames = [];
    }

    const gameIndex = user.favoriteGames.indexOf(gameType);
    let isFavorite = false;

    if (gameIndex > -1) {
      // Remove from favorites
      user.favoriteGames.splice(gameIndex, 1);
      isFavorite = false;
    } else {
      // Add to favorites
      user.favoriteGames.push(gameType);
      isFavorite = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      isFavorite,
      favorites: user.favoriteGames,
      message: isFavorite ? 'Game added to favorites' : 'Game removed from favorites'
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite',
      error: error.message
    });
  }
};

// ==================== NEW FINANCIAL GAMES DATA ====================

/**
 * Get Break The Bank game data
 */
const getBreakTheBankData = (req, res) => {
  try {
    const data = {
      title: "Break The Bank",
      description: "Test your knowledge of banking and financial institutions",
      instructions: "Answer questions correctly to break into the bank vault",
      questions: [
        {
          question: "What is a savings account?",
          options: ["A loan account", "An account to save money", "A credit card", "An investment"],
          correct: 1,
          explanation: "A savings account is designed to help you save money while earning interest."
        },
        {
          question: "What is the main function of a bank?",
          options: ["Only to give loans", "To store money and provide financial services", "Only to invest money", "Only to exchange currency"],
          correct: 1,
          explanation: "Banks primarily store money and provide various financial services to customers."
        },
        {
          question: "What is an ATM?",
          options: ["Automated Teller Machine", "A type of loan", "A savings account", "A credit card"],
          correct: 0,
          explanation: "ATM stands for Automated Teller Machine, used for banking transactions."
        }
      ]
    };

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting Break The Bank data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game data'
    });
  }
};

/**
 * Get Dolphin Dash game data
 */
const getDolphinDashData = (req, res) => {
  try {
    const data = {
      title: "Dolphin Dash",
      description: "Navigate through financial waters while avoiding debt sharks",
      instructions: "Collect coins and avoid obstacles to reach the finish line",
      obstacles: [
        { type: "debt_shark", points: -10, description: "Avoid debt sharks" },
        { type: "impulse_buy", points: -5, description: "Avoid impulse purchases" },
        { type: "gold_coin", points: 10, description: "Collect savings coins" },
        { type: "investment_gem", points: 20, description: "Collect investment gems" }
      ],
      levels: [
        { level: 1, speed: 1, obstacles: 3 },
        { level: 2, speed: 1.5, obstacles: 5 },
        { level: 3, speed: 2, obstacles: 7 }
      ]
    };

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting Dolphin Dash data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game data'
    });
  }
};

/**
 * Get Money Bingo game data
 */
const getMoneyBingoData = (req, res) => {
  try {
    const data = {
      title: "Money Bingo",
      description: "Learn financial terms while playing bingo",
      instructions: "Match financial terms to complete lines and win",
      terms: [
        "SIP", "EMI", "FD", "PPF", "NPS",
        "MF", "ETF", "REIT", "BOND", "STOCK",
        "SAVINGS", "INVESTMENT", "BUDGET", "CREDIT", "DEBIT",
        "INTEREST", "PRINCIPAL", "DIVIDEND", "CAPITAL", "ASSET",
        "LIABILITY", "INCOME", "EXPENSE", "PROFIT", "LOSS"
      ],
      definitions: {
        "SIP": "Systematic Investment Plan",
        "EMI": "Equated Monthly Installment",
        "FD": "Fixed Deposit",
        "PPF": "Public Provident Fund",
        "NPS": "National Pension System"
      }
    };

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting Money Bingo data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game data'
    });
  }
};

/**
 * Get Budget Challenge game data
 */
const getBudgetChallengeData = (req, res) => {
  try {
    const data = {
      title: "Budget Challenge",
      description: "Create and manage a realistic budget",
      instructions: "Allocate your income across different categories without overspending",
      scenarios: [
        {
          income: 50000,
          categories: [
            { name: "Housing", maxPercentage: 30, priority: "high" },
            { name: "Food", maxPercentage: 20, priority: "high" },
            { name: "Transportation", maxPercentage: 15, priority: "medium" },
            { name: "Utilities", maxPercentage: 10, priority: "high" },
            { name: "Entertainment", maxPercentage: 10, priority: "low" },
            { name: "Savings", minPercentage: 10, priority: "high" },
            { name: "Healthcare", maxPercentage: 5, priority: "medium" }
          ]
        }
      ]
    };

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting Budget Challenge data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game data'
    });
  }
};

/**
 * Get Investment Simulator game data
 */
const getInvestmentSimulatorData = (req, res) => {
  try {
  const data = {
    title: "Investment Simulator",
    description: "Practice investing with virtual money",
    instructions: "Build a diversified portfolio and watch it grow over time",
    assets: [
      {
        name: "Stocks",
        risk: "High",
        expectedReturn: 12,
        volatility: 20,
        description: "Ownership in companies"
      },
      {
        name: "Bonds",
        risk: "Low",
        expectedReturn: 6,
        volatility: 5,
        description: "Government and corporate debt"
      },
      {
        name: "Mutual Funds",
        risk: "Medium",
        expectedReturn: 10,
        volatility: 15,
        description: "Diversified investment funds"
      },
      {
        name: "Fixed Deposits",
        risk: "Very Low",
        expectedReturn: 7,
        volatility: 2,
        description: "Bank deposits with fixed returns"
      },
      {
        name: "Gold",
        risk: "Medium",
        expectedReturn: 8,
        volatility: 18,
        description: "Precious metal investment"
      }
    ],
    initialCapital: 100000,
    timePeriod: 12 // months
  };

  res.json({
    success: true,
    data
  });
} catch (error) {
  console.error('Error getting Investment Simulator data:', error);
  res.status(500).json({
    success: false,
    error: 'Failed to get game data'
  });
}
};

/**
 * Get Financial Quiz game data
 */
const getFinancialQuizData = (req, res) => {
  try {
    const data = {
      title: "Financial Quiz",
      description: "Test your knowledge of personal finance",
      instructions: "Answer questions correctly to earn points and unlock levels",
      categories: [
        {
          name: "Basic Finance",
          questions: [
            {
              question: "What is the purpose of an emergency fund?",
              options: ["To buy luxury items", "To cover unexpected expenses", "To invest in stocks", "To pay for vacations"],
              correct: 1,
              explanation: "An emergency fund is specifically for unexpected expenses like medical bills or job loss."
            }
          ]
        },
        {
          name: "Investments",
          questions: [
            {
              question: "What is diversification?",
              options: ["Putting all money in one place", "Spreading investments across different assets", "Only investing in stocks", "Avoiding all investments"],
              correct: 1,
              explanation: "Diversification reduces risk by spreading investments across different asset classes."
            }
          ]
        }
      ]
    };

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting Financial Quiz data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game data'
    });
  }
};

module.exports = {
  // User Profile & Progress
  getUserProfile,
  getUserProgress,
  getUserStats,
  
  // Game Progress CRUD
  saveProgress,
  updateProgress,
  deleteProgress,
  
  // Game Data
  getGameData,
  
  // Multiplayer
  createMultiplayerGame,
  joinMultiplayerGame,
  getAvailableGames,
  startMultiplayerGame,
  
  // Leaderboards & Statistics
  getLeaderboard,
  
  // Achievements & Rewards
  checkAchievements,
  
  // Favorites
  getFavorites,
  toggleFavorite,
  
  // New Financial Games Data
  getBreakTheBankData,
  getDolphinDashData,
  getMoneyBingoData,
  getBudgetChallengeData,
  getInvestmentSimulatorData,
  getFinancialQuizData
};