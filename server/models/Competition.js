const mongoose = require('mongoose');

const playerStatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String, default: '' },
  score: { type: Number, default: 0 },
  passedTestCases: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  executionTimeMs: { type: Number, default: 0 },
  memoryKb: { type: Number, default: 0 },
  submissionCount: { type: Number, default: 0 },
  verdict: { type: String, default: 'In Progress' },
  ready: { type: Boolean, default: false },
  selectedProblemId: { type: String, default: null }
}, { _id: false });

const competitionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roomCode: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['selection', 'matched', 'in_progress', 'completed'], 
    default: 'selection' 
  },
  problemId: { type: String, default: null },
  durationSeconds: { type: Number, default: 900 }, // 15 mins default
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
  player1: playerStatSchema,
  player2: playerStatSchema,
  winnerUserId: { type: String, default: null },
  winnerUsername: { type: String, default: null },
  tie: { type: Boolean, default: false },
  tieBreakerReason: { type: String, default: '' },
  activityFeed: [{
    timestamp: { type: Date, default: Date.now },
    username: String,
    message: String,
    type: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Competition || mongoose.model('Competition', competitionSchema);
