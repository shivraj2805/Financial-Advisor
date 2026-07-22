# 🏗️ System Design — Financial Advisor Platform

> A comprehensive architectural overview of the full-stack MERN Financial Advisory application, including component design, data flow, API layers, and third-party integrations.

---

## 📐 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (React 18)                                  │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Landing /   │  │  Auth Pages    │  │ Feature Pages│  │   Components │  │
│  │  Hero Page   │  │  Login/Signup  │  │  (Protected) │  │  Voice/Chat  │  │
│  └──────────────┘  └────────────────┘  └──────────────┘  └──────────────┘  │
│        │                 │                   │                  │            │
│  ──────────────────── React Router DOM ─────────────────────────────────    │
│        │                 │                   │                  │            │
│  ──────────────── Axios HTTP Client + Socket.io ───────────────────────     │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │  HTTPS / WSS
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SERVER (Node.js + Express.js)                          │
│                                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│   │   Auth      │  │  Business   │  │  AI / OCR    │  │   Gamification  │  │
│   │  Middleware │  │   Routes    │  │   Routes     │  │     Routes      │  │
│   │  (JWT/OAuth)│  │  /api/...   │  │ /api/ocr/... │  │  /api/games/... │  │
│   └─────────────┘  └─────────────┘  └──────────────┘  └─────────────────┘  │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │             SOCKET.IO  (Real-time Community Chat)                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                   Mongoose ODM  (Data Layer)                        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │                      │                     │
   ┌──────────────┐   ┌──────────────────┐   ┌────────────────────┐
   │   MongoDB    │   │  Google Gemini   │   │  Google Cloud      │
   │   Atlas /    │   │  AI  API         │   │  Vision / Tesseract│
   │   Local      │   │  (NLP + OCR)     │   │  (OCR Fallback)    │
   └──────────────┘   └──────────────────┘   └────────────────────┘
```

---

## 🧩 2. Frontend Architecture

### 2.1 Technology Stack

| Layer           | Technology               | Purpose                          |
|-----------------|--------------------------|----------------------------------|
| Framework       | React 18                 | UI component model               |
| Routing         | React Router DOM v6      | Client-side navigation           |
| Styling         | Tailwind CSS + Framer Motion | Responsive design + animations |
| HTTP Client     | Axios                    | API communication                |
| Real-time       | Socket.io-client         | WebSocket for community chat     |
| State           | React Hooks (useState, useEffect, useContext) | Local + shared state |
| Voice           | Web Speech API           | Voice recognition & synthesis   |
| Notifications   | React Toastify           | User feedback toasts             |

### 2.2 Page & Route Map

```
/                          → LandingPage           (Public)
/login                     → LoginPage             (Public)
/register                  → RegistrationPage      (Public)
/success-login             → SuccessLogin          (Public)
/financialAdvisior         → FinancialAdvisor Hero (Protected)
/profile                   → Profile               (Protected)
/news                      → NewsPage              (Protected)
/learn                     → LearningCenter        (Protected)
/road                      → VerticalRoadmap       (Protected)
/shorts                    → YouTubeShorts          (Protected)
/scheme                    → GovernmentSchemes     (Protected)
/ppf                       → FinancialCalculators  (Public)
/mip                       → MicroinvestmentPlatform (Protected)
/poultry                   → PoultryFarmGuide      (Protected)
/rural                     → RuralBusiness         (Protected)
/business-guide/:type      → BusinessGuide         (Protected)
/community                 → DiscussionForums      (Protected)
/chatbot                   → Chatbot               (Public)
/dairy                     → DairyForumPage        (Public)
/stories                   → SuccessStories        (Public)
/qna                       → QASessions            (Protected)
/advisor                   → FinancialAdvisorChatbotUi (Protected)
/ocr                       → DocOCR                (Protected)
/expenses                  → ExpenseTracker        (Protected)
/scams                     → ScamsPage             (Protected)
/game                      → Game                  (Protected)
*                          → ErrorPage             (Fallback)
```

### 2.3 Key Client-side Components

```
src/
├── App.js                        ← Root router + global providers
├── LandingPage/                  ← Marketing landing page
├── Authorisation/                ← Auth form components
├── Pages/
│   ├── Login.js                  ← Email/Google login
│   ├── Signup.js                 ← Registration flow
│   ├── ExpenseTracker.js         ← Transaction management
│   ├── Game.js                   ← Financial gamification
│   ├── community.js              ← Forum + Socket.io chat
│   ├── docOCR.js                 ← Receipt / doc scanning
│   ├── financialAdvisiorChatBotUi.js ← AI Advisor UI
│   └── ...
├── components/
│   ├── VoiceNavigator.js         ← AI voice command handler
│   ├── VoiceNavigatorBanner.js   ← Voice status indicator
│   ├── UnifiedAssistant.js       ← Combined chatbot assistant
│   ├── protected-route.js        ← Route guard (JWT check)
│   ├── ErrorBoundary.js          ← React error boundary
│   └── ...
├── hooks/                        ← Custom React hooks
└── utils/                        ← Shared utility functions
```

---

## 🖥️ 3. Backend Architecture

### 3.1 Technology Stack

| Component        | Technology              | Purpose                                   |
|------------------|-------------------------|-------------------------------------------|
| Runtime          | Node.js                 | JavaScript server environment             |
| Framework        | Express.js              | HTTP routing & middleware                 |
| Auth             | Passport.js + JWT       | Google OAuth 2.0 + local auth             |
| Database ORM     | Mongoose                | MongoDB schema & queries                  |
| Real-time        | Socket.io               | Bidirectional WebSocket events            |
| File Uploads     | Multer                  | Multipart form data (receipt uploads)     |
| OCR Engine       | Tesseract.js            | Local optical character recognition       |
| AI Engine        | Google Gemini API       | NLP, document understanding, voice AI     |
| Cookies          | cookie-parser           | HTTP-only cookie handling                 |
| Cross-Origin     | cors                    | CORS configuration                        |

### 3.2 Middleware Pipeline

```
Request
  │
  ▼
