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
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [processingTime, setProcessingTime] = useState(0);
  const [isWakeWordListening, setIsWakeWordListening] = useState(true);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // UI state
  const [isOpen, setIsOpen] = useState(false);
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
  const isActiveRef = useRef(false);
  const conversationModeRef = useRef(false);   // ref mirror of conversationMode — avoids stale closures
  const isSpeakingRef = useRef(false);          // ref mirror of isSpeaking
  const isStartingWakeWord = useRef(false);     // race guard: prevents concurrent .start() calls
  const resetActivityTimerRef = useRef(null);   // 60 s inactivity timer handle
  const pendingCommandStartRef = useRef(null);  // callback invoked by TTS onend
  const startWakeWordListeningRef = useRef(null); // stable ref to startWakeWordListening
  const handleWakeWordDetectedRef = useRef(null); // stable ref to handleWakeWordDetected
  const suppressUntilRef = useRef(0);             // timestamp: discard onresult before this (post-TTS echo guard)
  const backend_url = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

  // Dragging functionality
  const handleMouseDown = (e) => {
    setDragging(true);
    setRel({ x: e.clientX - drag.x, y: e.clientY - drag.y });
    e.preventDefault();
  };
  const handleMouseUp = () => setDragging(false);
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setDrag({ x: e.clientX - rel.x, y: e.clientY - rel.y });
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

  const dispatchVoiceStateChange = useCallback((isActive) => {
    window.dispatchEvent(new CustomEvent('voiceNavigatorStateChange', { detail: { isActive } }));
  }, []);

  // Wake word patterns
  const WAKE_WORDS = [
    /^hello\s+fin\s+advisor$/i,
    /^hello\s+financial\s+advisor$/i,
    /^hi\s+fin\s+advisor$/i,
    /^hi\s+financial\s+advisor$/i,
    /^hey\s+fin\s+advisor$/i,
    /^hey\s+financial\s+advisor$/i,
    /^fin\s+advisor$/i,
    /^financial\s+advisor$/i,
    /hello\s+financial\s+advisior/i,
    /hello\s+fin\s+advisior/i,
    /hi\s+financial\s+advisior/i,
    /hey\s+financial\s+advisior/i,
    /financial\s+advisior/i,
    /fin\s+advisior/i,
    /.*hello.*financial.*advisor.*/i,
    /.*hello.*fin.*advisor.*/i,
    /.*financial.*advisor.*/i,
    /.*fin.*advisor.*/i
  ];

  // Route mapping
  const ROUTES = {
    calculator: "/ppf", ppf: "/ppf",
    expenses: "/expenses", expense_tracker: "/expenses",
    community: "/community",
    news: "/news",
    learn: "/learn", learning: "/learn",
    home: "/",
    dashboard: "/financialAdvisior",
    profile: "/profile",
    login: "/login",
    signup: "/register", register: "/register",
    chatbot: "/chatbot",
    advisor: "/advisor",
    scams: "/scams", fraud: "/scams",
    mip: "/mip", microinvestment: "/mip",
    poultry: "/poultry",
    rural: "/rural",
    dairy: "/dairy",
    scheme: "/scheme",
    stories: "/stories",
    qna: "/qna",
    ocr: "/ocr",
    road: "/road", roadmap: "/road",
    shorts: "/shorts",
    meetings: "/meetings"
  };

  // Alias sets
  const CALC_ALIASES = new Set(["calculator","calc","calci","claculator","calcultor","calcutator","calcu","cal","calculater","calclator","calcultr","calcutr"]);
  const EXPENSE_ALIASES = new Set(["expenses","expense","tracker","budget","spending","money","costs"]);
  const COMMUNITY_ALIASES = new Set(["community","forum","discussion","chat","talk","people","users"]);
  const NEWS_ALIASES = new Set(["news","updates","latest","information","articles","blog"]);
  const LEARN_ALIASES = new Set(["learn","learning","education","guide","tutorial","help","resources"]);
  const HOME_ALIASES = new Set(["home","main","landing","start","beginning","front","first"]);
  const DASHBOARD_ALIASES = new Set(["dashboard","control","panel","overview","summary","main"]);
  const PROFILE_ALIASES = new Set(["profile","account","settings","user","personal","my"]);
  const LOGIN_ALIASES = new Set(["login","signin","sign in","log in","enter","access"]);
  const SIGNUP_ALIASES = new Set(["signup","register","sign up","registration","join","create account"]);
  const CHATBOT_ALIASES = new Set(["chatbot","chat","bot","ai","assistant","help","support","talk"]);
  const ADVISOR_ALIASES = new Set(["advisor","adviser","financial advisor","financial adviser","consultant","expert"]);
  const SCAMS_ALIASES = new Set(["scams","fraud","security","safety","protection","warning","danger"]);
  const MIP_ALIASES = new Set(["microinvestment","mip","investment platform","invest","micro invest","small investment"]);
  const POULTRY_ALIASES = new Set(["poultry","chicken","farm","poultry farm","chicken farm","bird","livestock"]);
  const RURAL_ALIASES = new Set(["rural","village","countryside","business opportunities","rural business","local business"]);
  const DAIRY_ALIASES = new Set(["dairy","milk","cattle","cow","buffalo","dairy farm","milk business"]);
  const SCHEME_ALIASES = new Set(["scheme","government","government scheme","government schemes","program","initiative"]);
  const STORIES_ALIASES = new Set(["stories","success","success stories","inspiration","motivation","case study"]);
  const QNA_ALIASES = new Set(["qna","questions","answers","faq","help","support","ask","question"]);
  const OCR_ALIASES = new Set(["ocr","document","scan","text recognition","document processing","extract"]);
  const ROAD_ALIASES = new Set(["road","roadmap","plan","planning","strategy","path","journey"]);
  const SHORTS_ALIASES = new Set(["shorts","video","youtube","youtube shorts","videos","content"]);
  const MEETINGS_ALIASES = new Set(["meetings","meeting","schedule","appointment","consultation","book","reserve"]);

  const [learnedAliases, setLearnedAliases] = useState(() => {
    const saved = localStorage.getItem('voiceNavigatorAliases');
    return saved ? JSON.parse(saved) : {};
  });

  const [uiContext, setUiContext] = useState({ hasNext: false, hasBack: false, currentStep: 1, totalSteps: 1 });

  const websiteStructure = {
    pages: {
      home: { path: "/", description: "Main homepage" },
      dashboard: { path: "/financialAdvisior", description: "User dashboard" },
      profile: { path: "/profile", description: "User profile" },
      login: { path: "/login", description: "Login" },
      signup: { path: "/register", description: "Registration" },
      ppf: { path: "/ppf", description: "PPF calculator" },
      expenses: { path: "/expenses", description: "Expense tracking" },
      news: { path: "/news", description: "Financial news" },
      learn: { path: "/learn", description: "Learning resources" },
      community: { path: "/community", description: "Community forum" },
      dairy: { path: "/dairy", description: "Dairy farming" },
      chatbot: { path: "/chatbot", description: "AI chatbot" },
      advisor: { path: "/advisor", description: "Financial advisor" },
      scams: { path: "/scams", description: "Scam protection" },
      mip: { path: "/mip", description: "Microinvestment" },
      poultry: { path: "/poultry", description: "Poultry farming" },
      rural: { path: "/rural", description: "Rural business" },
      scheme: { path: "/scheme", description: "Government schemes" },
      stories: { path: "/stories", description: "Success stories" },
      qna: { path: "/qna", description: "Q&A" },
      ocr: { path: "/ocr", description: "Document OCR" },
      road: { path: "/road", description: "Financial roadmap" },
      shorts: { path: "/shorts", description: "Video content" },
      meetings: { path: "/meetings", description: "Schedule meetings" }
    },
    actions: {
      "send message": { action: "open_chat" },
      "schedule meeting": { action: "schedule_meeting" },
      "calculate": { action: "open_calculator" },
      "track expenses": { action: "open_expenses" },
      "get advice": { action: "get_advice" },
      "invest money": { action: "investment_guide" },
      "save money": { action: "saving_tips" }
    }
  };

  const fallbackCommands = {
    "hello financial advisor": { type: 'greeting', response: "Welcome! How can I help you?" },
    "hello financial advisior": { type: 'greeting', response: "Welcome! How can I help you?" },
    "go to calculator": { type: 'navigate', path: '/ppf' },
    "open calculator": { type: 'navigate', path: '/ppf' },
    "go to expenses": { type: 'navigate', path: '/expenses' },
    "open expenses": { type: 'navigate', path: '/expenses' },
    "go to community": { type: 'navigate', path: '/community' },
    "go to news": { type: 'navigate', path: '/news' },
    "go to learn": { type: 'navigate', path: '/learn' },
    "go to home": { type: 'navigate', path: '/' },
    "homepage": { type: 'navigate', path: '/' },
    "go to dashboard": { type: 'navigate', path: '/financialAdvisior' },
    "open dashboard": { type: 'navigate', path: '/financialAdvisior' },
    "go to profile": { type: 'navigate', path: '/profile' },
    "go to login": { type: 'navigate', path: '/login' },
    "sign in": { type: 'navigate', path: '/login' },
    "go to signup": { type: 'navigate', path: '/register' },
    "register": { type: 'navigate', path: '/register' },
    "go to chatbot": { type: 'navigate', path: '/chatbot' },
    "open chatbot": { type: 'navigate', path: '/chatbot' },
    "go to advisor": { type: 'navigate', path: '/advisor' },
    "financial advisor": { type: 'navigate', path: '/advisor' },
    "go to scams": { type: 'navigate', path: '/scams' },
    "go to mip": { type: 'navigate', path: '/mip' },
    "go to poultry": { type: 'navigate', path: '/poultry' },
    "go to rural": { type: 'navigate', path: '/rural' },
    "go to dairy": { type: 'navigate', path: '/dairy' },
    "go to scheme": { type: 'navigate', path: '/scheme' },
    "government schemes": { type: 'navigate', path: '/scheme' },
    "go to stories": { type: 'navigate', path: '/stories' },
    "go to qna": { type: 'navigate', path: '/qna' },
    "go to ocr": { type: 'navigate', path: '/ocr' },
    "go to road": { type: 'navigate', path: '/road' },
    "roadmap": { type: 'navigate', path: '/road' },
    "go to shorts": { type: 'navigate', path: '/shorts' },
    "go to meetings": { type: 'navigate', path: '/meetings' },
    "schedule meeting": { type: 'navigate', path: '/meetings' },
    "help": { type: 'help', response: "Say the name of any page to navigate there. For example: 'calculator', 'expenses', 'dashboard', 'chatbot'." },
    "what can you do": { type: 'help', response: "I can navigate to any page. Just say where you want to go." }
  };

  // ── speakResponse(text, onComplete?) ─────────────────────────────────────────
  // onComplete fires ONLY inside utterance.onend — never while TTS is playing.
  const speakResponse = useCallback((text, onComplete) => {
    if (isMuted || !synthesisRef.current) {
      if (onComplete) onComplete();
      return;
    }
    try {
      synthesisRef.current.cancel();
      pendingCommandStartRef.current = onComplete || null;
      setIsSpeaking(true);
      isSpeakingRef.current = true;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';

      utterance.onstart = () => { console.log('🎤 Started speaking:', text); };

      utterance.onerror = (event) => {
        if (event.error !== 'interrupted') {
          console.error('Speech synthesis error:', event);
          setError('Speech synthesis failed');
        }
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        suppressUntilRef.current = 0; // clear echo window on cancel
        pendingCommandStartRef.current = null;
      };

      utterance.onend = () => {
        console.log('🎤 Finished speaking');
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        // 1.5-second post-TTS suppression window:
        // browser holds ~500ms buffered audio after TTS ends — discard it all.
        suppressUntilRef.current = Date.now() + 1500;
        const cb = pendingCommandStartRef.current;
        pendingCommandStartRef.current = null;
        if (cb) {
          cb();
        } else if (
          conversationModeRef.current &&
          isActiveRef.current &&
          recognitionRef.current &&
          !commandRecognitionActive.current
        ) {
          // No callback but in conversation mode — restart command recognition
          // after the suppression window has a chance to take effect.
          setTimeout(() => {
            if (conversationModeRef.current && isActiveRef.current && !commandRecognitionActive.current) {
              try {
                console.log('🎤 Resuming command recognition after TTS');
                commandRecognitionActive.current = true;
                recognitionRef.current.start();
              } catch (e) {
                console.log('Failed to resume command recognition after TTS:', e.message);
                commandRecognitionActive.current = false;
              }
            }
          }, 200);
        }
      };

      utterance.onpause = () => { console.log('🎤 Speech paused'); };
      utterance.onresume = () => { console.log('🎤 Speech resumed'); };

      synthesisRef.current.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setError('Speech synthesis failed');
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      pendingCommandStartRef.current = null;
    }
  }, [isMuted]);

  // ── detectWakeWord ────────────────────────────────────────────────────────────
  const detectWakeWord = useCallback((text) => {
    const lowerText = text.toLowerCase().trim();
    if (
      lowerText.includes('welcome to financial advisor') ||
      lowerText.includes("i'll take you to") ||
      lowerText.includes("you're now on") ||
      lowerText.includes("i've opened") ||
      lowerText.includes("i'm your ai assistant")
    ) {
      return false;
    }
    if (WAKE_WORDS.some(p => p.test(lowerText))) return true;
    const partialPatterns = [
      /hello\s+financial/i, /hello\s+fin/i, /hi\s+financial/i, /hi\s+fin/i,
      /hey\s+financial/i, /hey\s+fin/i, /financial\s+advisor/i, /fin\s+advisor/i,
      /hello\s+financial\s+advisior/i, /hello\s+fin\s+advisior/i,
      /hi\s+financial\s+advisior/i, /hey\s+financial\s+advisior/i,
      /financial\s+advisior/i, /fin\s+advisior/i,
      /.*hello.*financial.*advisior.*/i, /.*hello.*financial.*advisor.*/i,
      /.*financial.*advisior.*/i, /.*financial.*advisor.*/i
    ];
    return partialPatterns.some(p => p.test(lowerText));
  }, [WAKE_WORDS]);

  // ── startWakeWordListening ────────────────────────────────────────────────────
  const startWakeWordListening = useCallback(() => {
    if (!isInitialized.current || !wakeWordRecognitionRef.current) return;
    if (isStartingWakeWord.current || wakeWordRecognitionActive.current) return;
    if (isActiveRef.current || isSpeakingRef.current || commandRecognitionActive.current || conversationModeRef.current) return;

    isStartingWakeWord.current = true;
    try {
      console.log('🎤 Starting wake word listening');
      wakeWordRecognitionRef.current.start();
      setIsWakeWordListening(true);
    } catch (error) {
      console.log('Wake word start error:', error.message);
      isStartingWakeWord.current = false;
      if (error.message && error.message.includes('already started')) {
        wakeWordRecognitionActive.current = true;
      }
    }
  }, []);

  // Keep stable refs in sync on every render
  startWakeWordListeningRef.current = startWakeWordListening;

  // ── handleWakeWordDetected ────────────────────────────────────────────────────
  const handleWakeWordDetected = useCallback(() => {
    if (isActiveRef.current || isSpeakingRef.current) {
      console.log('🎤 Already active/speaking, ignoring wake word');
      return;
    }
    console.log('🎤 Wake word detected! Starting voice assistant...');
    setWakeWordDetected(true);
    setIsActive(true);
    isActiveRef.current = true;
    dispatchVoiceStateChange(true);
    setError(null);
    setConversationMode(true);
    conversationModeRef.current = true;
    commandRecognitionActive.current = false;

    if (wakeWordRecognitionRef.current && wakeWordRecognitionActive.current) {
      try {
        console.log('🎤 Stopping wake word recognition');
        wakeWordRecognitionRef.current.stop();
      } catch (e) { console.log('Error stopping wake word:', e.message); }
    }
    setIsWakeWordListening(false);

    if (resetActivityTimerRef.current) {
      clearTimeout(resetActivityTimerRef.current);
      resetActivityTimerRef.current = null;
    }

    const returnToWakeWordMode = () => {
      setIsWakeWordListening(true);
      setWakeWordDetected(false);
      setIsActive(false);
      isActiveRef.current = false;
      dispatchVoiceStateChange(false);
      setConversationMode(false);
      conversationModeRef.current = false;
      console.log('🎤 Returning to wake word mode');
      startWakeWordListeningRef.current?.();
    };

    const startCommandRecognition = () => {
      if (!recognitionRef.current || !isActiveRef.current || !isInitialized.current) {
        returnToWakeWordMode();
        return;
      }
      if (commandRecognitionActive.current) return;
      try {
        console.log('🎤 Starting command recognition...');
        commandRecognitionActive.current = true;
        recognitionRef.current.start();
        console.log('🎤 Command listening started');
      } catch (e) {
        console.log('Error starting command recognition:', e.message);
        commandRecognitionActive.current = false;
        returnToWakeWordMode();
      }
    };

    // Welcome message — startCommandRecognition fires ONLY after TTS finishes
    setTimeout(() => {
      speakResponse("Welcome to the Financial Advisor Platform. How can I help you navigate the pages?", startCommandRecognition);
    }, 500);

    // 60-second inactivity fallback
    resetActivityTimerRef.current = setTimeout(() => {
      resetActivityTimerRef.current = null;
      if (!isListening && isActiveRef.current) returnToWakeWordMode();
    }, 60000);
  }, [speakResponse, isListening, dispatchVoiceStateChange]);

  // Keep ref in sync
  handleWakeWordDetectedRef.current = handleWakeWordDetected;

  // ── processVoiceCommand ───────────────────────────────────────────────────────
  const processVoiceCommand = useCallback(async (command) => {
    if (!command.trim()) return;
    console.log('🎤 Processing voice command:', command);
    setIsProcessing(true);
    setError(null);
    const startTime = Date.now();
    try {
      if (connectionStatus === 'offline') throw new Error('Offline mode');

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
      }, 10000);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setProcessingTime(Date.now() - startTime);
      console.log('🎤 LLM result:', data);
      await handleLLMResult(data);

      if (data.learned_alias) {
        const newAliases = { ...learnedAliases, [data.learned_alias]: data.target };
        setLearnedAliases(newAliases);
        localStorage.setItem('voiceNavigatorAliases', JSON.stringify(newAliases));
      }
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error processing command:', error);
      setProcessingTime(Date.now() - startTime);
      await processFallbackCommand(command);
      if (error.message.includes('timeout') || error.message.includes('network')) {
        setConnectionStatus('offline');
      } else {
        setConnectionStatus('error');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [conversationMode, location.pathname, uiContext, learnedAliases, connectionStatus]);

  const fetchWithTimeout = async (url, options, timeout) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw new Error('Request timeout');
      throw error;
    }
  };

  // ── initializeSpeechRecognition ───────────────────────────────────────────────
  const initializeSpeechRecognition = useCallback(() => {
    console.log('🎤 Initializing speech recognition...');
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      // Wake word recognition
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
        isStartingWakeWord.current = false;
        // Auto-restart only in true idle mode — read refs, never stale state
        if (
          !isActiveRef.current &&
          !conversationModeRef.current &&
          !isSpeakingRef.current &&
          !commandRecognitionActive.current
        ) {
          if (window.wakeWordRestartTimeout) clearTimeout(window.wakeWordRestartTimeout);
          window.wakeWordRestartTimeout = setTimeout(() => {
            window.wakeWordRestartTimeout = null;
            console.log('🎤 Auto-restarting wake word detection');
            startWakeWordListeningRef.current?.();
          }, 1000);
        }
      };

      wakeWordRecognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += t;
          else interimTranscript += t;
        }
        const textToCheck = finalTranscript || interimTranscript;
        // Use refs — not stale state — for both guards
        if (textToCheck && detectWakeWord(textToCheck) && !isSpeakingRef.current && !isActiveRef.current) {
          console.log('Wake word detected:', textToCheck);
          try { wakeWordRecognitionRef.current?.stop(); } catch (e) { /* ignore */ }
          handleWakeWordDetectedRef.current?.(); // always calls the latest version
        }
      };

      wakeWordRecognitionRef.current.onerror = (event) => {
        console.error('Wake word recognition error:', event.error);
        wakeWordRecognitionActive.current = false;
        isStartingWakeWord.current = false;
        if (event.error === 'aborted') {
          console.log('🎤 Wake word recognition aborted (normal)');
          return;
        }
        setTimeout(() => {
          console.log('🎤 Restarting wake word after error');
          startWakeWordListeningRef.current?.();
        }, 2000);
      };

      // Command recognition
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 3;

      recognitionRef.current.onstart = () => {
        console.log('Command recognition started');
        setIsListening(true);
        setError(null);
        commandRecognitionActive.current = true;
      };

      recognitionRef.current.onend = () => {
        console.log('Command recognition ended');
        setIsListening(false);
        commandRecognitionActive.current = false;

        if (conversationModeRef.current && isActiveRef.current) {
          console.log('🎤 Conversation mode active — restarting command recognition');
          setTimeout(() => {
            // Do not restart while TTS is playing
            if (
              conversationModeRef.current &&
              isActiveRef.current &&
              recognitionRef.current &&
              !commandRecognitionActive.current &&
              !isSpeakingRef.current
            ) {
              try {
                console.log('🎤 Restarting command recognition');
                commandRecognitionActive.current = true;
                recognitionRef.current.start();
              } catch (e) {
                console.log('Failed to restart command recognition:', e.message);
                commandRecognitionActive.current = false;
              }
            }
          }, 500);
        } else {
          // Return to wake-word mode
          setIsWakeWordListening(true);
          setWakeWordDetected(false);
          setIsActive(false);
          isActiveRef.current = false;
          dispatchVoiceStateChange(false);
          setConversationMode(false);
          conversationModeRef.current = false;
          console.log('🎤 Returning to wake word mode after command ended');
          setTimeout(() => { startWakeWordListeningRef.current?.(); }, 500);
        }
      };

      recognitionRef.current.onresult = (event) => {
        // ── Double post-TTS guard ──────────────────────────────────────────────
        // Layer 1: isSpeakingRef — true while TTS is actively playing
        // Layer 2: suppressUntilRef — 1.5 s timestamp window after TTS ends,
        //          discards buffered audio delivered by the browser after onend.
        if (isSpeakingRef.current || Date.now() < suppressUntilRef.current) return;

        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += t;
          else interimTranscript += t;
        }
        console.log('🎤 Command result:', { finalTranscript, interimTranscript });
        if (finalTranscript) {
          console.log('🎤 Final transcript:', finalTranscript);
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript);
        } else if (interimTranscript) {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Command recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'aborted') {
          console.log('🎤 Command recognition aborted (normal)');
          return;
        }
        switch (event.error) {
          case 'not-allowed': setError('Microphone access denied. Please allow microphone access.'); break;
          case 'no-speech': setError('No speech detected. Please try speaking again.'); break;
          case 'audio-capture': setError('Audio capture failed. Please check your microphone.'); break;
          default: setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onnomatch = () => { setError('No speech recognized. Please try again.'); };

      isInitialized.current = true;
      console.log('🎤 Speech recognition initialized');
    } else {
      setError('Speech recognition not supported in this browser.');
    }
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    } else {
      setError('Speech synthesis not supported in this browser.');
    }
  }, [detectWakeWord, processVoiceCommand, dispatchVoiceStateChange]);

  // ── handleLLMResult ───────────────────────────────────────────────────────────
  const handleLLMResult = useCallback(async (result) => {
    console.log('🎤 Handling LLM result:', result);
    switch (result.intent) {
      case "OPEN_PAGE":
        if (result.target) {
          console.log('🎤 Navigating to:', result.target);
          navigate(result.target); // silent — no speech
        }
        break;
      case "NEXT":
        if (uiContext.hasNext) speakResponse("Moving to the next step.");
        else speakResponse("There's no next step here.");
        break;
      case "BACK":
        if (uiContext.hasBack) { speakResponse("Going back."); navigate(-1); }
        else speakResponse("There's no previous page.");
        break;
      case "SCROLL_UP":
        window.scrollBy(0, -300);
        break;
      case "SCROLL_DOWN":
        window.scrollBy(0, 300);
        break;
      case "SEARCH":
        console.log('🎤 Search intent:', result.target);
        break;
      case "CLARIFY":
        speakResponse(result.reason || "Could you please clarify what you'd like to do?");
        break;
      default:
        speakResponse("I'm not sure how to handle that. Could you try a different command?");
    }
  }, [navigate, uiContext, speakResponse]);

  // ── processFallbackCommand ────────────────────────────────────────────────────
  const processFallbackCommand = async (command) => {
    const lowerCommand = command.toLowerCase().trim();
    console.log('🎤 Fallback command:', lowerCommand);

    // Learned aliases
    if (learnedAliases[lowerCommand]) {
      navigate(learnedAliases[lowerCommand]);
      return;
    }

    // Alias set matching — all silent navigation
    if (CALC_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, CALC_ALIASES)) { navigate(ROUTES.calculator); return; }
    if (EXPENSE_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, EXPENSE_ALIASES)) { navigate(ROUTES.expenses); return; }
    if (COMMUNITY_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, COMMUNITY_ALIASES)) { navigate(ROUTES.community); return; }
    if (NEWS_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, NEWS_ALIASES)) { navigate(ROUTES.news); return; }
    if (LEARN_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, LEARN_ALIASES)) { navigate(ROUTES.learn); return; }
    if (HOME_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, HOME_ALIASES)) { navigate(ROUTES.home); return; }
    if (DASHBOARD_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, DASHBOARD_ALIASES)) { navigate(ROUTES.dashboard); return; }
    if (PROFILE_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, PROFILE_ALIASES)) { navigate(ROUTES.profile); return; }
    if (LOGIN_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, LOGIN_ALIASES)) { navigate(ROUTES.login); return; }
    if (SIGNUP_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, SIGNUP_ALIASES)) { navigate(ROUTES.signup); return; }
    if (CHATBOT_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, CHATBOT_ALIASES)) { navigate(ROUTES.chatbot); return; }
    if (ADVISOR_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, ADVISOR_ALIASES)) { navigate(ROUTES.advisor); return; }
    if (SCAMS_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, SCAMS_ALIASES)) { navigate(ROUTES.scams); return; }
    if (MIP_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, MIP_ALIASES)) { navigate(ROUTES.mip); return; }
    if (POULTRY_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, POULTRY_ALIASES)) { navigate(ROUTES.poultry); return; }
    if (RURAL_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, RURAL_ALIASES)) { navigate(ROUTES.rural); return; }
    if (DAIRY_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, DAIRY_ALIASES)) { navigate(ROUTES.dairy); return; }
    if (SCHEME_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, SCHEME_ALIASES)) { navigate(ROUTES.scheme); return; }
    if (STORIES_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, STORIES_ALIASES)) { navigate(ROUTES.stories); return; }
    if (QNA_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, QNA_ALIASES)) { navigate(ROUTES.qna); return; }
    if (OCR_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, OCR_ALIASES)) { navigate(ROUTES.ocr); return; }
    if (ROAD_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, ROAD_ALIASES)) { navigate(ROUTES.road); return; }
    if (SHORTS_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, SHORTS_ALIASES)) { navigate(ROUTES.shorts); return; }
    if (MEETINGS_ALIASES.has(lowerCommand) || fuzzyMatch(lowerCommand, MEETINGS_ALIASES)) { navigate(ROUTES.meetings); return; }

    // System commands
    if (lowerCommand === 'next') {
      if (uiContext.hasNext) speakResponse("Moving to the next step.");
      else speakResponse("There's no next step here.");
      return;
    }
    if (lowerCommand === 'back') {
      if (uiContext.hasBack) { speakResponse("Going back."); navigate(-1); }
      else speakResponse("There's no previous page.");
      return;
    }

    speakResponse("I'm not sure what you mean. Try saying a page name like 'calculator', 'dashboard', or 'chatbot'.");
    setError('Command not recognized');
  };

  // Fuzzy matching (Levenshtein distance ≤ 2)
  const fuzzyMatch = (input, aliasSet) => {
    for (const alias of aliasSet) {
      if (levenshteinDistance(input, alias) <= 2) return true;
    }
    return false;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
    for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) matrix[i][j] = matrix[i-1][j-1];
        else matrix[i][j] = Math.min(matrix[i-1][j-1]+1, matrix[i][j-1]+1, matrix[i-1][j]+1);
      }
    }
    return matrix[str2.length][str1.length];
  };


  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      recognitionRef.current?.start();
    }
  }, [isListening]);

  const toggleMute = () => setIsMuted(!isMuted);

  // ── Effects ───────────────────────────────────────────────────────────────────

  // Mount: initialize speech recognition once
  useEffect(() => {
    if (isInitialized.current) return;
    console.log('🎤 Initializing speech recognition on mount...');
    initializeSpeechRecognition();
  }, []);

  // Page navigation: start wake-word listening (single effect, only pathname dep)
  useEffect(() => {
    console.log('🎤 Page change / mount detected:', location.pathname);
    const requestMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('🎤 Microphone permission granted');
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('🎤 Microphone permission denied:', error);
        setError('Microphone access denied. Please allow microphone access to use voice navigation.');
      }
    };
    requestMicrophonePermission();
    dispatchVoiceStateChange(false);
    const timer = setTimeout(() => {
      console.log('🎤 Starting wake word listening on page:', location.pathname);
      startWakeWordListeningRef.current?.();
    }, 600);
    return () => clearTimeout(timer);
  }, [location.pathname]); // ← ONLY pathname — never re-runs on state churn

  useEffect(() => { setConnectionStatus('connected'); }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (resetActivityTimerRef.current) clearTimeout(resetActivityTimerRef.current);
      if (window.wakeWordRestartTimeout) {
        clearTimeout(window.wakeWordRestartTimeout);
        window.wakeWordRestartTimeout = null;
      }
      try { synthesisRef.current?.cancel(); } catch (_) {}
      wakeWordRecognitionActive.current = false;
      isStartingWakeWord.current = false;
      try { wakeWordRecognitionRef.current?.stop(); } catch (_) {}
      commandRecognitionActive.current = false;
      try { recognitionRef.current?.stop(); } catch (_) {}
    };
  }, []);

  // ── UI helpers ────────────────────────────────────────────────────────────────
  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <SimpleIcons.CheckCircle className="w-3 h-3 text-green-500" />;
      case 'offline': return <SimpleIcons.AlertCircle className="w-3 h-3 text-yellow-500" />;
      case 'error': return <SimpleIcons.AlertCircle className="w-3 h-3 text-red-500" />;
      default: return <SimpleIcons.AlertCircle className="w-3 h-3 text-gray-500" />;
    }
  };
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'offline': return 'Offline';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  // ── JSX ───────────────────────────────────────────────────────────────────────
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
              // Manual stop
              setIsActive(false);
              isActiveRef.current = false;
              dispatchVoiceStateChange(false);
              setConversationMode(false);
              conversationModeRef.current = false;
              setIsWakeWordListening(true);
              if (resetActivityTimerRef.current) {
                clearTimeout(resetActivityTimerRef.current);
                resetActivityTimerRef.current = null;
              }
              if (recognitionRef.current && commandRecognitionActive.current) {
                try { recognitionRef.current.stop(); }
                catch (e) { console.log('Error stopping command recognition:', e.message); }
              }
              setTimeout(() => startWakeWordListeningRef.current?.(), 600);
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

      {/* Voice Assistant Panel */}
      {isActive && (
        <div
          className="fixed bottom-24 left-8 z-50 bg-white/95 rounded-2xl shadow-2xl border border-green-200 w-[85vw] max-w-sm h-[60vh] flex flex-col animate-fade-in"
          style={{ transform: `translate(${drag.x}px, ${drag.y}px)`, cursor: dragging ? "grabbing" : "grab" }}
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
                conversationModeRef.current = false;
                setIsWakeWordListening(true);
                if (recognitionRef.current && commandRecognitionActive.current) {
                  try { recognitionRef.current.stop(); }
                  catch (e) { console.log('Error stopping command recognition:', e.message); }
                }
              }}
            >
              <SimpleIcons.X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Connection:</span>
                <div className="flex items-center space-x-2">
                  {getConnectionStatusIcon()}
                  <span className="text-sm text-gray-700">{getConnectionStatusText()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Status:</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : isWakeWordListening ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-700">
                    {isListening ? 'Listening...' : isWakeWordListening ? 'Wake Word Active' : 'Ready'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Mode:</span>
                <span className="text-sm text-gray-700">{conversationMode ? 'Conversation' : 'Wake Word'}</span>
              </div>
              {processingTime > 0 && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Response Time:</span>
                  <span className="text-sm text-gray-700">{processingTime}ms</span>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 flex items-center">
                  <SimpleIcons.AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </p>
              </div>
            )}

            {transcript && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 flex items-center">
                  <span className="mr-2 text-blue-500">💬</span>
                  "{transcript}"
                </p>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <SimpleIcons.Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                <span className="text-sm text-yellow-700">Processing...</span>
              </div>
            )}

            <div className="flex space-x-2 mt-4">
              <button
                onClick={toggleListening}
                disabled={isProcessing}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50`}
              >
                {isListening ? 'Stop' : 'Start'}
              </button>
              <button
                onClick={toggleMute}
                className={`p-2 rounded-lg border transition-all duration-300 ${
                  isMuted ? 'bg-red-100 border-red-300 text-red-600' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <SimpleIcons.Volume2 className="w-4 h-4" />
              </button>
            </div>

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
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <SimpleIcons.X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-800 text-sm mb-2">Wake Word:</h4>
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
