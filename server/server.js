const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const problemsRouter = require('./routes/problems');
const submissionsRouter = require('./routes/submissions');
const competitionsRouter = require('./routes/competitions');
const usersRouter = require('./routes/users');
const { setupDuelSocket } = require('./socket/duelSocketHandler');
const { scoringConfig } = require('./services/scoringEngine');

const app = express();
const server = http.createServer(app);

// Cross-origin setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Try connecting to MongoDB if available
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codeduel';
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 2000
}).then(() => {
  console.log('Connected to MongoDB database');
}).catch(() => {
  console.log('MongoDB server not running locally. Using JSON database engine (data-driven & persistent).');
});

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupDuelSocket(io);

// REST API routes
app.use('/api/problems', problemsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/competitions', competitionsRouter);
app.use('/api/users', usersRouter);

// Scoring configuration API
app.get('/api/scoring/config', (req, res) => {
  res.json({ success: true, config: scoringConfig });
});

app.put('/api/scoring/config', (req, res) => {
  Object.assign(scoringConfig, req.body);
  res.json({ success: true, config: scoringConfig });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CodeDuel Server', timestamp: new Date().toISOString() });
});

// Serve frontend static build if available
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`CodeDuel Server running on port ${PORT}`);
});
