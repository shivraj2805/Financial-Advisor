# Authentication Setup Guide

This guide explains how to set up the new authentication system that replaces Clerk with Google OAuth and email/password authentication using Passport.js.

## Features

- ✅ Google OAuth 2.0 authentication
- ✅ Email/password authentication
- ✅ JWT token-based sessions
- ✅ Secure HTTP-only cookies
- ✅ User registration and login
- ✅ Protected routes
- ✅ Automatic token verification

## Prerequisites

1. Node.js (v14 or higher)
2. MongoDB database
3. Google OAuth 2.0 credentials

## Environment Variables

### Server (.env)

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/financial_advisor

# JWT Secret (generate a strong secret)
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Backend URL
BACKEND_URL=http://localhost:8080
```

### Client (.env)

Create a `.env` file in the `client` directory:

```env
# Backend URL
REACT_APP_BACKEND_URL=http://localhost:8080
```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 credentials
5. Set the authorized redirect URI to: `http://localhost:8080/api/auth/google/callback`
6. Copy the Client ID and Client Secret to your server `.env` file

## Installation

### Server Setup

```bash
cd server
npm install
```

### Client Setup

```bash
cd client
npm install
```

## Running the Application

### Start the Server

```bash
cd server
npm start
```

The server will run on `http://localhost:8080`

### Start the Client

```bash
cd client
npm start
```

The client will run on `http://localhost:3000`

## Authentication Flow

### Google OAuth Flow

1. User clicks "Sign in with Google"
2. User is redirected to Google OAuth
3. After successful authentication, Google redirects to `/api/auth/google/callback`
4. Server creates/updates user and sets JWT token in HTTP-only cookie
5. User is redirected to `/success-login` with access token
6. Client verifies token and logs user in
7. User is redirected to the main application

### Email/Password Flow

1. User enters email and password
2. Client sends POST request to `/api/auth/login`
3. Server validates credentials using Passport local strategy
4. Server generates JWT token and sets it in HTTP-only cookie
5. Client receives user data and logs user in
6. User is redirected to the main application

### Registration Flow

1. User fills out registration form
2. Client sends POST request to `/api/auth/register`
3. Server creates new user with hashed password
4. Server generates JWT token and sets it in HTTP-only cookie
5. Client receives user data and logs user in
6. User is redirected to the main application

## API Endpoints

### Authentication Routes

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `GET /api/auth/user` - Get current user (protected)
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify JWT token

## Security Features

- **HTTP-only Cookies**: JWT tokens are stored in secure HTTP-only cookies
- **Password Hashing**: Passwords are hashed using bcrypt
- **JWT Expiration**: Tokens expire after 7 days
- **CORS Protection**: Configured to allow only trusted origins
- **Input Validation**: Server-side validation for all inputs

## User Model

The User model supports both authentication methods:

```javascript
{
  name: String,
  email: String (unique),
  password: String (required only for email/password auth),
  googleId: String (unique, for Google OAuth),
  picture: String (profile picture URL),
  isEmailVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your frontend URL is in the allowed origins
2. **Google OAuth Errors**: Verify your Google OAuth credentials and redirect URI
3. **Database Connection**: Ensure MongoDB is running and accessible
4. **JWT Secret**: Use a strong, unique JWT secret

### Debug Mode

To enable debug logging, set `NODE_ENV=development` in your server `.env` file.

## Migration from Clerk

The following changes were made to migrate from Clerk:

1. **Removed Clerk dependencies** from client and server
2. **Added Passport.js** for authentication strategies
3. **Created custom User model** with support for both auth methods
4. **Implemented JWT-based sessions** with HTTP-only cookies
5. **Updated all authentication components** to use the new system
6. **Added Google OAuth integration** with proper callback handling

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use HTTPS URLs for Google OAuth redirect URIs
3. Set `secure: true` for cookies in production
4. Use environment-specific MongoDB connection strings
5. Configure proper CORS origins for your production domain

## Support

If you encounter any issues, check the console logs for both client and server, and ensure all environment variables are properly configured.
