const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const complaintsRoutes = require('./routes/complaints');
const officerRoutes = require('./routes/officer');
const adminRoutes = require('./routes/admin');
const { startCronJobs } = require('./services/cron');

const app = express();
const PORT = process.env.PORT || 3001;
const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawClientUrl
  .split(',')
  .map(url => url.trim().replace(/\/$/, ''))
  .concat(['http://localhost:5173', 'http://127.0.0.1:5173']);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isLocalDev = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(normalizedOrigin);
    if (allowedOrigins.includes(normalizedOrigin) || isLocalDev || normalizedOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CivicConnect API',
    timestamp: new Date().toISOString()
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 CivicConnect Backend running on http://localhost:${PORT}`);
  console.log(`🔒 RBAC layers enabled with Supabase Auth`);
  startCronJobs();
});
