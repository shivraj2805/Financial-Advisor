# 🌱 AgriAI (KrushiSetu) - Comprehensive Smart Agricultural Platform

**AgriAI (KrushiSetu)** is a comprehensive smart agricultural platform that provides AI-powered crop recommendations, disease detection, equipment sharing, community features, and advanced farm management tools for modern farmers.

## 🎯 Key Features

### 🌾 Chatbot Integration for Farmers
- Our platform comes with a powerful AI-driven chatbot, specially designed to assist farmers with their everyday queries. The chatbot has been trained on 175,000+ real agricultural queries, ensuring it understands a wide range of farming-related concerns.
-It is powered by the MiniLM-L6-v2 model, which provides fast, lightweight, and highly accurate answers. If the farmer is not fully satisfied with the chatbot’s initial response, we’ve integrated the NVIDIA API to deliver broader, more detailed, and in-depth answers — ensuring farmers always receive the guidance they need.

### 🤖 AI-Powered Features
- **Plant Disease Detection**: CNN-based disease identification using TensorFlow/Keras
- **Crop Recommendation**: ML-based crop suggestions using scikit-learn
- **Crop Yield Prediction**: Statistical yield forecasting with weather integration
- **Smart Health Diagnostics**: AI-powered plant health analysis
- **Gemini AI Assistant**: Advanced farming chatbot with multi-language support

### 👥 Community & Collaboration
- **Farmer Communities**: Real-time chat with Socket.io integration
- **Expert Consultation**: Video call booking system with agricultural specialists
- **Enhanced Community Features**: Creator permissions, join requests, member management
- **Real-time Messaging**: Live chat with room-based messaging

### 🛠️ Equipment & Resource Management
- **Equipment Sharing**: Rental marketplace for agricultural equipment
- **Equipment Booking**: Advanced booking system with availability tracking
- **Resource Optimization**: Smart resource allocation and management

### 📊 Analytics & Tracking
- **Farmer Analytics**: Comprehensive agricultural data analysis and insights
- **Expense Tracker**: Financial management with detailed analytics
- **Performance Tracking**: Farm performance metrics and optimization
- **Government Schemes**: Subsidy tracking and benefit management

### 📅 Farm Management
- **Agricultural Calendar**: Complete farm activity planning and tracking
- **Team Management**: Multi-user access with role-based permissions
- **Notification System**: Smart reminders and weather-dependent alerts
- **Field Management**: Geographic field tracking with soil data

### 🌦️ Weather & Environmental
- **Weather Intelligence**: Real-time weather forecasts and climate-smart advice
- **Environmental Integration**: Weather-dependent task scheduling
- **Climate Data**: Historical and predictive climate information

## 📁 Project Structure

```
AgriAI/
├── client/                    # React Frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Route pages (60+ pages)
│   │   ├── Authorisation/   # Auth context & providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
├── server/                   # Express.js Backend
│   ├── controllers/            # Route handlers (15+ controllers)
│   ├── models/           # MongoDB schemas (15+ models)
│   ├── routes/           # API endpoints (15+ route files)
│   ├── middlewares/      # Auth & validation
│   └── config/           # Database & passport config
├── python_server/           # Unified Python AI Services
│   ├── app.py            # Main Flask application
│   ├── services/         # AI service modules
│   ├── models/          # ML model files
│   └── data/            # Training data
└── Documentation/          # Comprehensive documentation
    ├── PROJECT_ARCHITECTURE.md
    ├── COMPLETE_PROJECT_FLOW.md
    ├── COMMUNITY_FEATURES.md
    ├── AGRICULTURAL_CALENDAR_SYSTEM.md
    └── AI_FARMING_ASSISTANT_README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 19** with Vite build system
- **TailwindCSS** for modern styling
- **React Router** for navigation
- **Socket.io-client** for real-time features
- **Axios** for API communication
- **Context API** for state management

### Backend
- **Express.js** server with middleware
- **MongoDB** with Mongoose ODM
- **Passport.js** for authentication
- **JWT** for token management
- **Socket.io** for real-time communication
- **Multer** for file uploads

### AI/ML Services
- **Python Flask** unified server
- **TensorFlow/Keras** for CNN models
- **scikit-learn** for ML algorithms
- **Pickle** for model serialization
- **ResNet** architecture for plant disease detection

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **MongoDB** (4.4 or higher)
- **npm** or **yarn**
- **pip** (Python package installer)

## 🚀 Setup Instructions

### 1. Backend Setup (Express.js)

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Configure environment variables
# PORT=8000
# NODE_ENV=development
# MONGO_URI=mongodb://localhost:27017/agriai
# JWT_SECRET=your-jwt-secret
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Start development server
npm run dev
```

