/**
 * Repository for Auth data access operations
 * Handles all SQL interactions with the users table
 */

class AuthRepository {
  /**
   * @param {Object} db - Database adapter instance
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Find user by username or email
   * @param {string} identifier - Username or email
   * @returns {Promise<Object|null>} User data or null if not found
   */
  async findByIdentifier(identifier) {
    return this.db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    );
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User data or null if not found
   */
  async findById(id) {
    return this.db.get(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
  }

  /**
   * Find user by Google ID
   * @param {string} googleId - Google ID
   * @returns {Promise<Object|null>} User data or null if not found
   */
  async findByGoogleId(googleId) {
    return this.db.get(
      'SELECT * FROM users WHERE google_id = ?',
      [googleId]
    );
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Result with lastInsertRowid
   */
  async create(userData) {
    return this.db.run(
      `INSERT INTO users (username, password, name, email, role, avatar, google_id, auth_provider, tenant_id, created_at, last_login_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        userData.username,
        userData.password,
        userData.name,
        userData.email || '',
        userData.role || 'user',
        userData.avatar || null,
        userData.google_id || null,
        userData.auth_provider || 'local',
        userData.tenant_id || 1
      ]
    );
  }

  /**
   * Update an existing user
   * @param {number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Result of update operation
   */
  async update(id, userData) {
    const fields = [];
    const params = [];

    if (userData.username !== undefined) {
      fields.push('username = ?');
      params.push(userData.username);
    }
    if (userData.name !== undefined) {
      fields.push('name = ?');
      params.push(userData.name);
    }
    if (userData.email !== undefined) {
      fields.push('email = ?');
      params.push(userData.email);
    }
    if (userData.role !== undefined) {
      fields.push('role = ?');
      params.push(userData.role);
    }
    if (userData.avatar !== undefined) {
      fields.push('avatar = ?');
      params.push(userData.avatar);
    }
    if (userData.google_id !== undefined) {
      fields.push('google_id = ?');
      params.push(userData.google_id);
    }
    if (userData.auth_provider !== undefined) {
      fields.push('auth_provider = ?');
      params.push(userData.auth_provider);
    }
    if (userData.password !== undefined) {
      fields.push('password = ?');
      params.push(userData.password);
    }
    if (userData.last_login_at !== undefined) {
      fields.push('last_login_at = ?');
      params.push(userData.last_login_at);
    }

    // Always update timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');

    if (fields.length === 0) {
      return { changes: 0 };
    }

    params.push(id);

    return this.db.run(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  }

  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise<Object>} Result of delete operation
   */
  async delete(id) {
    return this.db.run('DELETE FROM users WHERE id = ?', [id]);
  }

  /**
   * Get users with optional filtering (for admin listing)
   * @param {Object} filters - Filter options
   * @param {number} tenantId - Tenant ID (for non-superadmin)
   * @param {boolean} isSuperadmin - Whether caller is superadmin
   * @returns {Promise<Array>} List of users
   */
  async findAll(filters = {}, tenantId = 1, isSuperadmin = false) {
    let query = `
      SELECT u.id, u.username, u.name, u.email, u.role, u.auth_provider, u.created_at,
             u.tenant_id, u.google_id, u.avatar, u.last_login_at, u.updated_at,
             COALESCE(t.name, '(sem tenant)') as tenant_name
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
    `;
    const params = [];
    const conditions = [];

    if (!isSuperadmin && tenantId !== undefined) {
      conditions.push('u.tenant_id = ?');
      params.push(tenantId);
    }

    if (filters.role) {
      conditions.push('u.role = ?');
      params.push(filters.role);
    }

    if (filters.search) {
      conditions.push('(u.username LIKE ? OR u.name LIKE ? OR u.email LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY u.created_at DESC';

    return this.db.all(query, params);
  }

  /**
   * Count users with optional filtering
   * @param {Object} filters - Filter options
   * @param {number} tenantId - Tenant ID (for non-superadmin)
   * @param {boolean} isSuperadmin - Whether caller is superadmin
   * @returns {Promise<number>} Count of users
   */
  async count(filters = {}, tenantId = 1, isSuperadmin = false) {
    let query = 'SELECT COUNT(*) as count FROM users u';
    const params = [];
    const conditions = [];

    if (!isSuperadmin && tenantId !== undefined) {
      conditions.push('u.tenant_id = ?');
      params.push(tenantId);
    }

    if (filters.role) {
      conditions.push('u.role = ?');
      params.push(filters.role);
    }

    if (filters.search) {
      conditions.push('(u.username LIKE ? OR u.name LIKE ? OR u.email LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await this.db.get(query, params);
    return result ? result.count : 0;
  }

  /**
   * Count superadmins (for safety checks)
   * @returns {Promise<number>} Count of superadmins
   */
  async countSuperadmins() {
    const result = await this.db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['superadmin']);
    return result ? result.count : 0;
  }

  /**
   * Delete a user by ID
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteUser(id) {
    const result = await this.db.run('DELETE FROM users WHERE id = ?', [id]);
    return result.changes > 0;
  }
}

module.exports = AuthRepository;
