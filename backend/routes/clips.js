const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const pool = require('../db/connection');

// GET /api/clips
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM videos WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    res.status(200).json({
      videos: rows  // <-- not "clips"
    });
  } catch (err) {
    console.error('Clips fetch error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
