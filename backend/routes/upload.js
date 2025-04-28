const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

// POST /api/upload
router.post('/upload', authenticateToken, async (req, res) => {
  // Only logged-in users reach here
  res.send(`Upload route hit by user ID ${req.userId}`);
});

module.exports = router;
