const express = require('express');
const router = express.Router();

// GET /api/get-clips
router.get('/get-clips', async (req, res) => {
  // get clips logic will go here
  res.send('Get clips route hit.');
});

module.exports = router;
