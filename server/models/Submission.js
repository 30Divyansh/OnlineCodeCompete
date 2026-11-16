const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  competitionId: { type: String, default: null },
  problemId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'python' },
  verdict: { 
    type: String, 
    enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded'], 
    required: true 
  },
  passedTestCases: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  executionTimeMs: { type: Number, default: 0 },
  memoryKb: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  errorMessage: { type: String, default: '' },
  testCaseResults: [{ type: mongoose.Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
