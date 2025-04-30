const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const pool = require('../db/connection'); // <-- Make sure this is here

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|webm|avi|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only video files are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
  fileFilter
});

// POST /api/upload
router.post('/', authenticateToken, upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO videos (user_id, filename, original_name, path)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, req.file.filename, req.file.originalname, req.file.path]
    );

    const video = result.rows[0];

    res.status(201).json({
      message: 'Upload successful!',
      video: {
        id: video.id,
        filename: video.filename,
        original_name: video.original_name,
        path: video.path,
        status: video.status,
        created_at: video.created_at
      }
    });
  } catch (err) {
    console.error('DB insert error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
