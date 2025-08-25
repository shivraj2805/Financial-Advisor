import React, { useState, useRef, useEffect, useCallback } from 'react';
import SimpleIcons from './SimpleIcons';
import { useNavigate, useLocation } from 'react-router-dom';

const VoiceNavigator = () => {
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected'); // connected, offline, error
  const [retryCount, setRetryCount] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [isWakeWordListening, setIsWakeWordListening] = useState(true); // Always listening for wake word
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if assistant is speaking

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const location = useLocation();
  const recognitionRef = useRef(null);
  const wakeWordRecognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const processingTimeoutRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const wakeWordRecognitionActive = useRef(false);
  const commandRecognitionActive = useRef(false);
  const isInitialized = useRef(false);
  const isActiveRef = useRef(false); // Track active state with ref
  const backend_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

  // Dragging functionality for the popup panel
  const handleMouseDown = (e) => {
    setDragging(true);
    setRel({
      x: e.clientX - drag.x,
      y: e.clientY - drag.y,
    });
    e.preventDefault();
  };

  const handleMouseUp = () => setDragging(false);

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setDrag({
      x: e.clientX - rel.x,
      y: e.clientY - rel.y,
    });
    e.preventDefault();
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  // Function to dispatch voice navigator state changes
  const dispatchVoiceStateChange = useCallback((isActive) => {
    window.dispatchEvent(new CustomEvent('voiceNavigatorStateChange', {
      detail: { isActive }
    }));
  }, []);

  // Enhanced wake word patterns for better detection
  const WAKE_WORDS = [
    /^hello\s+fin\s+advisor$/i,
    /^hello\s+financial\s+advisor$/i,
    /^hi\s+fin\s+advisor$/i,
    /^hi\s+financial\s+advisor$/i,
    /^hey\s+fin\s+advisor$/i,
    /^hey\s+financial\s+advisor$/i,
    /^fin\s+advisor$/i,
    /^financial\s+advisor$/i,
    // Handle common typos and variations
    /hello\s+financial\s+advisior/i,
    /hello\s+fin\s+advisior/i,
    /hi\s+financial\s+advisior/i,
    /hey\s+financial\s+advisior/i,
    /financial\s+advisior/i,
    /fin\s+advisior/i,
    // More flexible patterns
    /.*hello.*financial.*advisor.*/i,
    /.*hello.*fin.*advisor.*/i,
    /.*financial.*advisor.*/i,
    /.*fin.*advisor.*/i
  ];

  // Enhanced route mapping with aliases and fuzzy matching - COMPREHENSIVE
  const ROUTES = {
    // Core Financial Tools
    calculator: "/ppf",
    ppf: "/ppf",
    financial_calculator: "/ppf",
    investment_calculator: "/ppf",
    
    // Expense Management
    expenses: "/expenses",
    expense_tracker: "/expenses",
    budget: "/expenses",
    spending: "/expenses",
    
    // Community & Social
    community: "/community",
    forum: "/community",
    discussion: "/community",
    
    // Information & Learning
    news: "/news",
    learn: "/learn",
    learning: "/learn",
    education: "/learn",
    
    // User Management
    home: "/",
    dashboard: "/financialAdvisior",
    profile: "/profile",
    login: "/login",
    signup: "/register",
    register: "/register",
    
    // AI & Assistance
    chatbot: "/chatbot",
    ai_assistant: "/chatbot",
    financial_advisor: "/advisor",
    advisor: "/advisor",
    
    // Security & Safety
    scams: "/scams",
    fraud: "/scams",
    security: "/scams",
    
    // Business & Investment
    microinvestment: "/mip",
    mip: "/mip",
    investment_platform: "/mip",
    
    // Agriculture & Rural Business
    poultry: "/poultry",
    poultry_farm: "/poultry",
    chicken_farm: "/poultry",
    
    rural: "/rural",
    rural_business: "/rural",
    business_opportunities: "/rural",
    
    dairy: "/dairy",
    dairy_forum: "/dairy",
    
    // Government & Schemes
    scheme: "/scheme",
    government_scheme: "/scheme",
    government_schemes: "/scheme",
    
    // Success Stories & Q&A
    stories: "/stories",
    success_stories: "/stories",
    
    qna: "/qna",
    questions: "/qna",
    q_and_a: "/qna",
    
    // Document Processing
    ocr: "/ocr",
    document_ocr: "/ocr",
    document_processing: "/ocr",
    
    // Roadmap & Planning
    road: "/road",
    roadmap: "/road",
    planning: "/road",
    
    // Media & Content
    shorts: "/shorts",
    youtube_shorts: "/shorts",
    videos: "/shorts",
    
    // Meetings
    meetings: "/meetings",
    schedule_meeting: "/meetings",
    appointment: "/meetings"
  };

  // Comprehensive aliases for robust matching
  const CALC_ALIASES = new Set([
    "calculator", "calc", "calci", "claculator", "calcultor", "calcutator",
    "calcu", "cal", "calculater", "calclator", "calcultr", "calcutr"
  ]);

  const EXPENSE_ALIASES = new Set([
    "expenses", "expense", "tracker", "budget", "spending", "money", "costs"
  ]);

  const COMMUNITY_ALIASES = new Set([
    "community", "forum", "discussion", "chat", "talk", "people", "users"
  ]);

  const NEWS_ALIASES = new Set([
    "news", "updates", "latest", "information", "articles", "blog"
  ]);

  const LEARN_ALIASES = new Set([
    "learn", "learning", "education", "guide", "tutorial", "help", "resources"
  ]);

  // Enhanced aliases for all routes
  const HOME_ALIASES = new Set([
    "home", "main", "landing", "start", "beginning", "front", "first"
  ]);

  const DASHBOARD_ALIASES = new Set([
    "dashboard", "control", "panel", "overview", "summary", "main"
  ]);

  const PROFILE_ALIASES = new Set([
    "profile", "account", "settings", "user", "personal", "my"
  ]);

  const LOGIN_ALIASES = new Set([
    "login", "signin", "sign in", "log in", "enter", "access"
  ]);

  const SIGNUP_ALIASES = new Set([
    "signup", "register", "sign up", "signup", "registration", "join", "create account"
  ]);

  const CHATBOT_ALIASES = new Set([
    "chatbot", "chat", "bot", "ai", "assistant", "help", "support", "talk"
  ]);

  const ADVISOR_ALIASES = new Set([
    "advisor", "adviser", "financial advisor", "financial adviser", "consultant", "expert"
  ]);

  const SCAMS_ALIASES = new Set([
    "scams", "fraud", "security", "safety", "protection", "warning", "danger"
  ]);

  const MIP_ALIASES = new Set([
    "microinvestment", "mip", "investment platform", "invest", "micro invest", "small investment"
  ]);

  const POULTRY_ALIASES = new Set([
    "poultry", "chicken", "farm", "poultry farm", "chicken farm", "bird", "livestock"
  ]);

  const RURAL_ALIASES = new Set([
    "rural", "village", "countryside", "business opportunities", "rural business", "local business"
  ]);

  const DAIRY_ALIASES = new Set([
    "dairy", "milk", "cattle", "cow", "buffalo", "dairy farm", "milk business"
  ]);

  const SCHEME_ALIASES = new Set([
    "scheme", "government", "government scheme", "government schemes", "program", "initiative"
  ]);

  const STORIES_ALIASES = new Set([
    "stories", "success", "success stories", "inspiration", "motivation", "case study"
  ]);

  const QNA_ALIASES = new Set([
    "qna", "questions", "answers", "faq", "help", "support", "ask", "question"
  ]);

  const OCR_ALIASES = new Set([
    "ocr", "document", "scan", "text recognition", "document processing", "extract"
  ]);

  const ROAD_ALIASES = new Set([
    "road", "roadmap", "plan", "planning", "strategy", "path", "journey"
  ]);

  const SHORTS_ALIASES = new Set([
    "shorts", "video", "youtube", "youtube shorts", "videos", "content"
  ]);

  const MEETINGS_ALIASES = new Set([
    "meetings", "meeting", "schedule", "appointment", "consultation", "book", "reserve"
  ]);

  // User learned aliases (persisted in localStorage)
  const [learnedAliases, setLearnedAliases] = useState(() => {
    const saved = localStorage.getItem('voiceNavigatorAliases');
    return saved ? JSON.parse(saved) : {};
  });

  // UI context for navigation
  const [uiContext, setUiContext] = useState({
    hasNext: false,
    hasBack: false,
    currentStep: 1,
    totalSteps: 1
  });

  // Enhanced website structure for LLM understanding - COMPREHENSIVE
  const websiteStructure = {
    pages: {
      // Core Pages
      home: { path: "/", description: "Main homepage with financial services overview" },
      dashboard: { path: "/financialAdvisior", description: "User dashboard with financial overview" },
      profile: { path: "/profile", description: "User profile and account settings" },
      
      // Authentication
      login: { path: "/login", description: "User login and authentication" },
      signup: { path: "/register", description: "User registration and account creation" },
      
      // Financial Tools
      ppf: { path: "/ppf", description: "PPF calculator and comprehensive investment tools" },
      expenses: { path: "/expenses", description: "Expense tracking and budget management" },
      
      // Information & Learning
      news: { path: "/news", description: "Latest financial news and market updates" },
      learn: { path: "/learn", description: "Educational content and financial learning resources" },
      
      // Community & Social
      community: { path: "/community", description: "Community forum and user discussions" },
      dairy: { path: "/dairy", description: "Dairy farming community and discussions" },
      
      // AI & Assistance
      chatbot: { path: "/chatbot", description: "AI chatbot for general financial advice" },
      advisor: { path: "/advisor", description: "Advanced financial advisor AI interface" },
      
      // Security & Safety
      scams: { path: "/scams", description: "Information about financial scams and fraud protection" },
      
      // Business & Investment
      mip: { path: "/mip", description: "Microinvestment platform for small investments" },
      
      // Agriculture & Rural Business
      poultry: { path: "/poultry", description: "Poultry farming guide and business opportunities" },
      rural: { path: "/rural", description: "Rural business opportunities and guidance" },
      
      // Government & Schemes
      scheme: { path: "/scheme", description: "Government schemes and financial programs" },
      
      // Success Stories & Q&A
      stories: { path: "/stories", description: "Success stories and inspirational case studies" },
      qna: { path: "/qna", description: "Q&A sessions and frequently asked questions" },
      
      // Document Processing
      ocr: { path: "/ocr", description: "Document OCR and text extraction tools" },
      
      // Planning & Strategy
      road: { path: "/road", description: "Financial planning roadmap and strategies" },
      
      // Media & Content
      shorts: { path: "/shorts", description: "YouTube shorts and video content" },
      
      // Meetings & Consultations
      meetings: { path: "/meetings", description: "Schedule meetings and consultations" }
    },
    actions: {
      // Navigation Actions
      "send message": { action: "open_chat", description: "Open chat interface" },
      "schedule meeting": { action: "schedule_meeting", description: "Schedule a consultation" },
      "book appointment": { action: "schedule_meeting", description: "Book an appointment" },
      
      // Financial Actions
      "calculate": { action: "open_calculator", description: "Open financial calculator" },
      "track expenses": { action: "open_expenses", description: "Open expense tracker" },
      "get advice": { action: "get_advice", description: "Get financial advice" },
      "check balance": { action: "check_balance", description: "Check account balance" },
      "invest money": { action: "investment_guide", description: "Investment guidance" },
      "save money": { action: "saving_tips", description: "Money saving tips" },
      
      // Business Actions
      "start business": { action: "business_guide", description: "Business startup guidance" },
      "rural business": { action: "rural_business", description: "Rural business opportunities" },
      "poultry farming": { action: "poultry_guide", description: "Poultry farming guide" },
      "dairy farming": { action: "dairy_guide", description: "Dairy farming guide" },
      
      // Learning Actions
      "learn finance": { action: "learning_center", description: "Access learning resources" },
      "read news": { action: "news_page", description: "Read financial news" },
      "success stories": { action: "stories_page", description: "Read success stories" },
      
      // Community Actions
      "join community": { action: "community_page", description: "Join community discussions" },
      "ask question": { action: "qna_page", description: "Ask questions in Q&A" },
      
      // Document Actions
      "scan document": { action: "ocr_tool", description: "Scan and process documents" },
      "extract text": { action: "ocr_tool", description: "Extract text from documents" },
      
      // Government Actions
      "government schemes": { action: "schemes_page", description: "View government schemes" },
      "apply scheme": { action: "scheme_application", description: "Apply for government schemes" }
    }
  };

  // Enhanced voice commands with fallback - COMPREHENSIVE
  const fallbackCommands = {
    // Greetings
    "hello financial advisor": { type: 'greeting', response: "Welcome to Financial Advisor! I'm your AI assistant. How can I help you today? You can ask me to navigate to any page, get financial advice, or help you with calculations." },
    "hello financial advisior": { type: 'greeting', response: "Welcome to Financial Advisor! I'm your AI assistant. How can I help you today? You can ask me to navigate to any page, get financial advice, or help you with calculations." },
    
    // Core Financial Tools
    "go to calculator": { type: 'navigate', path: '/ppf', response: "I'll take you to the financial calculator where you can calculate investments, PPF, and more." },
    "open calculator": { type: 'navigate', path: '/ppf', response: "I'll open the financial calculator where you can calculate investments, PPF, and more." },
    "financial calculator": { type: 'navigate', path: '/ppf', response: "I'll take you to the comprehensive financial calculator." },
    
    // Expense Management
    "go to expenses": { type: 'navigate', path: '/expenses', response: "I'll open the expense tracker where you can track your spending and manage your budget." },
    "open expenses": { type: 'navigate', path: '/expenses', response: "I'll open the expense tracker where you can track your spending and manage your budget." },
    "expense tracker": { type: 'navigate', path: '/expenses', response: "I'll take you to the expense tracker." },
    "budget": { type: 'navigate', path: '/expenses', response: "I'll open the budget management tool." },
    
    // Community & Social
    "go to community": { type: 'navigate', path: '/community', response: "I'll take you to the community page where you can connect with other users and share experiences." },
    "open community": { type: 'navigate', path: '/community', response: "I'll open the community forum." },
    "forum": { type: 'navigate', path: '/community', response: "I'll take you to the discussion forum." },
    
    // Information & Learning
    "go to news": { type: 'navigate', path: '/news', response: "I'll take you to the news page where you can read the latest financial news and updates." },
    "open news": { type: 'navigate', path: '/news', response: "I'll open the financial news section." },
    "latest news": { type: 'navigate', path: '/news', response: "I'll show you the latest financial news." },
    
    "go to learn": { type: 'navigate', path: '/learn', response: "I'll take you to the learning resources where you can find financial education and guides." },
    "open learn": { type: 'navigate', path: '/learn', response: "I'll open the learning center." },
    "education": { type: 'navigate', path: '/learn', response: "I'll take you to the educational resources." },
    
    // User Management
    "go to home": { type: 'navigate', path: '/', response: "I'll take you to the homepage." },
    "homepage": { type: 'navigate', path: '/', response: "I'll take you to the main homepage." },
    "main page": { type: 'navigate', path: '/', response: "I'll take you to the main page." },
    
    "go to dashboard": { type: 'navigate', path: '/financialAdvisior', response: "I'll take you to your dashboard." },
    "open dashboard": { type: 'navigate', path: '/financialAdvisior', response: "I'll open your dashboard." },
    "my dashboard": { type: 'navigate', path: '/financialAdvisior', response: "I'll show you your dashboard." },
    
    "go to profile": { type: 'navigate', path: '/profile', response: "I'll take you to your profile page." },
    "open profile": { type: 'navigate', path: '/profile', response: "I'll open your profile settings." },
    "my profile": { type: 'navigate', path: '/profile', response: "I'll show you your profile." },
    
    "go to login": { type: 'navigate', path: '/login', response: "I'll take you to the login page." },
    "open login": { type: 'navigate', path: '/login', response: "I'll open the login page." },
    "sign in": { type: 'navigate', path: '/login', response: "I'll take you to sign in." },
    
    "go to signup": { type: 'navigate', path: '/register', response: "I'll take you to the registration page." },
    "open signup": { type: 'navigate', path: '/register', response: "I'll open the registration page." },
    "register": { type: 'navigate', path: '/register', response: "I'll take you to register." },
    
    // AI & Assistance
    "go to chatbot": { type: 'navigate', path: '/chatbot', response: "I'll take you to the AI chatbot for financial advice." },
    "open chatbot": { type: 'navigate', path: '/chatbot', response: "I'll open the AI chatbot." },
    "chat with ai": { type: 'navigate', path: '/chatbot', response: "I'll open the AI chat interface." },
    
    "go to advisor": { type: 'navigate', path: '/advisor', response: "I'll take you to the advanced financial advisor." },
    "open advisor": { type: 'navigate', path: '/advisor', response: "I'll open the financial advisor interface." },
    "financial advisor": { type: 'navigate', path: '/advisor', response: "I'll take you to the financial advisor." },
    
    // Security & Safety
    "go to scams": { type: 'navigate', path: '/scams', response: "I'll take you to the scams information page." },
    "open scams": { type: 'navigate', path: '/scams', response: "I'll open the fraud protection information." },
    "fraud protection": { type: 'navigate', path: '/scams', response: "I'll show you fraud protection information." },
    
    // Business & Investment
    "go to mip": { type: 'navigate', path: '/mip', response: "I'll take you to the microinvestment platform." },
    "open mip": { type: 'navigate', path: '/mip', response: "I'll open the microinvestment platform." },
    "microinvestment": { type: 'navigate', path: '/mip', response: "I'll take you to the microinvestment platform." },
    
    // Agriculture & Rural Business
    "go to poultry": { type: 'navigate', path: '/poultry', response: "I'll take you to the poultry farming guide." },
    "open poultry": { type: 'navigate', path: '/poultry', response: "I'll open the poultry farming guide." },
    "poultry farming": { type: 'navigate', path: '/poultry', response: "I'll show you poultry farming information." },
    
    "go to rural": { type: 'navigate', path: '/rural', response: "I'll take you to the rural business opportunities." },
    "open rural": { type: 'navigate', path: '/rural', response: "I'll open the rural business guide." },
    "rural business": { type: 'navigate', path: '/rural', response: "I'll show you rural business opportunities." },
    
    "go to dairy": { type: 'navigate', path: '/dairy', response: "I'll take you to the dairy farming community." },
    "open dairy": { type: 'navigate', path: '/dairy', response: "I'll open the dairy farming forum." },
    "dairy farming": { type: 'navigate', path: '/dairy', response: "I'll take you to the dairy farming community." },
    
    // Government & Schemes
    "go to scheme": { type: 'navigate', path: '/scheme', response: "I'll take you to the government schemes page." },
    "open scheme": { type: 'navigate', path: '/scheme', response: "I'll open the government schemes." },
    "government schemes": { type: 'navigate', path: '/scheme', response: "I'll show you government schemes." },
    
    // Success Stories & Q&A
    "go to stories": { type: 'navigate', path: '/stories', response: "I'll take you to the success stories page." },
    "open stories": { type: 'navigate', path: '/stories', response: "I'll open the success stories." },
    "success stories": { type: 'navigate', path: '/stories', response: "I'll show you success stories." },
    
    "go to qna": { type: 'navigate', path: '/qna', response: "I'll take you to the Q&A sessions." },
    "open qna": { type: 'navigate', path: '/qna', response: "I'll open the Q&A section." },
    "questions and answers": { type: 'navigate', path: '/qna', response: "I'll take you to the Q&A section." },
    
    // Document Processing
    "go to ocr": { type: 'navigate', path: '/ocr', response: "I'll take you to the document OCR tool." },
    "open ocr": { type: 'navigate', path: '/ocr', response: "I'll open the document processing tool." },
    "scan document": { type: 'navigate', path: '/ocr', response: "I'll take you to the document scanner." },
    
    // Planning & Strategy
    "go to road": { type: 'navigate', path: '/road', response: "I'll take you to the financial planning roadmap." },
    "open road": { type: 'navigate', path: '/road', response: "I'll open the financial planning guide." },
    "roadmap": { type: 'navigate', path: '/road', response: "I'll show you the financial roadmap." },
    
    // Media & Content
    "go to shorts": { type: 'navigate', path: '/shorts', response: "I'll take you to the YouTube shorts and videos." },
    "open shorts": { type: 'navigate', path: '/shorts', response: "I'll open the video content." },
    "videos": { type: 'navigate', path: '/shorts', response: "I'll take you to the video content." },
    
    // Meetings & Consultations
    "go to meetings": { type: 'navigate', path: '/meetings', response: "I'll take you to schedule a meeting." },
    "open meetings": { type: 'navigate', path: '/meetings', response: "I'll open the meeting scheduler." },
    "schedule meeting": { type: 'navigate', path: '/meetings', response: "I'll help you schedule a meeting." },
    "book appointment": { type: 'navigate', path: '/meetings', response: "I'll help you book an appointment." },
    
    // Help & Support
    "help": { type: 'help', response: "I can help you navigate to any page, get financial advice, track expenses, schedule meetings, and more. What would you like to do?" },
    "what can you do": { type: 'help', response: "I can help you navigate to any page, get financial advice, track expenses, schedule meetings, and more. What would you like to do?" }
  };

  // Voice functions with enhanced error handling
  const speakResponse = useCallback((text) => {
    if (isMuted || !synthesisRef.current) return;
    
    try {
      // Stop any ongoing speech
      synthesisRef.current.cancel();
      
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';
      
      utterance.onstart = () => {
        console.log('🎤 Started speaking:', text);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        // Don't set error for interrupted speech (it's normal)
        if (event.error !== 'interrupted') {
        setError('Speech synthesis failed');
        }
        setIsSpeaking(false);
      };
      
      utterance.onend = () => {
        console.log('🎤 Finished speaking');
        setIsSpeaking(false);
      };
      
      utterance.onpause = () => {
        console.log('🎤 Speech paused');
      };
      
      utterance.onresume = () => {
        console.log('🎤 Speech resumed');
      };
      
      synthesisRef.current.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setError('Speech synthesis failed');
      setIsSpeaking(false);
    }
  }, [isMuted]);

  // Enhanced wake word detection function - more flexible and Google Assistant-like
  const detectWakeWord = useCallback((text) => {
    const lowerText = text.toLowerCase().trim();
    
    // Skip if it's the system speaking (to prevent self-triggering)
    if (lowerText.includes('welcome to financial advisor') || 
        lowerText.includes('i\'ll take you to') || 
        lowerText.includes('you\'re now on') ||
        lowerText.includes('i\'ve opened') ||
        lowerText.includes('i\'m your ai assistant')) {
      console.log('🎤 Skipping system speech as wake word:', lowerText);
      return false;
    }
    
    // Check for exact matches first
    const exactMatch = WAKE_WORDS.some(pattern => pattern.test(lowerText));
    if (exactMatch) return true;
    
    // Check for partial matches (more flexible) - Google Assistant style
    const partialPatterns = [
      /hello\s+financial/i,
      /hello\s+fin/i,
      /hi\s+financial/i,
      /hi\s+fin/i,
      /hey\s+financial/i,
      /hey\s+fin/i,
      /financial\s+advisor/i,
      /fin\s+advisor/i,
      // Handle common typos
      /hello\s+financial\s+advisior/i, // Your typo
      /hello\s+fin\s+advisior/i, // Your typo
      /hi\s+financial\s+advisior/i, // Your typo
      /hey\s+financial\s+advisior/i, // Your typo
      /financial\s+advisior/i, // Your typo
      /fin\s+advisior/i, // Your typo
      // More flexible patterns for better detection
      /.*hello.*financial.*advisior.*/i, // Any order with your typo
      /.*hello.*financial.*advisor.*/i, // Any order with correct spelling
      /.*financial.*advisior.*/i, // Just the key words with typo
      /.*financial.*advisor.*/i // Just the key words
    ];
    
    return partialPatterns.some(pattern => pattern.test(lowerText));
  }, [WAKE_WORDS]);

  // Enhanced wake word detection handler - Google Assistant style
  const handleWakeWordDetected = useCallback(() => {
    // Prevent multiple simultaneous activations
    if (isActive || isSpeaking) {
      console.log('🎤 Wake word detected but already active or speaking, ignoring...');
      return;
    }
    
    console.log('🎤 Wake word detected! Starting Google Assistant-style voice assistant...');
    setWakeWordDetected(true);
    setIsActive(true);
    isActiveRef.current = true; // Update ref immediately
    dispatchVoiceStateChange(true); // Notify navbar
    setError(null);
    setConversationMode(true);
    
    // Reset command recognition state to ensure clean start
    commandRecognitionActive.current = false;
    
    // Stop wake word listening immediately to prevent self-triggering
    if (wakeWordRecognitionRef.current && wakeWordRecognitionActive.current) {
      try {
        console.log('🎤 Stopping wake word recognition to switch to command mode');
        wakeWordRecognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping wake word recognition:', error.message);
      }
    }
    
    // Stop wake word listening temporarily
    setIsWakeWordListening(false);
    
    // Enhanced welcome message
    setTimeout(() => {
      const welcomeMessage = "Welcome to the Financial Advisor Platform. How can I help you navigate the pages?";
      speakResponse(welcomeMessage);
      
      // Start command listening after speech with longer delay
      setTimeout(() => {
        // Reset command recognition state to ensure it can start
        commandRecognitionActive.current = false;
        
        console.log('🎤 Attempting to start command recognition...');
        console.log('🎤 Current state:', {
          recognitionRef: !!recognitionRef.current,
          isActive: isActiveRef.current,
          isInitialized: isInitialized.current
        });
        
        if (recognitionRef.current && isActiveRef.current && isInitialized.current) {
          try {
            console.log('🎤 Starting command recognition for navigation requests...');
            // Add a small delay to ensure wake word recognition is fully stopped
            setTimeout(() => {
              if (recognitionRef.current && isActiveRef.current) {
          try {
            recognitionRef.current.start();
                  console.log('🎤 Command listening started - ready for navigation requests');
                  // Add visual feedback
                  setShowStatus(true);
                  setTranscript('Listening for commands...');
          } catch (error) {
            console.log('Error starting command recognition:', error.message);
          }
              } else {
                console.log('🎤 Command recognition conditions not met:', {
                  recognitionRef: !!recognitionRef.current,
                  commandRecognitionActive: commandRecognitionActive.current,
                  isActive: isActive
                });
              }
            }, 1000); // Longer delay to prevent conflicts
          } catch (error) {
            console.log('Error starting command recognition:', error.message);
          }
        } else {
          console.log('🎤 Command recognition not available:', {
            recognitionRef: !!recognitionRef.current,
            isActive: isActiveRef.current,
            isInitialized: isInitialized.current
          });
          
          // Try to reinitialize if not available
          if (!recognitionRef.current && isActiveRef.current) {
            console.log('🎤 Attempting to reinitialize command recognition...');
            initializeSpeechRecognition();
          }
        }
      }, 6000); // Wait longer for speech to complete
    }, 500);
    
    // Resume wake word listening after 60 seconds of inactivity (longer for better UX)
    setTimeout(() => {
      if (!isListening && isActiveRef.current) {
        setIsWakeWordListening(true);
        setWakeWordDetected(false);
        setIsActive(false);
        isActiveRef.current = false; // Update ref
        dispatchVoiceStateChange(false); // Notify navbar
        setConversationMode(false);
        console.log('🎤 Returning to wake word listening mode');
        
        // AUTOMATICALLY restart wake word listening
        setTimeout(() => {
          if (wakeWordRecognitionRef.current && !wakeWordRecognitionActive.current) {
            try {
              console.log('🎤 Automatically restarting wake word listening after conversation');
              wakeWordRecognitionRef.current.start();
            } catch (error) {
              console.log('Error restarting wake word listening:', error.message);
            }
          }
        }, 1000); // Longer delay
      }
    }, 60000);
  }, [speakResponse, isListening, isActive, isSpeaking]);

  // Enhanced LLM-based voice command processing
  const processVoiceCommand = useCallback(async (command) => {
    if (!command.trim()) return;
    
    console.log('🎤 Processing voice command:', command);
    console.log('🎤 Current state:', {
      isActive,
      conversationMode,
      connectionStatus,
      location: location.pathname
    });
    setIsProcessing(true);
    setError(null);
    setLastCommand(command);
    const startTime = Date.now();
    
    try {
      // Check connection status first
      if (connectionStatus === 'offline') {
        throw new Error('Offline mode - using fallback processing');
      }

      // Enhanced LLM API call with intent routing
      const response = await fetchWithTimeout(`${backend_url}/api/voice-navigation/process-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: command.toLowerCase(),
          available_routes: Object.values(ROUTES),
          ui_context: uiContext,
          current_page: location.pathname,
          learned_aliases: learnedAliases,
          conversation_mode: conversationMode
        }),
      }, 10000); // 10 second timeout

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setProcessingTime(Date.now() - startTime);
      
      console.log('🎤 LLM Intent Result:', data);
      
      // Handle the LLM response
      await handleLLMResult(data);
      
      // Update learned aliases if provided
      if (data.learned_alias) {
        const newAliases = { ...learnedAliases };
        newAliases[data.learned_alias] = data.target;
        setLearnedAliases(newAliases);
        localStorage.setItem('voiceNavigatorAliases', JSON.stringify(newAliases));
        console.log('🎤 Learned new alias:', data.learned_alias, '→', data.target);
      }

      setConnectionStatus('connected');
      setRetryCount(0);

    } catch (error) {
      console.error('Error processing voice command:', error);
      setProcessingTime(Date.now() - startTime);
      
      // Fallback to local processing
      await processFallbackCommand(command);
      
      // Update connection status
      if (error.message.includes('timeout') || error.message.includes('network')) {
        setConnectionStatus('offline');
      } else {
        setConnectionStatus('error');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [conversationMode, location.pathname, uiContext, learnedAliases, connectionStatus]);

  // Enhanced fetch with timeout
  const fetchWithTimeout = async (url, options, timeout) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  };

  // Initialize speech recognition function
  const initializeSpeechRecognition = useCallback(() => {
    console.log('🎤 Initializing speech recognition...');
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // Setup wake word recognition
      wakeWordRecognitionRef.current = new SpeechRecognition();
      wakeWordRecognitionRef.current.continuous = true;
      wakeWordRecognitionRef.current.interimResults = true;
      wakeWordRecognitionRef.current.lang = 'en-US';
      wakeWordRecognitionRef.current.maxAlternatives = 3;
      
      wakeWordRecognitionRef.current.onstart = () => {
        console.log('Wake word recognition started');
        wakeWordRecognitionActive.current = true;
        setIsWakeWordListening(true);
      };
      
      wakeWordRecognitionRef.current.onend = () => {
        console.log('Wake word recognition ended');
        wakeWordRecognitionActive.current = false;
        
        // Auto-restart wake word detection if not in conversation mode
        if (!isActiveRef.current && !conversationMode) {
          setTimeout(() => {
            if (wakeWordRecognitionRef.current && !wakeWordRecognitionActive.current) {
              try {
                console.log('🎤 Auto-restarting wake word detection');
                wakeWordRecognitionRef.current.start();
              } catch (error) {
                console.log('Failed to restart wake word recognition:', error.message);
              }
            }
          }, 1000);
        }
      };
      
      wakeWordRecognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Check for wake word in both final and interim results
        const textToCheck = finalTranscript || interimTranscript;
        if (textToCheck && detectWakeWord(textToCheck) && !isSpeaking && !isActiveRef.current) {
          console.log('Wake word detected:', textToCheck);
          try {
            wakeWordRecognitionRef.current?.stop();
          } catch (error) {
            console.log('Error stopping wake word recognition:', error.message);
          }
          handleWakeWordDetected();
        }
      };
      
      wakeWordRecognitionRef.current.onerror = (event) => {
        console.error('Wake word recognition error:', event.error);
        wakeWordRecognitionActive.current = false;
        
        // Don't restart on aborted errors (normal when switching modes)
        if (event.error === 'aborted') {
          console.log('🎤 Wake word recognition aborted (normal when switching to command mode)');
          return;
        }
        
        // Restart wake word detection on other errors
        setTimeout(() => {
          if (isWakeWordListening && !isActiveRef.current && wakeWordRecognitionRef.current && !wakeWordRecognitionActive.current) {
            try {
              console.log('🎤 Auto-restarting wake word detection after error');
              wakeWordRecognitionRef.current.start();
            } catch (error) {
              console.log('Failed to restart wake word recognition after error:', error.message);
            }
          }
        }, 2000);
      };

      // Setup command recognition
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 3;
      
      recognitionRef.current.onstart = () => {
        console.log('Command recognition started');
        setIsListening(true);
        setShowStatus(true);
        setError(null);
        commandRecognitionActive.current = true;
      };
      
      recognitionRef.current.onend = () => {
        console.log('Command recognition ended');
        setIsListening(false);
        setShowStatus(false);
        commandRecognitionActive.current = false;
        
        // If we're still in conversation mode, restart listening
        if (conversationMode && isActiveRef.current) {
          console.log('🎤 Conversation mode active - restarting command recognition...');
          commandRecognitionActive.current = false;
          
          setTimeout(() => {
            if (conversationMode && isActiveRef.current && recognitionRef.current) {
              try {
                console.log('🎤 Restarting command recognition for continued conversation');
                setTimeout(() => {
                  if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.log('Failed to restart command recognition:', error.message);
              }
            }
                }, 500);
              } catch (error) {
                console.log('Failed to restart command recognition:', error.message);
              }
            }
          }, 2000);
        } else {
          // Resume wake word listening
          setIsWakeWordListening(true);
          setWakeWordDetected(false);
          setIsActive(false);
          isActiveRef.current = false; // Update ref
          dispatchVoiceStateChange(false); // Notify navbar
          setConversationMode(false);
          
          setTimeout(() => {
            if (wakeWordRecognitionRef.current && !wakeWordRecognitionActive.current) {
              try {
                console.log('🎤 Automatically restarting wake word listening after command recognition ended');
                wakeWordRecognitionRef.current.start();
              } catch (error) {
                console.log('Error restarting wake word listening:', error.message);
              }
            }
          }, 100);
        }
      };
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        console.log('🎤 Command recognition result:', {
          finalTranscript,
          interimTranscript,
          isActive,
          conversationMode
        });
        
        if (finalTranscript) {
          console.log('🎤 Final transcript received:', finalTranscript);
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript);
        } else if (interimTranscript) {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setShowStatus(false);
        
        // Don't show error for aborted (normal when switching modes)
        if (event.error === 'aborted') {
          console.log('🎤 Command recognition aborted (normal when switching modes)');
          return;
        }
        
        switch (event.error) {
          case 'not-allowed':
            setError('Microphone access denied. Please allow microphone access.');
            break;
          case 'no-speech':
            setError('No speech detected. Please try speaking again.');
            break;
          case 'audio-capture':
            setError('Audio capture failed. Please check your microphone.');
            break;
          default:
            setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onnomatch = () => {
        setError('No speech recognized. Please try again.');
      };

      isInitialized.current = true;
      console.log('🎤 Speech recognition initialized successfully');

    } else {
      setError('Speech recognition not supported in this browser.');
    }

    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    } else {
      setError('Speech synthesis not supported in this browser.');
    }
  }, [isActive, conversationMode, isSpeaking, detectWakeWord, handleWakeWordDetected, processVoiceCommand, isWakeWordListening]);

  // Enhanced LLM result handler
  const handleLLMResult = useCallback(async (result) => {
    console.log('🎤 Handling LLM result:', result);
    
    switch (result.intent) {
      case "OPEN_PAGE":
        if (result.target) {
          console.log('🎤 Opening page:', result.target);
          speakResponse(`Opening ${getPageName(result.target)}`);
          setTimeout(() => {
            navigate(result.target);
            speakResponse(`You're now on the ${getPageName(result.target)}. What would you like to do next?`);
          }, 1000);
        }
        break;
        
      case "NEXT":
        if (uiContext.hasNext) {
          console.log('🎤 Going to next step');
          speakResponse("Moving to the next step.");
          // Implement your next step logic here
          // goToNextStep();
        } else {
          console.log('🎤 No next step available');
          speakResponse("There's no next step here.");
        }
        break;
        
      case "BACK":
        if (uiContext.hasBack) {
          console.log('🎤 Going back');
          speakResponse("Going back to the previous page.");
          navigate(-1);
        } else {
          console.log('🎤 No previous page available');
          speakResponse("There's no previous page.");
        }
        break;
        
      case "SCROLL_UP":
        console.log('🎤 Scrolling up');
        speakResponse("Scrolling up.");
        window.scrollBy(0, -300);
        break;
        
      case "SCROLL_DOWN":
        console.log('🎤 Scrolling down');
        speakResponse("Scrolling down.");
        window.scrollBy(0, 300);
        break;
        
      case "SEARCH":
        console.log('🎤 Search intent:', result.target);
        speakResponse(`Searching for ${result.target}`);
        // Implement search functionality
        break;
        
      case "CLARIFY":
        console.log('🎤 Clarification needed:', result.reason);
        speakResponse(result.reason || "Could you please clarify what you'd like to do?");
        break;
        
      default:
        console.log('🎤 Unknown intent:', result.intent);
        speakResponse("I'm not sure how to handle that. Could you try a different command?");
    }
  }, [navigate, uiContext]);

  // Enhanced fallback command processing with fuzzy matching
  const processFallbackCommand = async (command) => {
    const lowerCommand = command.toLowerCase().trim();
    
    console.log('🎤 Processing fallback command:', lowerCommand);
    console.log('🎤 Fallback processing state:', {
      isActive,
      conversationMode,
      location: location.pathname
    });
    
    // Check learned aliases first
    if (learnedAliases[lowerCommand]) {
      console.log('🎤 Matched learned alias:', lowerCommand, '→', learnedAliases[lowerCommand]);
      const target = learnedAliases[lowerCommand];
      speakResponse(`Opening ${getPageName(target)}`);
      setTimeout(() => {
        navigate(target);
        speakResponse(`You're now on the ${getPageName(target)}. What would you like to do next?`);
      }, 1000);
      return;
    }
    
    // Fuzzy matching for calculator aliases
    if (CALC_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, CALC_ALIASES)) {
      console.log('🎤 Matched calculator alias:', lowerCommand);
      speakResponse("Opening Calculator");
      setTimeout(() => {
        navigate(ROUTES.calculator);
        speakResponse("You're now on the calculator page. What would you like to do next?");
      }, 1000);
      return;
    }
    
    // Fuzzy matching for other aliases
    if (EXPENSE_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, EXPENSE_ALIASES)) {
      console.log('🎤 Matched expense alias:', lowerCommand);
      speakResponse("Opening Expense Tracker");
      setTimeout(() => {
        navigate(ROUTES.expenses);
        speakResponse("You're now on the expense tracker. What would you like to do next?");
      }, 1000);
      return;
    }
    
    if (COMMUNITY_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, COMMUNITY_ALIASES)) {
      console.log('🎤 Matched community alias:', lowerCommand);
      speakResponse("Opening Community");
      setTimeout(() => {
        navigate(ROUTES.community);
        speakResponse("You're now on the community page. What would you like to do next?");
      }, 1000);
      return;
    }
    
    if (NEWS_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, NEWS_ALIASES)) {
      console.log('🎤 Matched news alias:', lowerCommand);
      speakResponse("Opening News");
      setTimeout(() => {
        navigate(ROUTES.news);
        speakResponse("You're now on the news page. What would you like to do next?");
      }, 1000);
      return;
    }
    
    if (LEARN_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, LEARN_ALIASES)) {
      console.log('🎤 Matched learn alias:', lowerCommand);
      speakResponse("Opening Learning Resources");
      setTimeout(() => {
        navigate(ROUTES.learn);
        speakResponse("You're now on the learning resources page. What would you like to do next?");
      }, 1000);
      return;
    }

    // Enhanced aliases for all routes
    if (HOME_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, HOME_ALIASES)) {
      console.log('🎤 Matched home alias:', lowerCommand);
      speakResponse("Taking you to the homepage");
      setTimeout(() => {
        navigate(ROUTES.home);
        speakResponse("You're now on the homepage. What would you like to do next?");
      }, 1000);
      return;
    }

    if (DASHBOARD_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, DASHBOARD_ALIASES)) {
      console.log('🎤 Matched dashboard alias:', lowerCommand);
      speakResponse("Opening your dashboard");
      setTimeout(() => {
        navigate(ROUTES.dashboard);
        speakResponse("You're now on your dashboard. What would you like to do next?");
      }, 1000);
      return;
    }

    if (PROFILE_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, PROFILE_ALIASES)) {
      console.log('🎤 Matched profile alias:', lowerCommand);
      speakResponse("Opening your profile");
      setTimeout(() => {
        navigate(ROUTES.profile);
        speakResponse("You're now on your profile page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (LOGIN_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, LOGIN_ALIASES)) {
      console.log('🎤 Matched login alias:', lowerCommand);
      speakResponse("Opening login page");
      setTimeout(() => {
        navigate(ROUTES.login);
        speakResponse("You're now on the login page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (SIGNUP_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, SIGNUP_ALIASES)) {
      console.log('🎤 Matched signup alias:', lowerCommand);
      speakResponse("Opening registration page");
      setTimeout(() => {
        navigate(ROUTES.signup);
        speakResponse("You're now on the registration page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (CHATBOT_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, CHATBOT_ALIASES)) {
      console.log('🎤 Matched chatbot alias:', lowerCommand);
      speakResponse("Opening AI chatbot");
      setTimeout(() => {
        navigate(ROUTES.chatbot);
        speakResponse("You're now on the AI chatbot page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (ADVISOR_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, ADVISOR_ALIASES)) {
      console.log('🎤 Matched advisor alias:', lowerCommand);
      speakResponse("Opening financial advisor");
      setTimeout(() => {
        navigate(ROUTES.advisor);
        speakResponse("You're now on the financial advisor page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (SCAMS_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, SCAMS_ALIASES)) {
      console.log('🎤 Matched scams alias:', lowerCommand);
      speakResponse("Opening fraud protection information");
      setTimeout(() => {
        navigate(ROUTES.scams);
        speakResponse("You're now on the fraud protection page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (MIP_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, MIP_ALIASES)) {
      console.log('🎤 Matched MIP alias:', lowerCommand);
      speakResponse("Opening microinvestment platform");
      setTimeout(() => {
        navigate(ROUTES.mip);
        speakResponse("You're now on the microinvestment platform. What would you like to do next?");
      }, 1000);
      return;
    }

    if (POULTRY_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, POULTRY_ALIASES)) {
      console.log('🎤 Matched poultry alias:', lowerCommand);
      speakResponse("Opening poultry farming guide");
      setTimeout(() => {
        navigate(ROUTES.poultry);
        speakResponse("You're now on the poultry farming guide. What would you like to do next?");
      }, 1000);
      return;
    }

    if (RURAL_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, RURAL_ALIASES)) {
      console.log('🎤 Matched rural alias:', lowerCommand);
      speakResponse("Opening rural business opportunities");
      setTimeout(() => {
        navigate(ROUTES.rural);
        speakResponse("You're now on the rural business page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (DAIRY_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, DAIRY_ALIASES)) {
      console.log('🎤 Matched dairy alias:', lowerCommand);
      speakResponse("Opening dairy farming community");
      setTimeout(() => {
        navigate(ROUTES.dairy);
        speakResponse("You're now on the dairy farming community page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (SCHEME_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, SCHEME_ALIASES)) {
      console.log('🎤 Matched scheme alias:', lowerCommand);
      speakResponse("Opening government schemes");
      setTimeout(() => {
        navigate(ROUTES.scheme);
        speakResponse("You're now on the government schemes page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (STORIES_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, STORIES_ALIASES)) {
      console.log('🎤 Matched stories alias:', lowerCommand);
      speakResponse("Opening success stories");
      setTimeout(() => {
        navigate(ROUTES.stories);
        speakResponse("You're now on the success stories page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (QNA_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, QNA_ALIASES)) {
      console.log('🎤 Matched Q&A alias:', lowerCommand);
      speakResponse("Opening Q&A sessions");
      setTimeout(() => {
        navigate(ROUTES.qna);
        speakResponse("You're now on the Q&A sessions page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (OCR_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, OCR_ALIASES)) {
      console.log('🎤 Matched OCR alias:', lowerCommand);
      speakResponse("Opening document processing tool");
      setTimeout(() => {
        navigate(ROUTES.ocr);
        speakResponse("You're now on the document processing page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (ROAD_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, ROAD_ALIASES)) {
      console.log('🎤 Matched roadmap alias:', lowerCommand);
      speakResponse("Opening financial planning roadmap");
      setTimeout(() => {
        navigate(ROUTES.road);
        speakResponse("You're now on the financial planning roadmap. What would you like to do next?");
      }, 1000);
      return;
    }

    if (SHORTS_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, SHORTS_ALIASES)) {
      console.log('🎤 Matched shorts alias:', lowerCommand);
      speakResponse("Opening video content");
      setTimeout(() => {
        navigate(ROUTES.shorts);
        speakResponse("You're now on the video content page. What would you like to do next?");
      }, 1000);
      return;
    }

    if (MEETINGS_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, MEETINGS_ALIASES)) {
      console.log('🎤 Matched meetings alias:', lowerCommand);
      speakResponse("Opening meeting scheduler");
      setTimeout(() => {
        navigate(ROUTES.meetings);
        speakResponse("You're now on the meeting scheduler. What would you like to do next?");
      }, 1000);
      return;
    }
    
    // Check for navigation commands
    if (lowerCommand === 'next') {
      if (uiContext.hasNext) {
        console.log('🎤 Going to next step');
        speakResponse("Moving to the next step.");
        // goToNextStep();
      } else {
        console.log('🎤 No next step available');
        speakResponse("There's no next step here.");
      }
      return;
    }
    
    if (lowerCommand === 'back') {
      if (uiContext.hasBack) {
        console.log('🎤 Going back');
        speakResponse("Going back to the previous page.");
        navigate(-1);
      } else {
        console.log('🎤 No previous page available');
        speakResponse("There's no previous page.");
      }
      return;
    }
    
    // Generic fallback response with comprehensive suggestions
    const fallbackResponse = "I'm not sure what you mean. Try saying 'calculator', 'expenses', 'community', 'news', 'learn', 'dashboard', 'profile', 'chatbot', 'advisor', 'scams', 'mip', 'poultry', 'rural', 'dairy', 'scheme', 'stories', 'qna', 'ocr', 'roadmap', 'videos', 'meetings', 'next', 'back', or 'help' to see all available commands.";
    speakResponse(fallbackResponse);
    setError('Command not recognized');
  };

  // Fuzzy matching function (Levenshtein distance ≤ 2)
  const fuzzyMatch = (input, aliasSet) => {
    for (const alias of aliasSet) {
      if (levenshteinDistance(input, alias) <= 2) {
        return true;
      }
    }
    return false;
  };

  // Levenshtein distance calculation
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  // Get page name for speech
  const getPageName = (path) => {
    switch (path) {
      case '/': return 'home page';
      case '/ppf': return 'calculator page';
      case '/expenses': return 'expense tracker';
      case '/community': return 'community page';
      case '/news': return 'news page';
      case '/learn': return 'learning resources';
      case '/chatbot': return 'chatbot';
      case '/scams': return 'scams information';
      case '/profile': return 'profile page';
      case '/login': return 'login page';
      case '/signup': return 'signup page';
      default: return path;
    }
  };

  // Enhanced action execution - Google Assistant style navigation
  const executeAction = useCallback(async (action, response) => {
    try {
      console.log('🎤 Executing action:', action.type, action.path);
      
      switch (action.type) {
        case 'navigate':
          if (action.path) {
            console.log('🎤 Navigating to:', action.path);
            navigate(action.path);
            // Speak confirmation after navigation
            setTimeout(() => {
              const pageName = action.path === '/' ? 'home page' : 
                              action.path === '/ppf' ? 'calculator page' :
                              action.path === '/financialAdvisior' ? 'dashboard page' :
                              action.path === '/expenses' ? 'expense tracker' :
                              action.path === '/community' ? 'community page' :
                              action.path === '/news' ? 'news page' :
                              action.path === '/learn' ? 'learning resources' :
                              action.path === '/chatbot' ? 'chatbot' :
                              action.path === '/scams' ? 'scams information' :
                              action.path === '/profile' ? 'profile page' :
                              action.path === '/login' ? 'login page' :
                              action.path === '/signup' ? 'signup page' :
                              action.path;
              speakResponse(`You're now on the ${pageName}. What would you like to do next?`);
            }, 1000);
          }
          break;
        case 'open_chat':
          speakResponse("Opening chat interface for you.");
          break;
        case 'schedule_meeting':
          navigate('/meetings');
          setTimeout(() => {
            speakResponse("I've opened the meeting scheduler. You can schedule your consultation here.");
          }, 1000);
          break;
        case 'open_calculator':
          navigate('/ppf');
          setTimeout(() => {
            speakResponse("I've opened the financial calculator. You can calculate investments, PPF, and more here.");
          }, 1000);
          break;
        case 'open_expenses':
          navigate('/expenses');
          setTimeout(() => {
            speakResponse("I've opened the expense tracker. You can track your spending and manage your budget here.");
          }, 1000);
          break;
        case 'get_advice':
          navigate('/chatbot');
          setTimeout(() => {
            speakResponse("I've opened the AI chatbot. You can get personalized financial advice here.");
          }, 1000);
          break;
        case 'investment_guide':
          navigate('/learn');
          setTimeout(() => {
            speakResponse("I've opened the learning resources. You can find investment guides and financial education here.");
          }, 1000);
          break;
        case 'saving_tips':
          navigate('/learn');
          setTimeout(() => {
            speakResponse("I've opened the learning resources. You can find money-saving tips and financial education here.");
          }, 1000);
          break;
        case 'greeting':
          // Handle greeting - already handled by response
          break;
        case 'help':
          // Show help - already handled by response
          break;
        case 'clarification':
          // Handle clarification request - already handled by response
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      setError('Failed to execute action');
    }
  }, [navigate, speakResponse]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Clear any existing timeouts
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      recognitionRef.current?.start();
    }
  }, [isListening]);

  const toggleMute = () => setIsMuted(!isMuted);

  // Enhanced speech recognition setup
  useEffect(() => {
    if (isInitialized.current) return; // Prevent multiple initializations
    
    console.log('🎤 Initializing speech recognition on component mount...');
    initializeSpeechRecognition();
  
  }, []); // Empty dependency array to run only once

  // AUTOMATIC startup - start wake word listening immediately when component loads
  useEffect(() => {
    console.log('🎤 Component loaded - starting automatic wake word listening');
    
    // Dispatch initial state to navbar
    dispatchVoiceStateChange(false);
    
    // Request microphone permission first
    const requestMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('🎤 Microphone permission granted');
        stream.getTracks().forEach(track => track.stop()); // Stop the stream after permission
      } catch (error) {
        console.error('🎤 Microphone permission denied:', error);
        setError('Microphone access denied. Please allow microphone access to use voice navigation.');
      }
    };
    
    requestMicrophonePermission();
    
    const timer = setTimeout(() => {
      if (isInitialized.current && wakeWordRecognitionRef.current && !wakeWordRecognitionActive.current && !isActiveRef.current && !isSpeaking) {
        try {
          console.log('🎤 Starting initial automatic wake word listening');
          wakeWordRecognitionRef.current.start();
          setIsWakeWordListening(true);
        } catch (error) {
          console.log('Initial wake word recognition error:', error.message);
        }
      }
    }, 3000); // Wait longer for full initialization

    return () => clearTimeout(timer);
  }, [isActive, isSpeaking]);

  // AUTOMATIC wake word detection - start on every page change
  useEffect(() => {
    console.log('🎤 Page changed to:', location.pathname, '- Starting automatic wake word listening');
    
    // Add a small delay to ensure proper initialization
    const timer = setTimeout(() => {
      if (isInitialized.current && wakeWordRecognitionRef.current && !isActiveRef.current && !wakeWordRecognitionActive.current && !isSpeaking) {
         try {
          console.log('🎤 Starting automatic wake word listening on page:', location.pathname);
           wakeWordRecognitionRef.current.start();
          setIsWakeWordListening(true);
         } catch (error) {
          console.log('Wake word recognition already started or error:', error.message);
        }
      }
    }, 1000); // Longer delay for page transitions

    return () => clearTimeout(timer);
  }, [location.pathname, isActive, isSpeaking]); // Restart on every page change

  // Also start wake word detection when conditions change
  useEffect(() => {
    // Add a small delay to ensure proper initialization
    const timer = setTimeout(() => {
      if (isInitialized.current && wakeWordRecognitionRef.current && isWakeWordListening && !isActive && !wakeWordRecognitionActive.current) {
         try {
           wakeWordRecognitionRef.current.start();
      } catch (error) {
          console.log('Wake word recognition already started or error:', error.message);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isWakeWordListening, isActive]);

  // Connection status monitoring - Removed unnecessary test endpoint call
  useEffect(() => {
    // Set connection status to connected since we're not doing actual connection checks
    setConnectionStatus('connected');
  }, []);

  // Cleanup timeouts and recognition on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      // Stop all recognition instances
      if (wakeWordRecognitionRef.current && wakeWordRecognitionActive.current) {
        try {
        wakeWordRecognitionRef.current.stop();
        } catch (error) {
          console.log('Error stopping wake word recognition on cleanup:', error.message);
        }
      }
      
      if (recognitionRef.current && commandRecognitionActive.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Error stopping command recognition on cleanup:', error.message);
        }
      }
    };
  }, []);

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <SimpleIcons.CheckCircle className="w-3 h-3 text-green-500" />;
      case 'offline':
        return <SimpleIcons.AlertCircle className="w-3 h-3 text-yellow-500" />;
      case 'error':
        return <SimpleIcons.AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <SimpleIcons.AlertCircle className="w-3 h-3 text-gray-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <button
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
            isActive 
              ? 'bg-green-500 hover:bg-green-600 animate-pulse' 
              : wakeWordDetected
              ? 'bg-blue-500 hover:bg-blue-600 animate-pulse'
              : 'bg-green-500 hover:bg-green-600 animate-bounce'
          } ${isListening ? 'animate-pulse scale-110' : ''} ${error ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => {
            if (!isActive) {
              handleWakeWordDetected();
            } else {
              setIsActive(false);
              isActiveRef.current = false;
              dispatchVoiceStateChange(false); // Notify navbar
              setConversationMode(false);
              setIsWakeWordListening(true);
              
              // Stop command recognition
              if (recognitionRef.current && commandRecognitionActive.current) {
                try {
                  recognitionRef.current.stop();
                } catch (error) {
                  console.log('Error stopping command recognition:', error.message);
                }
              }
            }
          }}
          title={isActive ? "Click to stop voice assistant" : "Say 'Hello Fin Advisor' to start"}
        >
          <SimpleIcons.Mic className="w-6 h-6" />
          {isWakeWordListening && !isActive && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </button>
      </div>

      {/* Voice Assistant Panel - Similar to Chatbot Panel */}
      {isActive && (
        <div
          className="fixed bottom-24 left-8 z-50 bg-white/95 rounded-2xl shadow-2xl border border-green-200 w-[85vw] max-w-sm h-[60vh] flex flex-col animate-fade-in"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px)`,
            cursor: dragging ? "grabbing" : "grab",
          }}
        >
          <div
            className="flex items-center justify-between p-3 bg-gradient-to-r from-green-100 to-green-50 rounded-t-2xl border-b border-green-100 cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <span className="font-bold text-green-700 flex items-center">
              Voice Assistant
              <span className="ml-2 text-green-500 animate-pulse">🎤</span>
            </span>
            <button
              className="text-green-700 hover:text-red-500 transition"
              onClick={() => {
                setIsActive(false);
                isActiveRef.current = false;
                dispatchVoiceStateChange(false);
                setConversationMode(false);
                setIsWakeWordListening(true);
                
                if (recognitionRef.current && commandRecognitionActive.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (error) {
                    console.log('Error stopping command recognition:', error.message);
                  }
                }
              }}
            >
              <SimpleIcons.X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Status Information */}
            <div className="space-y-3 mb-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Connection:</span>
                <div className="flex items-center space-x-2">
                  {getConnectionStatusIcon()}
                  <span className="text-sm text-gray-700">{getConnectionStatusText()}</span>
                </div>
              </div>

              {/* Listening Status */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Status:</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : isWakeWordListening ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-700">
                    {isListening ? 'Listening...' : isWakeWordListening ? 'Wake Word Active' : 'Ready'}
                  </span>
                </div>
              </div>

              {/* Mode */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Mode:</span>
                <span className="text-sm text-gray-700">
                  {conversationMode ? 'Conversation' : 'Wake Word'}
                </span>
              </div>

              {/* Processing Time */}
              {processingTime > 0 && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Response Time:</span>
                  <span className="text-sm text-gray-700">{processingTime}ms</span>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 flex items-center">
                  <SimpleIcons.AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </p>
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 flex items-center">
                  <span className="mr-2 text-blue-500">💬</span>
                  "{transcript}"
                </p>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <SimpleIcons.Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                <span className="text-sm text-yellow-700">Processing...</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex space-x-2 mt-4">
              <button
                onClick={toggleListening}
                disabled={isProcessing}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50`}
              >
                {isListening ? 'Stop' : 'Start'}
              </button>

              <button
                onClick={toggleMute}
                className={`p-2 rounded-lg border transition-all duration-300 ${
                  isMuted 
                    ? 'bg-red-100 border-red-300 text-red-600' 
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <SimpleIcons.Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Commands */}
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 text-sm mb-2">Try saying:</h4>
              <div className="grid grid-cols-1 gap-2">
                {["Go to calculator", "Track expenses", "Get advice", "Schedule meeting"].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => processVoiceCommand(suggestion)}
                    className="w-full text-left text-sm text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors border border-blue-100"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Button */}
      <div className="fixed bottom-6 left-20 z-50">
        <button
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all duration-300 hover:scale-110"
          onClick={() => setIsOpen(!isOpen)}
        >
          <SimpleIcons.HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed bottom-24 left-20 z-50 bg-white rounded-2xl p-4 shadow-2xl border border-gray-200 w-80 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Voice Commands</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <SimpleIcons.X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-800 text-sm mb-2">Wake Word:</h4>
              <div className="text-xs text-gray-600 mb-2">
                Say any of these to start the voice assistant:
              </div>
              <div className="space-y-1">
                {["Hello Fin Advisor", "Hello Financial Advisor", "Hi Fin Advisor", "Hey Fin Advisor"].map((wakeWord, index) => (
                  <span key={index} className="block text-xs bg-green-50 px-2 py-1 rounded border text-green-700">
                    "{wakeWord}"
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 text-sm mb-2">Navigation:</h4>
              <div className="grid grid-cols-2 gap-1">
                {Object.keys(websiteStructure.pages).slice(0, 8).map((page) => (
                  <span key={page} className="text-xs bg-gray-100 px-2 py-1 rounded border text-gray-700">
                    "Go to {page}"
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 text-sm mb-2">Examples:</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p>• "Hello Fin Advisor" (to start)</p>
                <p>• "Take me to the calculator"</p>
                <p>• "I want to track my expenses"</p>
                <p>• "Help me save money"</p>
                <p>• "Schedule a meeting"</p>
              </div>
            </div>

            {/* Connection Status in Help */}
            <div className="border-t pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">System Status:</span>
                <div className="flex items-center space-x-1">
                  {getConnectionStatusIcon()}
                  <span className={connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>
                    {getConnectionStatusText()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default VoiceNavigator;
