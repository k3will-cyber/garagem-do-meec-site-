const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');

/**
 * Configura o Passport com estratégia Google OAuth 2.0.
 * @param {Object} db - Instância do adaptador de banco (SQLite ou PostgreSQL)
 */
function setupPassport(db) {
  // Serialização: guarda apenas o ID do usuário na sessão
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialização: busca o usuário completo pelo ID
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.get(
        'SELECT id, username, name, email, role, avatar, auth_provider, created_at FROM users WHERE id = ?',
        [id]
      );
      done(null, user || null);
    } catch (err) {
      done(err, null);
    }
  });

  // ─── Google OAuth Strategy ────────────────────────────────────
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

  if (clientID && clientSecret) {
    passport.use(new GoogleStrategy({
      clientID,
      clientSecret,
      callbackURL: `${baseURL}/auth/google/callback`,
      scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const name = profile.displayName || email || 'Usuário Google';
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        // Busca usuário existente pelo google_id ou email
        let user = await db.get('SELECT * FROM users WHERE google_id = ?', [googleId]);

        if (!user && email) {
          user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
          if (user) {
            // Vincula a conta Google ao usuário existente
            await db.run(
              'UPDATE users SET google_id = ?, avatar = COALESCE(?, avatar), auth_provider = ? WHERE id = ?',
              [googleId, avatar, 'google', user.id]
            );
          }
        }

        if (!user) {
          // Cria novo usuário com Google
          const username = email ? email.split('@')[0] : `google_${googleId}`;
          // Garante username único
          let finalUsername = username;
          let counter = 1;
          while (await db.get('SELECT id FROM users WHERE username = ?', [finalUsername])) {
            finalUsername = `${username}_${counter}`;
            counter++;
          }

          await db.run(
            `INSERT INTO users (username, password, name, email, role, avatar, google_id, auth_provider)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              finalUsername,
              bcrypt.hashSync(Math.random().toString(36), 10),
              name,
              email || '',
              'user',
              avatar,
              googleId,
              'google'
            ]
          );

          user = await db.get('SELECT * FROM users WHERE google_id = ?', [googleId]);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }));
    console.log('✅ Google OAuth configurado');
  } else {
    console.log('⚠️  Google OAuth não configurado — defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET');
  }

  return passport;
}

module.exports = { setupPassport };
