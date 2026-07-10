/**
 * Passport configuration for authentication strategies
 * Handles Google OAuth and local authentication
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

/**
 * Setup passport strategies
 * @param {*} db - Database instance
 * @returns {*} Configured passport instance
 */
function setupPassport(db) {
  // Import services here to avoid circular dependencies
  const AuthService = require('../services/authService');
  const AuthRepository = require('../repositories/authRepository');

  // Initialize repository and service
  const authRepository = new AuthRepository(db);
  const authService = new AuthService(authRepository);

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = authRepository.findById(id);
      if (!user) {
        return done(null, false);
      }
      // Remove sensitive data before returning
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (err) {
      done(err, null);
    }
  });

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },

  // This is our callback function
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Use the existing authService method to find or create user
      const user = await authService.findOrCreateGoogleUser(profile);
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));

  return passport;
}

module.exports = { setupPassport };