**Backend runs on:** `http://localhost:8000`

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create environment file
# VITE_BACKEND_URL=http://localhost:8000

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

### 3. Python AI Services Setup

```bash
# Navigate to python_server directory
cd python_server

# Run setup script to copy models and data
python setup.py

# Install Python dependencies
pip install -r requirements.txt

# Start unified AI server
python app.py
```

**Python AI Services run on:** `http://localhost:5000`

### 4. Database Setup (MongoDB)

```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community

# Start MongoDB service
sudo systemctl start mongodb
# or
brew services start mongodb
```

## 🔌 API Endpoints

### Authentication Endpoints
```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
GET  /api/auth/google            # Google OAuth
GET  /api/auth/google/callback   # OAuth callback
GET  /api/auth/user              # Get current user
GET  /api/auth/verify            # Verify token
POST /api/auth/logout            # User logout
```

### AI/ML Feature Endpoints
```
# Plant Disease Detection
POST /api/plant-disease/upload   # Upload image for analysis
GET  /api/plant-disease/history   # Get analysis history

# Crop Recommendation
POST /api/crop-recommendation    # Get crop suggestions
GET  /api/crop-recommendation/history

# Crop Yield Prediction
POST /api/crop-yield/predict     # Predict crop yield
GET  /api/crop-yield/crops       # Get supported crops
GET  /api/crop-yield/regions     # Get supported regions

# AI Assistant
POST /api/ai/chat                # Chat with AI assistant
GET  /api/ai/health             # AI service health check
```

### Community & Social Features
```
# Farmer Communities
GET  /api/communities            # List communities
POST /api/communities            # Create community
PUT  /api/communities/:id        # Update community (creator only)
DELETE /api/communities/:id      # Delete community (creator only)
POST /api/communities/:id/join-request  # Request to join
POST /api/communities/:id/leave  # Leave community
GET  /api/communities/:id/messages # Get messages (members only)
POST /api/communities/:id/messages # Send message (members only)

# Expert Consultation
GET  /api/experts                # List experts
POST /api/experts/consultation   # Book consultation
GET  /api/experts/:id/availability # Check expert availability
```

### Equipment & Resource Management
```
# Equipment Sharing
GET  /api/equipment              # List equipment
POST /api/equipment              # Add equipment
PUT  /api/equipment/:id          # Update equipment
DELETE /api/equipment/:id        # Delete equipment
POST /api/equipment-bookings     # Book equipment
GET  /api/equipment-bookings     # Get bookings
PUT  /api/equipment-bookings/:id # Update booking
```

### Analytics & Tracking
```
# Farmer Analytics
GET  /api/farmer-analytics       # Get analytics data
POST /api/farmer-analytics       # Add analytics data
GET  /api/farmer-analytics/dashboard # Analytics dashboard

# Expense Tracker
GET  /api/transactions           # Get transactions
POST /api/transactions           # Add transaction
PUT  /api/transactions/:id       # Update transaction
DELETE /api/transactions/:id     # Delete transaction

# Government Schemes
GET  /api/schemes                # List government schemes
POST /api/schemes/apply          # Apply for scheme
GET  /api/schemes/my-applications # Get user applications
```

### Calendar & Farm Management
```
# Agricultural Calendar
GET  /api/calendar/events        # Get calendar events
POST /api/calendar/events        # Create event
PUT  /api/calendar/events/:id    # Update event
DELETE /api/calendar/events/:id  # Delete event
POST /api/calendar/events/:id/complete # Mark as completed
GET  /api/calendar/stats         # Get calendar statistics

# Team Management
GET  /api/teams                  # Get user teams
POST /api/teams                  # Create team
PUT  /api/teams/:id              # Update team
DELETE /api/teams/:id            # Delete team
POST /api/teams/:id/members      # Add team member
```

### Notifications
```
# Notification System
GET  /api/notifications          # Get notifications
POST /api/notifications          # Create notification
POST /api/notifications/:id/read # Mark as read
GET  /api/notifications/templates # Get templates
POST /api/notifications/weather  # Weather-dependent notifications
```