[CORS Middleware] ──── Validates origin (localhost / *.vercel.app / *.onrender.com)
  │
  ▼
[Body Parser] ────────  JSON + URL-encoded body parsing
  │
  ▼
[Cookie Parser] ──────  Parse HTTP-only cookies
  │
  ▼
[Passport.js] ────────  Attach req.user if authenticated
  │
  ▼
[Route Handler]
  │
  ▼
[Auth Middleware] ─────  Verify JWT token for protected routes
  │
  ▼
[Controller Logic]
  │
  ▼
[Mongoose / External API]
  │
  ▼
Response
```

### 3.3 API Route Groups

| Route Prefix              | File                     | Responsibility                     |
|---------------------------|--------------------------|------------------------------------|
| `/api/auth`               | authRoutes.js            | Register, login, Google OAuth, logout |
| `/api/transactions`       | transactions.js          | CRUD for income/expense records     |
| `/api/games`              | games.js                 | Game data, progress, leaderboard    |
| `/api/enhanced-games`     | enhancedGames.js         | Advanced game features              |
| `/api/ocr`                | ocr.js                   | Document upload + AI extraction     |
| `/api/financial-advice`   | financialAdvice.js       | Gemini AI financial advice          |
| `/api/voice-navigation`   | voiceNavigation.js       | Voice command processing            |
| `/api/voice-analytics`    | voiceAnalytics.js        | Voice usage tracking                |
| `/api/communities`        | community.js             | Community forum CRUD + real-time    |
| `/api/meetings`           | meetings.js              | Expert meetings + Q&A sessions      |
| `/api/success-stories`    | successStories.js        | User success stories                |
| `/api/schemes`            | schemeRoutes.js          | Government scheme lookup (Gemini)   |
| `/api/business-types`     | businessTypes.js         | Business type information           |
| `/uploads`                | Static                   | Serve uploaded files                |

---

## 🔐 4. Authentication System

```
┌─────────────────────────────────────────────────┐
│              Authentication Flow                 │
│                                                  │
│  Local Auth:                                     │
│  Client ──POST /api/auth/register──► Server      │
│          ◄── JWT (HTTP-only cookie) ──           │
│                                                  │
│  Client ──POST /api/auth/login──► Server         │
│          ◄── JWT (HTTP-only cookie) ──           │
│                                                  │
│  Google OAuth 2.0:                               │
│  Client ──GET /api/auth/google──► Passport.js    │
│           ──► Google Consent Screen              │
│           ◄── Authorization Code                 │
│  Server  ──► Exchange for access token           │
│  Server  ──► Create/find User document           │
│           ◄── JWT (HTTP-only cookie) to Client   │
│                                                  │
│  Protected Route Validation:                     │
│  Client ──Request with JWT cookie──► Middleware  │
│           ──► Verify JWT signature               │
│           ──► Attach req.user                    │
│           ──► Controller proceeds                │
└─────────────────────────────────────────────────┘
```

### Security Mechanisms
- **bcrypt** (10 salt rounds) — password hashing
- **JWT** — stateless session tokens in HTTP-only cookies
- **Passport.js** — Google OAuth 2.0 strategy
- **CORS** — whitelisted origins only
- **Input Validation** — Mongoose schema validators
- **Password Reset** — Token + expiry flow via email

---

## 🤖 5. AI Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  AI Services Layer                       │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Google Gemini AI API                  │    │
│  │  • Natural Language Processing                  │    │
│  │  • Voice Command Interpretation                 │    │
│  │  • Government Scheme Recommendations            │    │
│  │  • Financial Document Analysis (OCR+AI)         │    │
│  │  • Financial Advice Generation                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────┐  ┌─────────────────────────┐  │
│  │   Tesseract.js OCR   │  │  Google Cloud Vision    │  │
│  │  • Local OCR Engine  │  │  • Advanced Image OCR   │  │
│  │  • Receipt Parsing   │  │  • Fallback Processing  │  │
│  │  • eng.traineddata   │  │  • PDF Handling         │  │
│  └──────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Voice Navigation Flow
```
User Speech
    │
    ▼
