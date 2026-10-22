const express = require('express');
const cors = require('cors');
const questionRoutes = require('./routes/questionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Simple health check, useful now for testing and later for deployment checks.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'papertrail' });
});

app.use('/api/questions', questionRoutes);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
