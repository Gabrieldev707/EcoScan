const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scans');
const ecopointRoutes = require('./routes/ecopoints');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // base64 de imagens pode ser grande

app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/ecopoints', ecopointRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// handler de erros genérico
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Erro interno do servidor' });
});

module.exports = app;