## 🚀 Deployment Guide

### Production Environment Setup

#### Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agriai
JWT_SECRET=your-production-secret-key
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env)**
```env
VITE_BACKEND_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

**Python Server (.env)**
```env
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
```

### Deployment Platforms

#### Frontend Deployment
- **Vercel**: `vercel --prod`
- **Netlify**: Connect GitHub repository
- **AWS S3 + CloudFront**: Static website hosting

#### Backend Deployment
- **Railway**: Connect GitHub repository
- **Heroku**: `git push heroku main`
- **AWS EC2**: Manual server setup
- **DigitalOcean**: Droplet deployment

#### Database Deployment
- **MongoDB Atlas**: Cloud database service
- **AWS DocumentDB**: MongoDB-compatible service
- **Self-hosted**: VPS with MongoDB

#### Python AI Services
- **AWS Lambda**: Serverless functions
- **Google Cloud Functions**: Serverless deployment
- **Railway**: Container deployment
- **Heroku**: Python app deployment

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Secure authentication**
- **Password Hashing**: bcrypt with 12 salt rounds
- **HTTP-only Cookies**: XSS protection
- **CORS Configuration**: Proper cross-origin handling

### Data Protection
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Mongoose ODM protection
- **File Upload Security**: Multer with type and size validation
- **Environment Variables**: Secure configuration management

### API Security
- **Rate Limiting**: Prevent API abuse
- **Request Validation**: Input sanitization
- **Error Handling**: Secure error messages
- **HTTPS**: SSL/TLS encryption in production

## 📊 Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Browser caching for static assets
- **Bundle Optimization**: Tree shaking and minification

### Backend Optimizations
- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Redis for session management
- **Compression**: Gzip compression for responses
- **Connection Pooling**: Efficient database connections

### AI/ML Optimizations
- **Model Optimization**: Quantized models for faster inference
- **Batch Processing**: Efficient image processing
- **Caching**: Model result caching
- **Async Processing**: Non-blocking AI operations

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

### Python Services Testing
```bash
cd python_server
python -m pytest
```

### Integration Testing
```bash
# Test all services
npm run test:integration
```

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues
- **Port conflicts**: Ensure ports 8000, 5000 are available
- **MongoDB connection**: Check connection string and credentials
- **JWT errors**: Verify JWT_SECRET is set
- **CORS errors**: Check CORS configuration

#### Frontend Issues
- **Build errors**: Check Node.js version compatibility
- **API connection**: Verify backend URL configuration
- **Authentication**: Check token storage and validation
- **Real-time features**: Verify Socket.io connection

#### Python Services Issues
- **Model loading**: Ensure model files are present
- **Memory issues**: Increase server memory for CNN models
- **Dependencies**: Check Python version and package compatibility
- **API connectivity**: Verify service endpoints

### Performance Issues
- **Slow AI predictions**: Consider model optimization
- **Database queries**: Check indexing and query optimization
- **Real-time features**: Monitor Socket.io connection limits
- **File uploads**: Implement proper file size limits

## 📈 Monitoring & Analytics

### Application Monitoring
- **Health Checks**: Automated service monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time monitoring
- **User Analytics**: Usage pattern analysis

### Database Monitoring
- **Query Performance**: Slow query identification
- **Connection Pooling**: Database connection monitoring
- **Storage Usage**: Database size tracking
- **Backup Status**: Automated backup verification

## 🔮 Future Enhancements

### Planned Features
1. **Mobile App**: React Native implementation
2. **IoT Integration**: Sensor data collection
3. **Blockchain**: Supply chain tracking
4. **Advanced AI**: More sophisticated ML models
5. **Multi-language**: Internationalization support
6. **Voice Commands**: Voice-controlled interface
7. **AR Features**: Augmented reality for field analysis

### Scalability Improvements
1. **Microservices**: Service-oriented architecture
2. **Load Balancing**: Multiple server instances
3. **CDN**: Content delivery network
4. **Database Sharding**: Horizontal scaling
5. **Caching Layer**: Redis/Memcached implementation

## 📞 Support & Contributing

### Getting Help
- **Documentation**: Check comprehensive documentation files
- **Issues**: Create GitHub issues for bugs and feature requests
- **Community**: Join our developer community
- **Email**: Contact the development team

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🌱 AgriAI (KrushiSetu) - Empowering farmers with AI-driven agricultural solutions for the digital age! 🚀**
