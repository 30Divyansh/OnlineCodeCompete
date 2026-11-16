const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatar: { type: String, default: '' },
  rating: { type: Number, default: 1500 },
  competitions: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  solvedProblems: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
