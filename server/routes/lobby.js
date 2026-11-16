const express = require('express');
const router = express.Router();
const presence = require('../services/presenceManager');

// GET /api/lobby/live-users - Get currently online players and lobby statistics
router.get('/live-users', (req, res) => {
  const users = presence.getOnlineUsersList();
  const stats = presence.getLobbyStats();
  res.json({
    success: true,
    stats,
    users
  });
});

module.exports = router;
