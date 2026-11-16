const { v4: uuidv4 } = require('uuid');
const dbStore = require('./dbStore');
const { determineDuelWinner, calculateScore } = require('./scoringEngine');

// In-memory active duel rooms map: roomCode -> roomData
const rooms = new Map();

function getOrCreateRoom(roomCode, initialPlayer = null) {
  if (!rooms.has(roomCode)) {
    // Check if exists in dbStore
    const existing = dbStore.findOne('competitions', c => c.roomCode === roomCode);
    if (existing && existing.status !== 'completed') {
      rooms.set(roomCode, existing);
    } else {
      const newRoom = {
        id: uuidv4(),
        roomCode,
        status: 'selection', // 'selection' | 'matched' | 'in_progress' | 'completed'
        problemId: null,
        durationSeconds: 900,
        startedAt: null,
        endedAt: null,
        player1: initialPlayer ? {
          userId: initialPlayer.userId,
          username: initialPlayer.username,
          avatar: initialPlayer.avatar || '',
          score: 0,
          passedTestCases: 0,
          totalTestCases: 0,
          executionTimeMs: 0,
          memoryKb: 0,
          submissionCount: 0,
          verdict: 'Selecting',
          ready: false,
          selectedProblemId: null
        } : null,
        player2: null,
        winnerUserId: null,
        winnerUsername: null,
        tie: false,
        tieBreakerReason: '',
        activityFeed: [],
        createdAt: new Date().toISOString()
      };
      rooms.set(roomCode, newRoom);
      dbStore.insert('competitions', newRoom);
    }
  }
  return rooms.get(roomCode);
}

function updateRoom(room) {
  rooms.set(room.roomCode, room);
  dbStore.update('competitions', c => c.roomCode === room.roomCode, () => ({ ...room }));
}

function addActivity(room, username, message, type = 'info') {
  const item = {
    timestamp: new Date().toISOString(),
    username,
    message,
    type
  };
  room.activityFeed.push(item);
  if (room.activityFeed.length > 50) {
    room.activityFeed.shift();
  }
}

module.exports = {
  rooms,
  getOrCreateRoom,
  updateRoom,
  addActivity
};
