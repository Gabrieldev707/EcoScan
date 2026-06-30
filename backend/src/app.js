const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const scansRoutes = require('./routes/scansRoutes');
const ecopointsRoutes = require('./routes/ecopointsRoutes');
const communityRoutes = require('./routes/communityRoutes');
const ecoAlertsRoutes = require('./routes/ecoAlertsRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(express.json({ limit: '4mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      console.log(req.method + ' ' + req.originalUrl + ' ' + res.statusCode + ' ' + (Date.now() - startedAt) + 'ms');
    });
    next();
  });
}
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error('Origin not allowed by CORS');
      error.statusCode = 403;
      error.isOperational = true;
      return callback(error);
    },
    credentials: true,
  }),
);

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts', errors: [] },
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/scans', scansRoutes);
app.use('/api/ecopoints', ecopointsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/ecoalerts', ecoAlertsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
