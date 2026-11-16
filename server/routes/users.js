const express = require('express');
const router = express.Router();
const dbStore = require('../services/dbStore');

// GET /api/users - Leaderboard ranking
router.get('/', (req, res) => {
  const users = dbStore.find('users');
  // Sort by rating and points
  users.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.totalPoints || 0) - (a.totalPoints || 0));

  const ranked = users.map((u, idx) => ({
    ...u,
    globalRank: idx + 1
  }));

  res.json({ success: true, count: ranked.length, users: ranked });
});

// GET /api/users/:id - User details
router.get('/:id', (req, res) => {
  const user = dbStore.findOne('users', u => u.id === req.params.id || u.username === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Get user's past competitions
  const history = dbStore.find('competitions', c => 
    c.status === 'completed' && ((c.player1 && c.player1.userId === user.id) || (c.player2 && c.player2.userId === user.id))
  );

  res.json({ success: true, user, history });
});

// POST /api/users - Create or switch user
router.post('/', (req, res) => {
  const { username, displayName } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }

  let user = dbStore.findOne('users', u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    user = {
      id: 'user_' + username.toLowerCase().replace(/[^a-z0-9]/g, ''),
      username,
      displayName: displayName || username,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      rating: 1500,
      competitions: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalPoints: 0,
      avgScore: 0,
      solvedProblems: [],
      createdAt: new Date().toISOString()
    };
    dbStore.insert('users', user);
  }

  res.json({ success: true, user });
});

module.exports = router;