Web Speech API (Browser)
    │
    ▼
Wake Word Detection ("Hello Financial Advisor")
    │
    ▼
POST /api/voice-navigation/process
    │
    ▼
Google Gemini NLP → Parse Intent
    │
    ├──► Navigation Command → React Router push
    ├──► Financial Query   → Gemini Response
    └──► Fallback          → Local command map
    │
    ▼
Text-to-Speech (Web Speech API)
```

---

## 🎮 6. Gamification System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Game Engine                         │
│                                                      │
│  Game Types:                                         │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────┐  │
│  │ Quiz Game    │ │ Memory Game   │ │Budget Game │  │
│  │ (Knowledge)  │ │ (Memorization)│ │(Simulation)│  │
│  └──────────────┘ └───────────────┘ └────────────┘  │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────┐  │
│  │ Investment   │ │ Word Puzzle   │ │Money Bingo │  │
│  │ Simulator    │ │ (Vocabulary)  │ │(Terminology│  │
│  └──────────────┘ └───────────────┘ └────────────┘  │
│                                                      │
│  Progress Tracking:                                  │
│  Score → Points → Experience → Level → Achievements  │
│                                                      │
│  Multiplayer:                                        │
│  Socket.io rooms → Real-time scoring → Rank update  │
└─────────────────────────────────────────────────────┘
          │
          ▼
   MongoDB (GameProgress)
   ├─ userId + gameType (compound unique key)
   ├─ score, totalPoints, level, experience
   ├─ achievements[], rewards[]
   ├─ gameStats (totalGamesPlayed, bestScore, winStreak)
   ├─ multiplayerStats (gamesWon, rank)
   └─ learningProgress (certificates, skillsMastered)
```

---

## 💬 7. Real-time Communication (Socket.io)

```
Client A                  Socket.io Server               Client B
   │                            │                            │
   │──joinCommunity(id)────────►│                            │
   │                            │◄──joinCommunity(id)────────│
   │                            │  (both in same room)       │
   │                            │                            │
   │──sendMessage(data)────────►│                            │
   │                            │──newMessage(data)─────────►│
   │                            │                            │
```

Events:
- `joinCommunity` — User joins a community room by ID
- `sendMessage` — Broadcasts message to room participants
- `newMessage` — Received by all members in the room

