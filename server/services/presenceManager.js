const { v4: uuidv4 } = require('uuid');
const dbStore = require('./dbStore');

// Map of userId -> { socketId, user, status: 'available'|'in_competition'|'away', roomCode: null, connectedAt }
const onlineUsers = new Map();

// Map of socketId -> userId
const socketUserMap = new Map();

// Map of inviteId -> { id, fromUser, toUserId, toUser, createdAt, expiresAt, status: 'pending'|'accepted'|'declined'|'expired' }
const activeInvitations = new Map();

// Initial bot/demo users who are part of the platform's simulated live ecosystem
const simulatedOnlineUsers = [
  {
    id: 'user_marcus',
    username: 'MarcusB',
    displayName: 'Marcus Bell',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MarcusB',
    rating: 1820,
    competitions: 34,
    wins: 25,
    losses: 9,
    winRate: 73.5,
    totalPoints: 3120,
    status: 'available',
    isBot: true
  },
  {
    id: 'user_elena',
    username: 'ElenaR',
    displayName: 'Elena Rostova',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ElenaR',
    rating: 1590,
    competitions: 18,
    wins: 11,
    losses: 7,
    winRate: 61.1,
    totalPoints: 1540,
    status: 'in_competition',
    isBot: true
  },
  {
    id: 'user_zenith',
    username: 'ZenithCoder',
    displayName: 'Zenith Master',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ZenithCoder',
    rating: 1950,
    competitions: 52,
    wins: 41,
    losses: 11,
    winRate: 78.8,
    totalPoints: 4680,
    status: 'available',
    isBot: true
  }
];

function registerUser(socketId, user) {
  if (!user || !user.id) return;

  const existing = onlineUsers.get(user.id);
  const currentStatus = existing ? existing.status : 'available';
  const currentRoom = existing ? existing.roomCode : null;

  const userEntry = {
    socketId,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
      rating: user.rating || 1500,
      competitions: user.competitions || 0,
      wins: user.wins || 0,
      losses: user.losses || 0,
      winRate: user.winRate || 0,
      totalPoints: user.totalPoints || 0
    },
    status: currentStatus,
    roomCode: currentRoom,
    isBot: false,
    connectedAt: new Date().toISOString()
  };

  onlineUsers.set(user.id, userEntry);
  socketUserMap.set(socketId, user.id);
}

function unregisterSocket(socketId) {
  const userId = socketUserMap.get(socketId);
  if (userId) {
    onlineUsers.delete(userId);
    socketUserMap.delete(socketId);
    
    // Clean up any pending invites sent by or to this user
    for (const [inviteId, invite] of activeInvitations.entries()) {
      if (invite.fromUser.id === userId || invite.toUserId === userId) {
        activeInvitations.delete(inviteId);
      }
    }
  }
}

function setUserStatus(userId, status, roomCode = null) {
  const entry = onlineUsers.get(userId);
  if (entry) {
    entry.status = status;
    entry.roomCode = roomCode;
  }
}

function getOnlineUsersList(currentUserId = null) {
  const realList = Array.from(onlineUsers.values()).map(e => ({
    ...e.user,
    status: e.status,
    roomCode: e.roomCode,
    isBot: false
  }));

  // Merge with simulated live ecosystem (filter out duplicates if user logged in as that user)
  const realUserIds = new Set(realList.map(u => u.id));
  const simList = simulatedOnlineUsers.filter(s => !realUserIds.has(s.id));

  return [...realList, ...simList];
}

function getLobbyStats() {
  const allUsers = getOnlineUsersList();
  const playersOnline = allUsers.length;
  const playersAvailable = allUsers.filter(u => u.status === 'available').length;
  
  // Count active battles from rooms
  const competitions = dbStore.find('competitions');
  const activeBattles = competitions.filter(c => c.status === 'in_progress').length;

  return {
    playersOnline,
    playersAvailable,
    activeBattles: Math.max(activeBattles, 1) // realistic display
  };
}

function createChallenge(fromUser, toUserId) {
  // Validate
  if (fromUser.id === toUserId) {
    return { success: false, message: 'You cannot challenge yourself.' };
  }

  const allUsers = getOnlineUsersList();
  const target = allUsers.find(u => u.id === toUserId);
  if (!target) {
    return { success: false, message: 'Player is not online.' };
  }

  if (target.status !== 'available') {
    return { success: false, message: `Player is currently ${target.status === 'in_competition' ? 'In Competition' : 'Unavailable'}.` };
  }

  // Check if invitation already pending between these two
  for (const inv of activeInvitations.values()) {
    if (inv.fromUser.id === fromUser.id && inv.toUserId === toUserId && inv.status === 'pending') {
      return { success: false, message: 'Challenge invitation already pending for this player.' };
    }
  }

  const inviteId = 'inv_' + uuidv4().substring(0, 8);
  const invite = {
    id: inviteId,
    fromUser: {
      id: fromUser.id,
      username: fromUser.username,
      displayName: fromUser.displayName,
      avatar: fromUser.avatar,
      rating: fromUser.rating,
      winRate: fromUser.winRate
    },
    toUserId,
    toUser: target,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30000, // 30 second countdown
    status: 'pending'
  };

  activeInvitations.set(inviteId, invite);
  return { success: true, invite };
}

function getInvitation(inviteId) {
  return activeInvitations.get(inviteId) || null;
}

function resolveInvitation(inviteId, status) {
  const inv = activeInvitations.get(inviteId);
  if (inv) {
    inv.status = status;
    activeInvitations.delete(inviteId);
  }
  return inv;
}

module.exports = {
  onlineUsers,
  registerUser,
  unregisterSocket,
  setUserStatus,
  getOnlineUsersList,
  getLobbyStats,
  createChallenge,
  getInvitation,
  resolveInvitation
};
