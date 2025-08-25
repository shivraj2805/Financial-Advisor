const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { trackAnalytics, trackUserSession, trackError } = require('./voiceAnalytics');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Enhanced intent processing with LLM
router.post('/process-intent', async (req, res) => {
  try {
    const { transcript, available_routes, ui_context, current_page, learned_aliases, conversation_mode } = req.body;

    console.log('🎤 Processing intent for:', transcript);
    console.log('🎤 Available routes:', available_routes);
    console.log('🎤 UI context:', ui_context);
    console.log('🎤 Learned aliases:', learned_aliases);

    // Enhanced system prompt for intent routing
    const systemPrompt = `You are a Voice Navigation Intent Router. Convert a user utterance into a JSON command for the UI. Be robust to typos (e.g., "claculator"), synonyms ("calci", "calc"), and short commands ("next", "back"). Use the provided available_routes and ui_context. If unsure, return a CLARIFY action. Output ONLY JSON.

Schema (strict):
{
  "intent": "OPEN_PAGE | NEXT | BACK | SCROLL_UP | SCROLL_DOWN | SEARCH | CLARIFY",
  "target": "string|null",
  "confidence": 0.0,
  "learned_alias": "string|null",
  "reason": "string"
}

Rules:
- Map calculator-like words → OPEN_PAGE with "target": "/ppf"
- "next", "go next", "continue" → NEXT (only if ui_context.hasNext is true; else CLARIFY)
- Use learned_alias to propose new synonyms the app can store (e.g., "calci" → "/ppf")
- If the transcript doesn't match any route/action with ≥0.6 confidence → CLARIFY
- Be case-insensitive, punctuation-agnostic, and tolerant to minor ASR errors

Available routes: ${JSON.stringify(available_routes)}
UI context: ${JSON.stringify(ui_context)}
Current page: ${current_page}
Learned aliases: ${JSON.stringify(learned_aliases)}

Examples:
- "open claculator" → {"intent": "OPEN_PAGE", "target": "/ppf", "confidence": 0.94, "learned_alias": "claculator", "reason": "Common misspelling of calculator."}
- "next" (when hasNext: false) → {"intent": "CLARIFY", "target": null, "confidence": 0.51, "learned_alias": null, "reason": "No next step available."}
- "calculator" → {"intent": "OPEN_PAGE", "target": "/ppf", "confidence": 0.95, "learned_alias": null, "reason": "Direct calculator request."}
- "dashboard" → {"intent": "OPEN_PAGE", "target": "/financialAdvisior", "confidence": 0.95, "learned_alias": null, "reason": "Direct dashboard request."}
- "dashbord" → {"intent": "OPEN_PAGE", "target": "/financialAdvisior", "confidence": 0.94, "learned_alias": "dashbord", "reason": "Common misspelling of dashboard."}
- "home" → {"intent": "OPEN_PAGE", "target": "/", "confidence": 0.95, "learned_alias": null, "reason": "Direct home page request."}
- "homepage" → {"intent": "OPEN_PAGE", "target": "/", "confidence": 0.95, "learned_alias": null, "reason": "Direct homepage request."}
- "profile" → {"intent": "OPEN_PAGE", "target": "/profile", "confidence": 0.95, "learned_alias": null, "reason": "Direct profile request."}
- "profil" → {"intent": "OPEN_PAGE", "target": "/profile", "confidence": 0.94, "learned_alias": "profil", "reason": "Common misspelling of profile."}
- "login" → {"intent": "OPEN_PAGE", "target": "/login", "confidence": 0.95, "learned_alias": null, "reason": "Direct login request."}
- "signup" → {"intent": "OPEN_PAGE", "target": "/register", "confidence": 0.95, "learned_alias": null, "reason": "Direct signup request."}
- "chatbot" → {"intent": "OPEN_PAGE", "target": "/chatbot", "confidence": 0.95, "learned_alias": null, "reason": "Direct chatbot request."}
- "advisor" → {"intent": "OPEN_PAGE", "target": "/advisor", "confidence": 0.95, "learned_alias": null, "reason": "Direct financial advisor request."}
- "advisior" → {"intent": "OPEN_PAGE", "target": "/advisor", "confidence": 0.94, "learned_alias": "advisior", "reason": "Common misspelling of advisor."}
- "scams" → {"intent": "OPEN_PAGE", "target": "/scams", "confidence": 0.95, "learned_alias": null, "reason": "Direct scam awareness request."}
- "mip" → {"intent": "OPEN_PAGE", "target": "/mip", "confidence": 0.95, "learned_alias": null, "reason": "Direct microinvestment platform request."}
- "poultry" → {"intent": "OPEN_PAGE", "target": "/poultry", "confidence": 0.95, "learned_alias": null, "reason": "Direct poultry farming request."}
- "poulty" → {"intent": "OPEN_PAGE", "target": "/poultry", "confidence": 0.94, "learned_alias": "poulty", "reason": "Common misspelling of poultry."}
- "rural" → {"intent": "OPEN_PAGE", "target": "/rural", "confidence": 0.95, "learned_alias": null, "reason": "Direct rural business request."}
- "dairy" → {"intent": "OPEN_PAGE", "target": "/dairy", "confidence": 0.95, "learned_alias": null, "reason": "Direct dairy farming request."}
- "scheme" → {"intent": "OPEN_PAGE", "target": "/scheme", "confidence": 0.95, "learned_alias": null, "reason": "Direct government schemes request."}
- "stories" → {"intent": "OPEN_PAGE", "target": "/stories", "confidence": 0.95, "learned_alias": null, "reason": "Direct success stories request."}
- "qna" → {"intent": "OPEN_PAGE", "target": "/qna", "confidence": 0.95, "learned_alias": null, "reason": "Direct Q&A request."}
- "ocr" → {"intent": "OPEN_PAGE", "target": "/ocr", "confidence": 0.95, "learned_alias": null, "reason": "Direct document OCR request."}
- "road" → {"intent": "OPEN_PAGE", "target": "/road", "confidence": 0.95, "learned_alias": null, "reason": "Direct roadmap request."}
- "shorts" → {"intent": "OPEN_PAGE", "target": "/shorts", "confidence": 0.95, "learned_alias": null, "reason": "Direct video shorts request."}
- "meetings" → {"intent": "OPEN_PAGE", "target": "/meetings", "confidence": 0.95, "learned_alias": null, "reason": "Direct meeting scheduling request."}
- "expenses" → {"intent": "OPEN_PAGE", "target": "/expenses", "confidence": 0.95, "learned_alias": null, "reason": "Direct expense tracker request."}
- "community" → {"intent": "OPEN_PAGE", "target": "/community", "confidence": 0.95, "learned_alias": null, "reason": "Direct community request."}
- "news" → {"intent": "OPEN_PAGE", "target": "/news", "confidence": 0.95, "learned_alias": null, "reason": "Direct news request."}
- "learn" → {"intent": "OPEN_PAGE", "target": "/learn", "confidence": 0.95, "learned_alias": null, "reason": "Direct learning request."}
- "back" → {"intent": "BACK", "target": null, "confidence": 0.95, "learned_alias": null, "reason": "Navigation back request."}
- "scroll up" → {"intent": "SCROLL_UP", "target": null, "confidence": 0.95, "learned_alias": null, "reason": "Scroll up request."}
- "scroll down" → {"intent": "SCROLL_DOWN", "target": null, "confidence": 0.95, "learned_alias": null, "reason": "Scroll down request."}

User transcript: "${transcript}"`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('🎤 LLM raw response:', text);
    
    // Parse JSON response
    let intentResult;
    try {
      // Extract JSON from response (handle any extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        intentResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('🎤 JSON parse error:', parseError);
      // Fallback to local processing
      intentResult = processLocalIntent(transcript, available_routes, ui_context, learned_aliases);
    }

    console.log('🎤 Final intent result:', intentResult);
    res.json(intentResult);

  } catch (error) {
    console.error('🎤 Intent processing error:', error);
    
    // Fallback to local processing
    const fallbackResult = processLocalIntent(
      req.body.transcript, 
      req.body.available_routes, 
      req.body.ui_context, 
      req.body.learned_aliases
    );
    
    res.json(fallbackResult);
  }
});

