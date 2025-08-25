import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Target, 
  PiggyBank, 
  TrendingUp, 
  BookOpen, 
  Trophy, 
  Star,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react';
import axios from 'axios';

const Game = () => {
  const [activeGame, setActiveGame] = useState(null);
  const [score, setScore] = useState(0);
  const [gameData, setGameData] = useState({});
  const [loading, setLoading] = useState(false);
  const [userProgress, setUserProgress] = useState({});
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);

  const backend_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${backend_url}/api/games/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Transform the data to match our expected structure
        const progressData = response.data.progress || {};
        const transformedProgress = {};
        
        Object.keys(progressData).forEach(gameType => {
          const data = progressData[gameType];
          if (typeof data === 'object' && data !== null) {
            transformedProgress[gameType] = {
              score: data.score || 0,
              totalPoints: data.totalPoints || 0,
              level: data.level || 1,
              experience: data.experience || 0,
              gamesPlayed: data.gamesPlayed || 0
            };
          } else {
            // Handle legacy data structure
            transformedProgress[gameType] = {
              score: data || 0,
              totalPoints: (data || 0) * 2,
              level: 1,
              experience: Math.floor(data || 0),
              gamesPlayed: data ? 1 : 0
            };
          }
        });
        
        setUserProgress(transformedProgress);
      }
    } catch (error) {
      console.log('No saved progress found');
    }
  };

  const saveProgress = async (gameType, gameScore) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${backend_url}/api/games/save-progress`, {
          gameType,
          score: gameScore,
          timestamp: new Date().toISOString()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.log('Could not save progress');
    }
  };

  const games = [
    {
      id: 'quiz',
      title: 'Financial Quiz',
      description: 'Test your knowledge about personal finance, investments, and money management',
      icon: Brain,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'memory',
      title: 'Financial Memory',
      description: 'Match financial terms and concepts in this memory card game',
      icon: Target,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'budget',
      title: 'Budget Challenge',
      description: 'Learn to manage your monthly budget with realistic scenarios',
      icon: PiggyBank,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'investment',
      title: 'Investment Simulator',
      description: 'Practice investing with virtual money and learn about different assets',
      icon: TrendingUp,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      id: 'wordpuzzle',
      title: 'Financial Word Puzzle',
      description: 'Solve puzzles using financial terminology and concepts',
      icon: BookOpen,
      color: 'bg-red-500',
      gradient: 'from-red-500 to-red-600'
    }
  ];

  const handleGameSelect = async (gameId, difficulty = 'medium') => {
    setLoading(true);
    try {
      const response = await axios.get(`${backend_url}/api/games/${gameId}/data?difficulty=${difficulty}`);
      setGameData(response.data);
      setActiveGame(gameId);
      setScore(0);
    } catch (error) {
      console.error('Error loading game data:', error);
      // Fallback to local data
      setGameData(getLocalGameData(gameId));
      setActiveGame(gameId);
      setScore(0);
    }
    setLoading(false);
  };

  const getLocalGameData = (gameId) => {
    const localData = {
      quiz: {
        questions: [
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
        ]
      },
      memory: {
        cards: [
          { id: 1, term: "SIP", definition: "Systematic Investment Plan", matched: false, flipped: false },
          { id: 2, term: "SIP", definition: "Systematic Investment Plan", matched: false, flipped: false },
          { id: 3, term: "EMI", definition: "Equated Monthly Installment", matched: false, flipped: false },
          { id: 4, term: "EMI", definition: "Equated Monthly Installment", matched: false, flipped: false },
          { id: 5, term: "PPF", definition: "Public Provident Fund", matched: false, flipped: false },
          { id: 6, term: "PPF", definition: "Public Provident Fund", matched: false, flipped: false },
          { id: 7, term: "FD", definition: "Fixed Deposit", matched: false, flipped: false },
          { id: 8, term: "FD", definition: "Fixed Deposit", matched: false, flipped: false },
          { id: 9, term: "MF", definition: "Mutual Fund", matched: false, flipped: false },
          { id: 10, term: "MF", definition: "Mutual Fund", matched: false, flipped: false },
          { id: 11, term: "NPS", definition: "National Pension System", matched: false, flipped: false },
          { id: 12, term: "NPS", definition: "National Pension System", matched: false, flipped: false }
        ]
      },
      budget: {
        scenarios: [
          {
            title: "Monthly Budget Challenge",
            income: 50000,
            expenses: [
              { name: "Rent", amount: 15000, category: "Housing" },
              { name: "Groceries", amount: 8000, category: "Food" },
              { name: "Transportation", amount: 5000, category: "Transport" },
              { name: "Utilities", amount: 3000, category: "Bills" },
              { name: "Entertainment", amount: 4000, category: "Leisure" },
              { name: "Shopping", amount: 6000, category: "Personal" }
            ],
            goal: "Save at least 20% of income"
          }
        ]
      },
      investment: {
        initialCapital: 100000,
        assets: [
          { name: "Stocks", risk: "High", return: 12, volatility: 20 },
          { name: "Bonds", risk: "Low", return: 6, volatility: 5 },
          { name: "Mutual Funds", risk: "Medium", return: 9, volatility: 12 },
          { name: "Fixed Deposits", risk: "Very Low", return: 7, volatility: 2 },
          { name: "Gold", risk: "Medium", return: 8, volatility: 15 }
        ]
      },
      wordpuzzle: {
        puzzles: [
          {
            word: "INVESTMENT",
            hint: "Putting money into assets to earn returns",
            scrambled: "TNEVSMETIN"
          },
          {
            word: "BUDGET",
            hint: "A plan for spending and saving money",
            scrambled: "GEDUTB"
          },
          {
            word: "SAVINGS",
            hint: "Money set aside for future use",
            scrambled: "SAGVINS"
          },
          {
            word: "INTEREST",
            hint: "Money earned on deposits or paid on loans",
            scrambled: "TENRESTI"
          },
          {
            word: "DIVERSIFICATION",
            hint: "Spreading investments across different assets",
            scrambled: "TIONDIVERSIFICA"
          }
        ]
      }
    };
    return localData[gameId];
  };

  const renderGame = () => {
    switch (activeGame) {
      case 'quiz':
        return <QuizGame data={gameData} onComplete={(score) => handleGameComplete('quiz', score)} />;
      case 'memory':
        return <MemoryGame data={gameData} onComplete={(score) => handleGameComplete('memory', score)} />;
      case 'budget':
        return <BudgetGame data={gameData} onComplete={(score) => handleGameComplete('budget', score)} />;
      case 'investment':
        return <InvestmentGame data={gameData} onComplete={(score) => handleGameComplete('investment', score)} />;
      case 'wordpuzzle':
        return <WordPuzzleGame data={gameData} onComplete={(score) => handleGameComplete('wordpuzzle', score)} />;
      default:
        return null;
    }
  };

  const handleGameComplete = async (gameType, gameScore) => {
    setScore(gameScore);
    await saveProgress(gameType, gameScore);
    setUserProgress(prev => ({
      ...prev,
      [gameType]: {
        score: Math.max(prev[gameType]?.score || 0, gameScore),
        totalPoints: (prev[gameType]?.totalPoints || 0) + gameScore * 2,
        level: prev[gameType]?.level || 1,
        experience: (prev[gameType]?.experience || 0) + Math.floor(gameScore),
        gamesPlayed: (prev[gameType]?.gamesPlayed || 0) + 1
      }
    }));
  };

  const getProgressPercentage = (gameType) => {
    const maxScores = { quiz: 100, memory: 100, budget: 100, investment: 100, wordpuzzle: 100 };
    const currentScore = userProgress[gameType]?.score || 0;
    return Math.round((currentScore / maxScores[gameType]) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-700">Loading game...</p>
        </div>
      </div>
    );
  }

  if (showDifficultySelector && activeGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                setShowDifficultySelector(false);
                setActiveGame(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft size={20} />
              Back to Games
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Select Difficulty Level
            </h2>
            
            <div className="space-y-4">
              {[
                { id: 'easy', name: 'Easy', description: 'Perfect for beginners', color: 'bg-green-500' },
                { id: 'medium', name: 'Medium', description: 'For intermediate players', color: 'bg-yellow-500' },
                { id: 'hard', name: 'Hard', description: 'Challenge for experts', color: 'bg-red-500' }
              ].map((difficulty) => (
                <button
                  key={difficulty.id}
                  onClick={() => {
                    setSelectedDifficulty(difficulty.id);
                    setShowDifficultySelector(false);
                    handleGameSelect(activeGame, difficulty.id);
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${difficulty.color}`}></div>
                    <div>
                      <div className="font-bold text-gray-800">{difficulty.name}</div>
                      <div className="text-sm text-gray-600">{difficulty.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeGame && !showDifficultySelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                setActiveGame(null);
                setShowDifficultySelector(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft size={20} />
              Back to Games
            </button>
            {score > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg">
                <Trophy size={20} />
                Score: {score}
              </div>
            )}
          </div>
          {renderGame()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-4">🎮 Fun & Learn</h1>
          <p className="text-lg text-green-600 mb-8">
            Learn financial concepts through interactive games and quizzes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => {
                setShowDifficultySelector(true);
                setActiveGame(game.id);
              }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className={`p-6 rounded-t-xl bg-gradient-to-r ${game.gradient} text-white`}>
                <div className="flex items-center justify-between">
                  <game.icon size={32} />
                  <div className="text-right">
                    <div className="text-sm opacity-90">Progress</div>
                    <div className="text-lg font-bold">{getProgressPercentage(game.id)}%</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                  {game.title}
                </h3>
                <p className="text-gray-600 mb-4">{game.description}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${game.gradient}`}
                    style={{ width: `${getProgressPercentage(game.id)}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Best Score: {userProgress[game.id]?.score || 0}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Your Progress
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {games.map((game) => (
              <div key={game.id} className="text-center">
                <div className="text-2xl font-bold text-green-600">{getProgressPercentage(game.id)}%</div>
                <div className="text-sm text-gray-600">{game.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Level: {userProgress[game.id]?.level || 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-500" />
            Game Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(userProgress).reduce((sum, game) => sum + (game?.totalPoints || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(userProgress).reduce((sum, game) => sum + (game?.experience || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Experience</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(userProgress).reduce((sum, game) => sum + (game?.gamesPlayed || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Games Played</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.max(...Object.values(userProgress).map(game => game?.level || 1))}
              </div>
              <div className="text-sm text-gray-600">Highest Level</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quiz Game Component
const QuizGame = ({ data, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(null);
    }
  }, [timeLeft, showResult]);

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === data.questions[currentQuestion].correct) {
      setScore(score + 20);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      onComplete(score);
    }
  };

  const question = data.questions[currentQuestion];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          Question {currentQuestion + 1} of {data.questions.length}
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && handleAnswer(index)}
              disabled={showResult}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? index === question.correct
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : showResult && index === question.correct
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {showResult ? (
                  index === question.correct ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : selectedAnswer === index ? (
                    <XCircle className="text-red-500" size={20} />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                  )
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                )}
                {option}
              </div>
            </button>
          ))}
        </div>
      </div>

      {showResult && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-bold text-blue-800 mb-2">Explanation:</h4>
          <p className="text-blue-700">{question.explanation}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-lg font-bold text-green-600">
          Score: {score}
        </div>
        {showResult && (
          <button
            onClick={nextQuestion}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            {currentQuestion < data.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};

// Memory Game Component
const MemoryGame = ({ data, onComplete }) => {
  const [cards, setCards] = useState(data.cards);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2 || cards.find(c => c.id === cardId).flipped) return;

    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, flipped: true } : card
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard.term === secondCard.term) {
        setMatchedPairs(matchedPairs + 1);
        setFlippedCards([]);
        
        if (matchedPairs + 1 === 6) {
          setGameComplete(true);
          const finalScore = Math.max(0, 100 - moves * 5);
          onComplete(finalScore);
        }
      } else {
        setTimeout(() => {
          setCards(cards.map(card =>
            newFlippedCards.includes(card.id) ? { ...card, flipped: false } : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(data.cards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameComplete(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Financial Memory Game</h2>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{matchedPairs}/6</div>
            <div className="text-sm text-gray-600">Pairs Matched</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{moves}</div>
            <div className="text-sm text-gray-600">Moves</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-lg cursor-pointer transition-all duration-300 transform ${
              card.flipped ? 'rotate-y-180' : 'hover:scale-105'
            }`}
          >
            <div className={`w-full h-full rounded-lg border-2 flex items-center justify-center text-center p-2 ${
              card.flipped
                ? 'bg-green-100 border-green-300 text-green-800'
                : 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
            }`}>
              {card.flipped ? (
                <div>
                  <div className="font-bold text-sm mb-1">{card.term}</div>
                  <div className="text-xs">{card.definition}</div>
                </div>
              ) : (
                <div className="text-2xl">?</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {gameComplete && (
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-4">🎉 Congratulations!</div>
          <div className="text-lg text-gray-600 mb-4">
            You completed the game in {moves} moves!
          </div>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      <button
        onClick={resetGame}
        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        <RefreshCw size={16} className="inline mr-2" />
        Reset Game
      </button>
    </div>
  );
};

// Budget Game Component
const BudgetGame = ({ data, onComplete }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [allocations, setAllocations] = useState({});
  const [remainingBudget, setRemainingBudget] = useState(data.scenarios[0].income);
  const [showResult, setShowResult] = useState(false);

  const scenario = data.scenarios[currentScenario];

  const handleAllocation = (category, amount) => {
    const newAllocations = { ...allocations };
    const oldAmount = newAllocations[category] || 0;
    const difference = amount - oldAmount;
    
    if (remainingBudget - difference >= 0) {
      newAllocations[category] = amount;
      setAllocations(newAllocations);
      setRemainingBudget(remainingBudget - difference);
    }
  };

  const calculateScore = () => {
    const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    const savings = scenario.income - totalAllocated;
    const savingsPercentage = (savings / scenario.income) * 100;
    
    let score = 0;
    if (savingsPercentage >= 20) score += 40;
    else if (savingsPercentage >= 15) score += 30;
    else if (savingsPercentage >= 10) score += 20;
    else if (savingsPercentage >= 5) score += 10;
    
    if (remainingBudget >= 0) score += 30;
    if (Object.keys(allocations).length >= 4) score += 30;
    
    return Math.min(100, score);
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setShowResult(true);
    onComplete(finalScore);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{scenario.title}</h2>
        <p className="text-gray-600">Allocate your monthly budget wisely!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h3 className="font-bold text-green-800 mb-2">Monthly Income</h3>
            <div className="text-2xl font-bold text-green-600">₹{scenario.income.toLocaleString()}</div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-bold text-blue-800 mb-2">Remaining Budget</h3>
            <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ₹{remainingBudget.toLocaleString()}
            </div>
          </div>

          <div className="space-y-4">
            {scenario.expenses.map((expense) => (
              <div key={expense.name} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-800">{expense.name}</h4>
                  <span className="text-sm text-gray-600">{expense.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">₹</span>
                  <input
                    type="number"
                    value={allocations[expense.name] || ''}
                    onChange={(e) => handleAllocation(expense.name, parseInt(e.target.value) || 0)}
                    className="flex-1 p-2 border rounded"
                    placeholder="0"
                    min="0"
                    max={scenario.income}
                  />
                  <span className="text-sm text-gray-500">/ {expense.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-4">Budget Summary</h3>
          <div className="space-y-3">
            {Object.entries(allocations).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{category}</span>
                <span className="font-bold text-green-600">₹{amount.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-2">💡 Tips</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Try to save at least 20% of your income</li>
              <li>• Prioritize essential expenses like housing and food</li>
              <li>• Don't forget to allocate for savings and emergencies</li>
              <li>• Balance your wants and needs</li>
            </ul>
          </div>

          {!showResult && (
            <button
              onClick={handleSubmit}
              className="w-full mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Submit Budget
            </button>
          )}
        </div>
      </div>

      {showResult && (
        <div className="mt-6 p-6 bg-green-50 rounded-lg text-center">
          <h3 className="text-xl font-bold text-green-800 mb-2">Budget Analysis Complete!</h3>
          <div className="text-lg text-green-600 mb-4">
            Your score: {calculateScore()}/100
          </div>
          <div className="text-sm text-gray-600">
            {calculateScore() >= 80 ? "Excellent budgeting skills!" :
             calculateScore() >= 60 ? "Good job! Keep improving!" :
             "Keep practicing to improve your budgeting skills!"}
          </div>
        </div>
      )}
    </div>
  );
};

// Investment Simulator Component
const InvestmentGame = ({ data, onComplete }) => {
  const [portfolio, setPortfolio] = useState({});
  const [capital, setCapital] = useState(data.initialCapital);
  const [year, setYear] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);
  const [returns, setReturns] = useState({});

  const handleInvestment = (assetName, amount) => {
    if (amount <= capital && amount > 0) {
      setPortfolio(prev => ({
        ...prev,
        [assetName]: (prev[assetName] || 0) + amount
      }));
      setCapital(capital - amount);
    }
  };

  const simulateYear = () => {
    const newReturns = {};
    let totalReturn = 0;

    Object.entries(portfolio).forEach(([assetName, amount]) => {
      const asset = data.assets.find(a => a.name === assetName);
      const volatility = asset.volatility / 100;
      const expectedReturn = asset.return / 100;
      
      // Simulate return with some randomness
      const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
      const actualReturn = expectedReturn + (randomFactor * volatility);
      const yearReturn = amount * actualReturn;
      
      newReturns[assetName] = yearReturn;
      totalReturn += yearReturn;
    });

    setReturns(newReturns);
    setCapital(capital + totalReturn);
    setYear(year + 1);

    if (year >= 5) {
      setGameComplete(true);
      const finalScore = Math.min(100, Math.max(0, ((capital - data.initialCapital) / data.initialCapital) * 100));
      onComplete(finalScore);
    }
  };

  const resetGame = () => {
    setPortfolio({});
    setCapital(data.initialCapital);
    setYear(1);
    setGameComplete(false);
    setReturns({});
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Investment Simulator</h2>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">₹{capital.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Available Capital</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Available Assets</h3>
          <div className="space-y-4">
            {data.assets.map((asset) => (
              <div key={asset.name} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold">{asset.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    asset.risk === 'High' ? 'bg-red-100 text-red-800' :
                    asset.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {asset.risk} Risk
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  Expected Return: {asset.return}% | Volatility: {asset.volatility}%
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    className="flex-1 p-2 border rounded"
                    min="0"
                    max={capital}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleInvestment(asset.name, parseInt(e.target.value) || 0);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector(`input[placeholder="Amount"]`);
                      handleInvestment(asset.name, parseInt(input.value) || 0);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Invest
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-4">Your Portfolio</h3>
          {Object.keys(portfolio).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No investments yet. Start investing to see your portfolio!
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(portfolio).map(([assetName, amount]) => (
                <div key={assetName} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{assetName}</span>
                  <div className="text-right">
                    <div className="font-bold">₹{amount.toLocaleString()}</div>
                    {returns[assetName] && (
                      <div className={`text-sm ${returns[assetName] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {returns[assetName] >= 0 ? '+' : ''}₹{returns[assetName].toFixed(0)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">📊 Year {year}/5</h4>
            <p className="text-sm text-blue-700 mb-3">
              {year < 5 ? 'Invest your capital and simulate market returns!' : 'Final year complete!'}
            </p>
            {year < 5 && (
              <button
                onClick={simulateYear}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Simulate Year {year}
              </button>
            )}
          </div>

          {gameComplete && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
              <h4 className="font-bold text-green-800 mb-2">🎉 Investment Complete!</h4>
              <div className="text-lg text-green-600">
                Final Capital: ₹{capital.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Return: {((capital - data.initialCapital) / data.initialCapital * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

// Word Puzzle Component
const WordPuzzleGame = ({ data, onComplete }) => {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const puzzle = data.puzzles[currentPuzzle];

  const handleSubmit = () => {
    const isCorrect = userAnswer.toLowerCase().trim() === puzzle.word.toLowerCase();
    if (isCorrect) {
      setScore(score + 20);
    }
    
    if (currentPuzzle < data.puzzles.length - 1) {
      setCurrentPuzzle(currentPuzzle + 1);
      setUserAnswer('');
      setShowHint(false);
    } else {
      setGameComplete(true);
      onComplete(score + (isCorrect ? 20 : 0));
    }
  };

  const resetGame = () => {
    setCurrentPuzzle(0);
    setUserAnswer('');
    setShowHint(false);
    setScore(0);
    setGameComplete(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Financial Word Puzzle</h2>
        <div className="text-sm text-gray-600">
          Puzzle {currentPuzzle + 1} of {data.puzzles.length}
        </div>
      </div>

      {!gameComplete ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-4">
              {puzzle.scrambled}
            </div>
            <p className="text-gray-600">Unscramble the word above</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer:
              </label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the unscrambled word..."
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Submit Answer
              </button>
            </div>

            {showHint && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-2">💡 Hint:</h4>
                <p className="text-yellow-700">{puzzle.hint}</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              Score: {score}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-4">🎉 Puzzle Complete!</div>
          <div className="text-lg text-gray-600 mb-4">
            Final Score: {score}/100
          </div>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
