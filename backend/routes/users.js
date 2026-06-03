const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

// All user routes require authentication
router.use(authenticateToken);

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.getProfile(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, apellido } = req.body;

    // Validate input
    if (nombre && nombre.trim().length < 2) {
      return res.status(400).json({ error: 'Nombre must be at least 2 characters' });
    }

    if (apellido && apellido.trim().length < 2) {
      return res.status(400).json({ error: 'Apellido must be at least 2 characters' });
    }

    const updatedUser = await User.updateProfile(userId, nombre, apellido);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
