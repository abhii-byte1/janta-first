const express = require('express');
const Counter = require('../models/Counter');

const router = express.Router();

// GET /api/visits -> returns current total visit count (public)
router.get('/', async (req, res) => {
  try {
    const counter = await Counter.findOne({ name: 'totalVisits' });
    res.status(200).json({ count: counter ? counter.count : 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/visits/increment -> increments and returns current total (public)
router.post('/increment', async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: 'totalVisits' },
      { $inc: { count: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ count: counter.count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
