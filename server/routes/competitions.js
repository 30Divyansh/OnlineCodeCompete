const express = require('express');
const router = express.Router();
const dbStore = require('../services/dbStore');
const { getOrCreateRoom } = require('../services/duelManager');

// GET /api/competitions - Get competition history
router.get('/', (req, res) => {
  const competitions = dbStore.find('competitions');
  competitions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, count: competitions.length, competitions });
});

// GET /api/competitions/:roomCode - Get room details
router.get('/:roomCode', (req, res) => {
  const room = getOrCreateRoom(req.params.roomCode);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Competition not found' });
  }
  res.json({ success: true, competition: room });
});

// POST /api/competitions/create - Generate a new duel room code
router.post('/create', (req, res) => {
  const code = 'DUEL-' + Math.floor(1000 + Math.random() * 9000);
  const user = req.body.user;
  const room = getOrCreateRoom(code, user);
  res.json({ success: true, roomCode: code, competition: room });
});

module.exports = router;
