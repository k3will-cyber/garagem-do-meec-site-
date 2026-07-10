/**
 * Service for Auth business logic
 * Handles validation, business rules, and coordinates repository operations
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  /**
   * @param {AuthRepository} authRepository - Repository instance
   */
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  /**
   * Authenticate user with username/email and password
   * @param {string} identifier - Username or email
   * @param {string} password - Plain text password
   * @returns {Object|null} User data (without password) or null if authentication fails
   */
  async authenticate(identifier, password) {
    // Find user by username or email
    const user = await this.authRepository.findByIdentifier(identifier);

    if (!user) {
      return null;
    }

    // Verify password
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return null;
    }

    // Update last login timestamp
    try {
      await this.authRepository.update(user.id, { last_login_at: new Date().toISOString() });
    } catch (error) {
      // Log error but don't fail authentication
      console.warn('Failed to update last login timestamp:', error.message);
    }

    // Return user without sensitive data
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Find or create user from Google OAuth profile
   * @param {Object} profile - Google profile object
   * @returns {Object} User data
   */
  async findOrCreateGoogleUser(profile) {
    const googleId = profile.id;
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    const name = profile.displayName || email || 'Usuário Google';
    const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

    // Try to find existing user by Google ID or email
    let user = await this.authRepository.findByGoogleId(googleId);

    if (!user && email) {
      user = await this.authRepository.findByIdentifier(email);

      if (user) {
        // Link Google account to existing user
        const updateData = {
          google_id: googleId,
          avatar: avatar,
          auth_provider: 'google'
        };
        await this.authRepository.update(user.id, updateData);
        user = { ...user, ...updateData };
      }
    }

    if (!user) {
      // Create new user with Google account
      const username = email ? email.split('@')[0] : `google_${googleId}`;
      // Ensure username is unique
      let finalUsername = username;
      let counter = 1;
      while (await this.authRepository.findByIdentifier(finalUsername)) {
        finalUsername = `${username}_${counter}`;
        counter++;
      }

      const userData = {
        username: finalUsername,
        password: bcrypt.hashSync(Math.random().toString(36).substring(2, 15), 10), // Random password (login only via Google)
        name: name,
        email: email || '',
        role: 'user', // Default role for social login
        avatar: avatar,
        google_id: googleId,
        auth_provider: 'google',
        tenant_id: 1 // Default tenant - in real app, this might come from context
      };

      const result = await this.authRepository.create(userData);
      user = await this.authRepository.findById(result.lastInsertRowid);
    }

    // Update last login timestamp for Google user
    try {
      await this.authRepository.update(user.id, { last_login_at: new Date().toISOString() });
    } catch (error) {
      // Log error but don't fail authentication
      console.warn('Failed to update last login timestamp for Google user:', error.message);
    }

    // Return user without sensitive data
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Register a new user (local auth)
   * @param {Object} userData - User registration data
   * @returns {Object} Created user data (without password)
   * @throws {Error} If validation fails or user already exists
   */
  async register(userData) {
    // Validation
    if (!userData.username || userData.username.trim() === '') {
      throw new Error('Username is required');
    }

    if (!userData.password || userData.password.trim() === '') {
      throw new Error('Password is required');
    }

    if (!userData.name || userData.name.trim() === '') {
      throw new Error('Name is required');
    }

    // Check if username already exists
    const existingUser = await this.authRepository.findByIdentifier(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Check if email already exists (if provided)
    if (userData.email) {
      const existingEmailUser = await this.authRepository.findByIdentifier(userData.email);
      if (existingEmailUser) {
        throw new Error('Email already in use');
      }
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(userData.password, 10);

    // Prepare user data
    const newUserData = {
      username: userData.username.trim(),
      password: hashedPassword,
      name: userData.name.trim(),
      email: userData.email ? userData.email.trim() : '',
      role: userData.role || 'user',
      avatar: userData.avatar || null,
      google_id: null,
      auth_provider: 'local',
      tenant_id: userData.tenant_id || 1
    };

    const result = await this.authRepository.create(newUserData);
    const createdUser = await this.authRepository.findById(result.lastInsertRowid);

    // Return user without sensitive data
    const { password: _, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Object|null} User data (without password) or null if not found
   */
  async getUserById(id) {
    const user = await this.authRepository.findById(id);
    if (!user) return null;

    // Return user without sensitive data
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   * @param {number} userId - ID of user to update
   * @param {Object} updateData - Data to update
   * @param {number} requestingUserId - ID of user making the request
   * @param {string} requestingUserRole - Role of user making the request
   * @returns {Object} Updated user data (without password)
   * @throws {Error} If unauthorized or validation fails
   */
  async updateProfile(userId, updateData, requestingUserId, requestingUserRole) {
    // Authorization check
    const requestingUser = await this.getUserById(requestingUserId);
    if (!requestingUser) {
      throw new Error('Authentication required');
    }

    // Users can only update their own profile unless they're admin
    const isSelf = userId === requestingUserId;
    const isAdmin = requestingUserRole === 'admin' || requestingUserRole === 'superadmin';

    if (!isSelf && !isAdmin) {
      throw new Error('Insufficient permissions');
    }

    // Prevent non-admins from changing role
    if (!isAdmin && updateData.role !== undefined) {
      throw new Error('Insufficient permissions to change role');
    }

    // Prevent regular users from making themselves admin
    if (!isAdmin && updateData.role && (updateData.role === 'admin' || updateData.role === 'superadmin')) {
      throw new Error('Insufficient permissions to assign admin roles');
    }

    // Prevent email/username conflicts
    if (updateData.email) {
      const existingEmailUser = await this.authRepository.findByIdentifier(updateData.email);
      if (    existingEmailUser && existingEmailUser.id !== userId) {
        throw new Error('Email already in use');
      }
    }

    if (updateData.username) {
      const existingUsernameUser = await this.authRepository.findByIdentifier(updateData.username);
      if (existingUsernameUser && existingUsernameUser.id !== userId) {
        throw new Error('Username already taken');
      }
    }

    // Update user
    const result = await this.authRepository.update(userId, updateData);
    if (result.changes === 0) {
      throw new Error('User not found');
    }

    // Return updated user without sensitive data
    const updatedUser = await this.authRepository.findById(userId);
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Delete a user
   * @param {number} userId - ID of user to delete
   * @param {number} requestingUserId - ID of user making the request
   * @param {string} requestingUserRole - Role of user making the request
   * @returns {boolean} True if deleted
   * @throws {Error} If unauthorized or trying to delete self
   */
  async deleteUser(userId, requestingUserId, requestingUserRole) {
    // Authorization check
    const requestingUser = await this.getUserById(requestingUserId);
    if (!requestingUser) {
      throw new Error('Authentication required');
    }

    // Only admin/superadmin can delete users
    const isAdmin = requestingUserRole === 'admin' || requestingUserRole === 'superadmin';
    if (!isAdmin) {
      throw new Error('Insufficient permissions');
    }

    // Prevent self-deletion
    if (userId === requestingUserId) {
      throw new Error('Cannot delete your own account');
    }

    // Prevent deleting the last superadmin (safety check)
    const userToDelete = await this.getUserById(userId);
    if (userToDelete && userToDelete.role === 'superadmin') {
      const superadmins = await this.authRepository.countSuperadmins();
      if (superadmins <= 1) {
        throw new Error('Cannot delete the last superadmin');
      }
    }

    // Delete user
    return await this.authRepository.deleteUser(userId);
  }

  /**
   * Get users with pagination and filtering
   * @param {Object} filters - Filter options (role, search)
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @param {number} requestingUserId - ID of user making the request
   * @param {string} requestingUserRole - Role of user making the request
   * @returns {Object} Paginated results
   * @throws {Error} If unauthorized
   */
  async getUsers(filters = {}, page = 1, limit = 10, requestingUserId, requestingUserRole) {
    // Authorization check
    const requestingUser = await this.getUserById(requestingUserId);
    if (!requestingUser) {
      throw new Error('Authentication required');
    }

    // Only admin/superadmin can list users
    const isAdmin = requestingUserRole === 'admin' || requestingUserRole === 'superadmin';
    if (!isAdmin) {
      throw new Error('Insufficient permissions');
    }

    // Get tenant ID for non-superadmins
    const tenantId = requestingUser.tenant_id;
    const isSuperadmin = requestingUserRole === 'superadmin';

    // Get total count
    const total = await this.authRepository.count(filters,
      isSuperadmin ? undefined : tenantId,
      isSuperadmin);

    // Get paginated results
    const offset = (page - 1) * limit;
    const users = await this.authRepository.findAll(
      filters,
      isSuperadmin ? undefined : tenantId,
      isSuperadmin
    );

    // Apply pagination manually (since our findAll doesn't support limit/offset directly)
    // In a real implementation, we'd modify the repository to support limit/offset
    const paginatedUsers = users.slice(offset, offset + limit);

    // Remove passwords from all users
    const usersWithoutPasswords = paginatedUsers.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      users: usersWithoutPasswords,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}

module.exports = AuthService;