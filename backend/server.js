require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const articleRoutes = require('./routes/articles');
const uploadRoutes = require('./routes/upload');
const userRoutes = require('./routes/users');
const visitRoutes = require('./routes/visits');
const importRoutes = require('./routes/import');
const epaperRoutes = require('./routes/epaper');
const reporterApplicationRoutes = require('./routes/reporterApplications');
const weatherRoutes = require('./routes/weather');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/import', importRoutes);
app.use('/api/epaper', epaperRoutes);
app.use('/api/reporter-applications', reporterApplicationRoutes);
app.use('/api/weather', weatherRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
