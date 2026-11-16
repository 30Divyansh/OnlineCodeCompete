const express = require('express');
const router = express.Router();
const presence = require('../services/presenceManager');

// GET /api/lobby/live-users - Get actual online players and lobby statistics
router.get('/live-users', (req, res) => {
  const players = presence.getOnlinePlayersList();
  const stats = presence.getLobbyStats();
  res.json({
    success: true,
    stats,
    users: players
  });
});

module.exports = router;
