const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Create a new user
   */
  static async create(email, password, nombre, apellido) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO users (email, password_hash, nombre, apellido)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, nombre, apellido, email_verified, created_at
      `;
      const result = await pool.query(query, [email, hashedPassword, nombre, apellido]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email already registered');
      }
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const query = `
      SELECT id, email, nombre, apellido, email_verified, created_at, updated_at
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Mark email as verified
   */
  static async verifyEmail(userId) {
    const query = `
      UPDATE users
      SET email_verified = true, verification_token = NULL
      WHERE id = $1
      RETURNING id, email, email_verified
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, nombre, apellido) {
    const query = `
      UPDATE users
      SET nombre = $1, apellido = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, email, nombre, apellido, email_verified
    `;
    const result = await pool.query(query, [nombre, apellido, userId]);
    return result.rows[0];
  }

  /**
   * Get user profile
   */
  static async getProfile(userId) {
    const query = `
      SELECT id, email, nombre, apellido, email_verified, created_at
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }
}

module.exports = User;