// Local intent processing fallback
function processLocalIntent(transcript, available_routes, ui_context, learned_aliases) {
  const lowerTranscript = transcript.toLowerCase().trim();
  
  console.log('🎤 Local intent processing for:', lowerTranscript);
  
  // Check learned aliases first
  if (learned_aliases && learned_aliases[lowerTranscript]) {
    return {
      intent: "OPEN_PAGE",
      target: learned_aliases[lowerTranscript],
      confidence: 0.95,
      learned_alias: null,
      reason: "Matched learned alias"
    };
  }
  
  // Calculator aliases
  const calcAliases = ["calculator", "calc", "calci", "claculator", "calcultor", "calcutator", "calcu", "cal", "calculater", "calclator", "calcultr", "calcutr"];
  if (calcAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/ppf",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Calculator request detected"
    };
  }
  
  // Expense aliases
  const expenseAliases = ["expenses", "expense", "tracker", "budget", "spending", "money", "costs"];
  if (expenseAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/expenses",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Expense tracker request detected"
    };
  }
  
  // Community aliases
  const communityAliases = ["community", "forum", "discussion", "chat", "talk", "people", "users"];
  if (communityAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/community",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Community request detected"
    };
  }
  
  // News aliases
  const newsAliases = ["news", "updates", "latest", "information", "articles", "blog"];
  if (newsAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/news",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "News request detected"
    };
  }
  
  // Learn aliases
  const learnAliases = ["learn", "learning", "education", "guide", "tutorial", "help", "resources"];
  if (learnAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/learn",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Learning request detected"
    };
  }
  
  // Dashboard aliases
  const dashboardAliases = ["dashboard", "my dashboard", "user dashboard", "main dashboard", "control panel", "dash board", "dashbord", "dashbord", "dash", "board"];
  if (dashboardAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/financialAdvisior",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Dashboard request detected"
    };
  }
  
  // Home/Homepage aliases
  const homeAliases = ["home", "homepage", "main page", "main", "landing", "landing page", "start", "start page", "welcome", "welcome page"];
  if (homeAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Home page request detected"
    };
  }
  
  // Profile aliases
  const profileAliases = ["profile", "my profile", "user profile", "account", "my account", "settings", "user settings", "profil", "proflie", "acount"];
  if (profileAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/profile",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Profile request detected"
    };
  }
  
  // Login aliases
  const loginAliases = ["login", "sign in", "log in", "signin", "login page", "authentication", "auth", "loggin", "sigin"];
  if (loginAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/login",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Login request detected"
    };
  }
  
  // Signup/Register aliases
  const signupAliases = ["signup", "sign up", "register", "registration", "create account", "new account", "sign up page", "register page", "signup page", "signnup", "regster"];
  if (signupAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/register",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Signup request detected"
    };
  }
  
  // Chatbot aliases
  const chatbotAliases = ["chatbot", "chat bot", "ai chat", "ai assistant", "chat assistant", "bot", "ai", "chat", "chat with ai", "chatbot page", "chat bot page", "chatbot", "chatbot"];
  if (chatbotAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/chatbot",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Chatbot request detected"
    };
  }
  
  // Advisor aliases
  const advisorAliases = ["advisor", "financial advisor", "adviser", "financial adviser", "consultant", "financial consultant", "advice", "financial advice", "advisr", "advisior", "finacial advisor"];
  if (advisorAliases.some(alias => lowerTranscript.includes(alias))) {
      return {
      intent: "OPEN_PAGE",
      target: "/advisor",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Financial advisor request detected"
    };
  }
  
  // Scams aliases
  const scamsAliases = ["scams", "scam", "fraud", "fraudulent", "security", "scam awareness", "fraud awareness", "scam info", "fraud info", "scam page", "scams page", "scam", "scam"];
  if (scamsAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/scams",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Scam awareness request detected"
    };
  }
  
  // MIP (Microinvestment Platform) aliases
  const mipAliases = ["mip", "microinvestment", "micro investment", "investment platform", "micro investment platform", "invest", "investment", "micro invest", "mip platform", "mip", "mip"];
  if (mipAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/mip",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Microinvestment platform request detected"
    };
  }
  
  // Poultry aliases
  const poultryAliases = ["poultry", "chicken", "chicken farm", "poultry farm", "poultry farming", "chicken farming", "farm", "farming", "poultry guide", "chicken guide", "poulty", "poulty", "chiken"];
  if (poultryAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/poultry",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Poultry farming request detected"
    };
  }
  
  // Rural business aliases
  const ruralAliases = ["rural", "rural business", "business opportunities", "business opportunity", "rural opportunities", "business guide", "business", "opportunities", "rural guide", "rural", "rural"];
  if (ruralAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/rural",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Rural business opportunities request detected"
    };
  }
  
  // Dairy aliases
  const dairyAliases = ["dairy", "dairy farm", "dairy farming", "milk", "milk farm", "dairy forum", "dairy community", "dairy discussion", "dairy", "dairy"];
  if (dairyAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/dairy",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Dairy farming request detected"
    };
  }
  
  // Government schemes aliases
  const schemeAliases = ["scheme", "government scheme", "government schemes", "govt scheme", "govt schemes", "schemes", "government program", "government programs", "program", "programs", "scheme", "scheme"];
  if (schemeAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/scheme",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Government schemes request detected"
    };
  }
  
  // Success stories aliases
  const storiesAliases = ["stories", "success stories", "success story", "story", "success", "achievements", "achievement", "success case", "success cases", "stories", "stories"];
  if (storiesAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/stories",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Success stories request detected"
    };
  }
  
  // Q&A aliases
  const qnaAliases = ["qna", "q&a", "questions", "question", "answers", "answer", "faq", "frequently asked questions", "ask questions", "qa", "q and a", "qna", "qna"];
  if (qnaAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/qna",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Q&A sessions request detected"
    };
  }
  
  // OCR aliases
  const ocrAliases = ["ocr", "document", "scan document", "document scan", "document scanner", "scan", "scanner", "document processing", "ocr page", "document page", "ocr", "ocr"];
  if (ocrAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/ocr",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Document OCR request detected"
    };
  }
  
  // Roadmap aliases
  const roadAliases = ["road", "roadmap", "planning", "plan", "strategy", "road map", "planning guide", "strategy guide", "road", "road"];
  if (roadAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/road",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Roadmap/planning request detected"
    };
  }
  
  // Shorts/Videos aliases
  const shortsAliases = ["shorts", "video", "videos", "youtube shorts", "short videos", "video shorts", "youtube", "video content", "shorts", "shorts"];
  if (shortsAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/shorts",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Video shorts request detected"
    };
  }
  
  // Meetings aliases
  const meetingsAliases = ["meetings", "meeting", "schedule meeting", "appointment", "book meeting", "schedule appointment", "meeting schedule", "appointment schedule", "meetings", "meetings"];
  if (meetingsAliases.some(alias => lowerTranscript.includes(alias))) {
    return {
      intent: "OPEN_PAGE",
      target: "/meetings",
      confidence: 0.94,
      learned_alias: lowerTranscript,
      reason: "Meeting scheduling request detected"
    };
  }
  
  // Navigation commands
  if (lowerTranscript === "next") {
    if (ui_context && ui_context.hasNext) {
      return {
        intent: "NEXT",
        target: null,
        confidence: 0.95,
        learned_alias: null,
        reason: "Next step navigation"
      };
    } else {
      return {
        intent: "CLARIFY",
        target: null,
        confidence: 0.51,
        learned_alias: null,
        reason: "No next step available"
      };
    }
  }
  
  if (lowerTranscript === "back") {
    if (ui_context && ui_context.hasBack) {
      return {
        intent: "BACK",
        target: null,
        confidence: 0.95,
        learned_alias: null,
        reason: "Back navigation"
      };
    } else {
      return {
        intent: "CLARIFY",
        target: null,
        confidence: 0.51,
        learned_alias: null,
        reason: "No previous page available"
      };
    }
  }
  
  // Scroll commands
  if (lowerTranscript.includes("scroll up")) {
    return {
      intent: "SCROLL_UP",
      target: null,
      confidence: 0.95,
      learned_alias: null,
      reason: "Scroll up request"
    };
  }
  
  if (lowerTranscript.includes("scroll down")) {
    return {
      intent: "SCROLL_DOWN",
      target: null,
      confidence: 0.95,
      learned_alias: null,
      reason: "Scroll down request"
    };
  }
  
  // Default clarification
  return {
    intent: "CLARIFY",
    target: null,
    confidence: 0.3,
    learned_alias: null,
    reason: "Unclear command. Try saying 'calculator', 'dashboard', 'home', 'profile', 'login', 'signup', 'chatbot', 'advisor', 'scams', 'mip', 'poultry', 'rural', 'dairy', 'scheme', 'stories', 'qna', 'ocr', 'road', 'shorts', 'meetings', 'expenses', 'community', 'news', 'learn', 'next', or 'back'"
  };
}