---

## 📄 8. Document Processing (OCR) Pipeline

```
User Upload (PDF / Image)
        │
        ▼
  Multer Middleware
  (File saved to /uploads)
        │
        ▼
   ┌────────────────────────────────┐
   │  Primary: Google Gemini AI     │
   │  • Understands financial docs  │
   │  • Extracts: amount, merchant, │
   │    date, category, items       │
   └────────────────────────────────┘
        │ (if failed or low confidence)
        ▼
   ┌────────────────────────────────┐
   │  Fallback: Tesseract.js OCR    │
   │  • Reads raw text from image   │
   │  • eng.traineddata model       │
   └────────────────────────────────┘
        │
        ▼
  Structured Transaction Object
  ───► Auto-create Transaction in DB
  ───► Return to Client for review
```

Supported Formats: `JPEG`, `PNG`, `PDF`, `GIF`, `BMP`, `WEBP`

---

## 🏛️ 9. Government Schemes Module

```
User Request (age, income, location, occupation)
        │
        ▼
POST /api/schemes
        │
        ▼
Google Gemini API
(with user profile context)
        │
        ▼
parseGeminiResponse()
(title, description, eligibility, applicationLink)
        │
        ▼
Structured Schemes List → Client
```

---

## 🚀 10. Deployment Architecture

```
┌──────────────────────────────────────────────────┐
│              Production Environment              │
│                                                  │
│  ┌─────────────────┐    ┌────────────────────┐  │
│  │   Vercel CDN    │    │  Render / Railway  │  │
│  │  (React Build)  │    │  (Node.js Server)  │  │
│  │                 │    │                    │  │
│  │  finadvisior    │    │  financial-        │  │
│  │  .vercel.app    │    │  advisior.onrender │  │
│  └────────┬────────┘    └────────┬───────────┘  │
│           │    HTTPS API calls   │              │
│           └──────────────────────┘              │
│                       │                         │
│              ┌────────────────┐                 │
│              │ MongoDB Atlas  │                 │
│              │ (Cloud DB)     │                 │
│              └────────────────┘                 │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │              Docker Support              │   │
│  │  docker-compose.yml (production)         │   │
│  │  docker-compose.dev.yml (development)    │   │
│  │  ├── app container (Node.js)             │   │
│  │  ├── mongo container                     │   │
│  │  └── nginx reverse proxy                 │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## 📊 11. Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                       Complete Data Flow                         │
│                                                                  │
│  USER ACTION                                                     │
│     │                                                            │
│     ▼                                                            │
│  React Component (state update + API call via Axios)             │
│     │                                                            │
│     ▼                                                            │
│  Express Route → Auth Middleware → Controller                    │
│     │                                                            │
│     ├──── Mongoose CRUD ────► MongoDB Atlas                      │
│     ├──── Gemini API ────────► AI Processing                     │
│     ├──── Tesseract OCR ─────► Document Parsing                  │
│     └──── Socket.io ─────────► Real-time Broadcast              │
│     │                                                            │
│     ▼                                                            │
│  JSON Response → React State Update → UI Re-render              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 12. Key Design Decisions

| Decision                            | Rationale                                                      |
|-------------------------------------|----------------------------------------------------------------|
| **MongoDB (NoSQL)**                 | Flexible schema for evolving financial data structures          |
| **JWT in HTTP-only cookies**        | Prevents XSS attacks vs localStorage                           |
| **Google OAuth + Local Auth**       | Maximum user flexibility and accessibility                     |
| **Socket.io for community**         | Real-time chat without polling overhead                        |
| **Gemini AI as primary OCR**        | Better document understanding than pure OCR                    |
| **Tesseract as OCR fallback**       | Offline resilience when AI API is unavailable                  |
| **Compound index (userId+gameType)**| Enforces one progress record per user/game, fast lookups       |
| **Vercel + Render**                 | Free-tier friendly, zero-config deployments                    |
| **Voice Navigation**                | Accessibility for low-literacy / hands-free users              |
| **Gamification Layer**              | Increases engagement and financial literacy retention           |

---

*Last Updated: July 2026 | Version: 2.0.0*
