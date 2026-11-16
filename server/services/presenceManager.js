const { v4: uuidv4 } = require('uuid');
const dbStore = require('./dbStore');

// Map of playerId -> { socketId, playerId, username, avatar, rating, competitions, wins, losses, winRate, totalPoints, avgScore, status: 'ONLINE' | 'IN COMPETITION', currentRoom, lastActive }
const onlinePlayers = new Map();

// Map of socketId -> playerId
const socketPlayerMap = new Map();

// Map of inviteId -> { id, fromPlayer, toPlayerId, toPlayer, problemId, problemTitle, difficulty, createdAt, expiresAt, status: 'pending'|'accepted'|'declined'|'expired' }
const activeChallenges = new Map();

/**
 * Register or update player connection
 */
function registerPlayer(socketId, playerData) {
  if (!playerData || !playerData.id || !playerData.username) return null;

  const playerId = playerData.id;
  const username = playerData.username.trim();

  // Look up existing stats in dbStore or create
  let userRecord = dbStore.findOne('users', u => u.id === playerId);
  if (!userRecord) {
    userRecord = {
      id: playerId,
      username,
      displayName: username,
      avatar: playerData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
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
    dbStore.insert('users', userRecord);
  } else if (userRecord.username !== username) {
    // Update username if changed
    dbStore.update('users', u => u.id === playerId, u => ({ ...u, username, displayName: username }));
    userRecord.username = username;
  }

  const existingSession = onlinePlayers.get(playerId);
  const currentStatus = existingSession?.status === 'IN COMPETITION' ? 'IN COMPETITION' : 'ONLINE';
  const currentRoom = existingSession?.currentRoom || null;

  const playerObj = {
    socketId,
    playerId,
    username: userRecord.username,
    displayName: userRecord.displayName,
    avatar: userRecord.avatar,
    rating: userRecord.rating || 1500,
    competitions: userRecord.competitions || 0,
    wins: userRecord.wins || 0,
    losses: userRecord.losses || 0,
    winRate: userRecord.winRate || 0,
    totalPoints: userRecord.totalPoints || 0,
    avgScore: userRecord.avgScore || 0,
    status: currentStatus,
    currentRoom,
    lastActive: Date.now()
  };

  onlinePlayers.set(playerId, playerObj);
  socketPlayerMap.set(socketId, playerId);

  return playerObj;
}

/**
 * Handle socket disconnection
 */
function unregisterSocket(socketId) {
  const playerId = socketPlayerMap.get(socketId);
  if (playerId) {
    const player = onlinePlayers.get(playerId);
    // If the disconnecting socket is this player's active socket
    if (player && player.socketId === socketId) {
      onlinePlayers.delete(playerId);
    }
    socketPlayerMap.delete(socketId);

    // Cancel any challenges involving this player
    for (const [inviteId, challenge] of activeChallenges.entries()) {
      if (challenge.fromPlayer.id === playerId || challenge.toPlayerId === playerId) {
        challenge.status = 'expired';
        activeChallenges.delete(inviteId);
      }
    }
  }
  return playerId;
}

function setPlayerStatus(playerId, status, roomCode = null) {
  const player = onlinePlayers.get(playerId);
  if (player) {
    player.status = status;
    player.currentRoom = roomCode;
  }
}

function getOnlinePlayersList() {
  // Returns only genuine active online players
  return Array.from(onlinePlayers.values()).map(p => ({
    id: p.playerId,
    username: p.username,
    displayName: p.displayName,
    avatar: p.avatar,
    rating: p.rating,
    competitions: p.competitions,
    wins: p.wins,
    losses: p.losses,
    winRate: p.winRate,
    totalPoints: p.totalPoints,
    avgScore: p.avgScore,
    status: p.status,
    currentRoom: p.currentRoom
  }));
}

function getLobbyStats() {
  const players = getOnlinePlayersList();
  const playersOnline = players.length;
  const availablePlayers = players.filter(p => p.status === 'ONLINE').length;
  const playersCompeting = players.filter(p => p.status === 'IN COMPETITION').length;

  return {
    playersOnline,
    availablePlayers,
    playersCompeting
  };
}

function createDirectChallenge(fromPlayerId, toPlayerId, problemId) {
  if (fromPlayerId === toPlayerId) {
    return { success: false, message: 'You cannot challenge yourself.' };
  }

  const fromPlayer = onlinePlayers.get(fromPlayerId);
  if (!fromPlayer) {
    return { success: false, message: 'You must be online to send a challenge.' };
  }

  const toPlayer = onlinePlayers.get(toPlayerId);
  if (!toPlayer) {
    return { success: false, message: 'Opponent is no longer online.' };
  }

  if (toPlayer.status !== 'ONLINE') {
    return { success: false, message: `${toPlayer.username} is currently in a competition.` };
  }

  // Find problem details from dbStore
  const problems = dbStore.find('problems');
  const problem = problems.find(p => p.id === problemId);
  if (!problem) {
    return { success: false, message: 'Selected problem not found in library.' };
  }

  // Prevent duplicate pending challenge
  for (const c of activeChallenges.values()) {
    if (c.fromPlayer.id === fromPlayerId && c.toPlayerId === toPlayerId && c.status === 'pending') {
      return { success: false, message: 'A challenge is already pending for this player.' };
    }
  }

  const inviteId = 'ch_' + uuidv4().substring(0, 8);
  const challenge = {
    id: inviteId,
    fromPlayer: {
      id: fromPlayer.playerId,
      username: fromPlayer.username,
      avatar: fromPlayer.avatar,
      rating: fromPlayer.rating,
      winRate: fromPlayer.winRate
    },
    toPlayerId,
    toPlayer: {
      id: toPlayer.playerId,
      username: toPlayer.username
    },
    problemId: problem.id,
    problemTitle: problem.title,
    difficulty: problem.difficulty,
    category: problem.category,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30000,
    status: 'pending'
  };

  activeChallenges.set(inviteId, challenge);
  return { success: true, challenge, toPlayerSocketId: toPlayer.socketId };
}

function getChallenge(inviteId) {
  return activeChallenges.get(inviteId) || null;
}

function resolveChallenge(inviteId, status) {
  const challenge = activeChallenges.get(inviteId);
  if (challenge) {
    challenge.status = status;
    activeChallenges.delete(inviteId);
  }
  return challenge;
}

module.exports = {
  onlinePlayers,
  registerPlayer,
  unregisterSocket,
  setPlayerStatus,
  getOnlinePlayersList,
  getLobbyStats,
  createDirectChallenge,
  getChallenge,
  resolveChallenge
};