// Original voice navigation endpoint (kept for backward compatibility)
router.post('/process', async (req, res) => {
  try {
    const { command, currentPage, websiteStructure, conversationMode, userId } = req.body;

    console.log('🎤 Processing voice command:', command);
    console.log('🎤 Current page:', currentPage);
    console.log('🎤 Conversation mode:', conversationMode);

    const prompt = `You are a voice navigation assistant for a financial advisor website. The user said: "${command}"

Current page: ${currentPage}
Website structure: ${JSON.stringify(websiteStructure)}
Conversation mode: ${conversationMode}

Available pages and actions:
- Home page (/)
- PPF Calculator (/ppf) - for calculations and investments
- Expense Tracker (/expenses) - for tracking spending
- Community (/community) - for discussions
- News (/news) - for financial news
- Learning Resources (/learn) - for education
- AI Chatbot (/chatbot) - for advice
- Scams Info (/scams) - for scam awareness
- Profile (/profile) - user settings
- Login (/login) - user authentication
- Signup (/signup) - user registration

Actions:
- Navigate to pages
- Open calculator
- Track expenses
- Get advice
- Schedule meetings
- Check balance
- Investment guidance
- Money saving tips

Respond with JSON in this format:
{
  "response": "spoken response to user",
  "action": {
    "type": "navigate|action|greeting|help|clarification",
    "path": "/page-path" (for navigation),
    "action": "action-name" (for other actions)
  },
  "conversationMode": true/false,
  "suggestions": ["suggestion1", "suggestion2"]
}

Be helpful, concise, and natural in your responses.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('🎤 AI Response:', text);
    
    // Parse JSON response
    let data;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('🎤 JSON parse error:', parseError);
      data = {
        response: "I'm sorry, I didn't understand that. Could you please try again?",
        action: { type: "clarification" },
        conversationMode: conversationMode,
        suggestions: ["Try saying 'calculator', 'expenses', 'community', or 'help'"]
      };
    }

    res.json(data);

  } catch (error) {
    console.error('🎤 Voice navigation error:', error);
    res.status(500).json({
      response: "I'm having trouble processing your request. Please try again.",
      action: { type: "error" },
      conversationMode: false,
      suggestions: ["Check your connection and try again"]
    });
  }
});

module.exports = router;
