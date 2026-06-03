const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/mailer');
const { validateRegister, validateLogin } = require('../utils/validators');
const crypto = require('crypto');

/**
 * POST /api/auth/register
 * Create a new user account
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre, apellido } = req.body;

    // Validate input
    const validation = validateRegister({ email, password, nombre, apellido });
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create user
    const user = await User.create(email, password, nombre, apellido);

    // Generate verification link (in production, this would be a token)
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${user.id}`;

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationLink);
    } catch (emailError) {
      console.error('Email sending failed, but account created:', emailError);
    }

    // Generate JWT
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      message: 'Account created successfully. Check your email to verify.',
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        email_verified: user.email_verified
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken(user.id, user.email);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        email_verified: user.email_verified
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, server-side is stateless)
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully (remove token from client)' });
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
router.post('/verify-email', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Mark email as verified
    const user = await User.verifyEmail(userId);

    res.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.getProfile(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
