const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../../models/User');

// Custom extractor that checks both cookies and Authorization header
const customExtractor = (req) => {
  // First, try to get token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Then, try to get token from cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
};

module.exports = (passport) => {
  passport.use(new JwtStrategy({
    jwtFromRequest: customExtractor,
    secretOrKey: process.env.JWT_SECRET
  }, async (payload, done) => {
    try {
      console.log('🔍 JWT Strategy - Payload:', payload);
      const user = await User.findById(payload.sub);
      if (user) {
        console.log('✅ JWT Strategy - User found:', user.email);
        return done(null, user);
      } else {
        console.log('❌ JWT Strategy - User not found');
        return done(null, false);
      }
    } catch (error) {
      console.error('❌ JWT Strategy - Error:', error);
      return done(error, false);
    }
  }));
};
