const express = require('express');
const User = require('../models/User');
const Article = require('../models/Article');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// All routes in this router require auth + admin role
router.use(auth, role('admin'));

// GET /api/users -> list all users (excluding password)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/users/:id/role -> update user's role
router.put('/:id/role', async (req, res) => {
  try {
    const { role: newRole } = req.body;

    const allowedRoles = ['admin', 'reporter'];
    if (!newRole || !allowedRoles.includes(newRole)) {
      return res.status(400).json({
        message: `Invalid role. Allowed roles are: ${allowedRoles.join(', ')}`,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: newRole },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/users/:id -> delete a user
router.delete('/:id', async (req, res) => {
  try {
    // Check if user has any pending or published articles
    const hasActiveArticles = await Article.exists({
      submittedBy: req.params.id,
      status: { $in: ['pending', 'published'] },
    });

    if (hasActiveArticles) {
      return res.status(400).json({
        message: 'Cannot delete user with pending or published articles.',
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
