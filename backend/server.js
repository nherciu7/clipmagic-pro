require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const clipsRoutes = require('./routes/clips');

// Use routes
app.use('/api/auth', authRoutes);       // For signup/login (ex: POST /api/auth/signup)
app.use('/api/upload', uploadRoutes);   // For uploading videos (ex: POST /api/upload)
app.use('/api/clips', clipsRoutes);     // For fetching clips (ex: GET /api/clips)

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
