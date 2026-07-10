/**
 * Controller for Auth HTTP endpoints
 * Handles request/response, validation, and delegates to service layer
 */
const jwt = require('jsonwebtoken');

class AuthController {
  /**
   * @param {AuthService} authService - Service instance
   */
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * POST /api/login
   * Login with username/email and password
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          error: 'Username and password are required'
        });
      }

      const user = await this.authService.authenticate(username.trim(), password);

      if (!user) {
        return res.status(401).json({
          error: 'Invalid username or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Set session for backward compatibility
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.username = user.username;
      req.session.name = user.name;

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/register
   * Register new user
   */
  async register(req, res) {
    try {
      const result = await this.authService.register(req.body);
      res.json({
        success: true,
        message: 'User registered successfully',
        user: result
      });
    } catch (error) {
      // Validation errors
      if (error.message.includes('required') ||
          error.message.includes('already exists') ||
          error.message.includes('already in use') ||
          error.message.includes('taken') ||
          error.message.includes('empty')) {
        return res.status(400).json({ error: error.message });
      }

      console.error('Registration error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/logout
   * Logout user
   */
  async logout(req, res) {
    try {
      // Clear session
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err.message);
        }
        res.json({ success: true, message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Logout error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/me
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      let userId = req.session && req.session.userId;
      let user = null;

      // Check session auth
      if (userId) {
        // Get user from database to ensure fresh data
        user = await this.authService.getUserById(userId);
      }
      // Check JWT auth (if implemented)
      else if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          userId = decoded.userId;
          user = await this.authService.getUserById(userId);
        } catch (err) {
          // Invalid token
        }
      }

      if (!user) {
        return res.status(401).json({ authenticated: false });
      }

      res.json({
        authenticated: true,
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        roleLabel: this.getRoleLabel(user.role),
        avatar: user.avatar
      });
    } catch (error) {
      console.error('Get profile error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /api/users/:id
   * Update user (admin or self)
   */
  async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const requestingUserId = req.session && req.session.userId;
      const requestingUserRole = req.session && req.session.userRole;

      if (!requestingUserId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const updatedUser = await this.authService.updateProfile(
        userId,
        req.body,
        requestingUserId,
        requestingUserRole
      );

      res.json({
        success: true,
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      if (error.message === 'Authentication required' ||
          error.message === 'Insufficient permissions') {
        return res.status(401).json({ error: error.message });
      }

      if (error.message.includes('already in use') ||
          error.message.includes('already taken') ||
          error.message.includes('cannot be empty')) {
        return res.status(400).json({ error: error.message });
      }

      console.error('Update user error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/users/:id
   * Delete user (admin only)
   */
  async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const requestingUserId = req.session && req.session.userId;
      const requestingUserRole = req.session && req.session.userRole;

      if (!requestingUserId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Authorization check
      const requestingUser = await this.authService.getUserById(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const isAdmin = requestingUserRole === 'admin' || requestingUserRole === 'superadmin';
      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Prevent self-deletion
      if (userId === requestingUserId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      // Prevent deleting the last superadmin (safety check)
      const userToDelete = await this.authService.getUserById(userId);
      if (userToDelete && userToDelete.role === 'superadmin') {
        const superadmins = this.authRepository.countSuperadmins();
        if (superadmins <= 1) {
          return res.status(400).json({ error: 'Cannot delete the last superadmin' });
        }
      }

      // Delete user
      const deleted = await this.authService.deleteUser(
        userId,
        requestingUserId,
        requestingUserRole
      );

      if (deleted) {
        res.json({
          success: true,
          message: 'User deleted successfully'
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      if (error.message === 'Authentication required' ||
          error.message === 'Insufficient permissions' ||
          error.message === 'Cannot delete your own account' ||
          error.message === 'Cannot delete the last superadmin') {
        return res.status(400 || 403).json({ error: error.message });
      }

      console.error('Delete user error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/users
   * List users (admin only)
   */
  async listUsers(req, res) {
    try {
      const requestingUserId = req.session && req.session.userId;
      const requestingUserRole = req.session && req.session.userRole;

      if (!requestingUserId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Authorization check
      const requestingUser = await this.authService.getUserById(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const isAdmin = requestingUserRole === 'admin' || requestingUserRole === 'superadmin';
      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const { page = 1, limit = 10, role, search } = req.query;

      const filters = {};
      if (role) {
        // Validate role
        const validRoles = ['superadmin', 'admin', 'user', 'operador'];
        if (validRoles.includes(role)) {
          filters.role = role;
        }
      }
      if (search && typeof search === 'string' && search.trim() !== '') {
        filters.search = search.trim();
      }

      const result = await this.authService.getUsers(
        filters,
        parseInt(page),
        parseInt(limit),
        requestingUserId,
        requestingUserRole
      );

      res.json(result);
    } catch (error) {
      if (error.message === 'Authentication required' ||
          error.message === 'Insufficient permissions') {
        return res.status(401 || 403).json({ error: error.message });
      }

      console.error('List users error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Helper method to get role label
   * @private
   */
  getRoleLabel(role) {
    const roleLabels = {
      superadmin: 'Super Admin',
      admin: 'Administrador',
      user: 'Usuário',
      operador: 'Operador'
    };
    return roleLabels[role] || role;
  }
}

module.exports = AuthController;