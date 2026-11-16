const { getOrCreateRoom, updateRoom, addActivity } = require('../services/duelManager');
const dbStore = require('../services/dbStore');
const { determineDuelWinner } = require('../services/scoringEngine');
const { runPythonCode } = require('../services/pythonRunner');
const presence = require('../services/presenceManager');

function setupDuelSocket(io) {
  // Helper to broadcast players:update to all connected clients
  const broadcastPlayersUpdate = () => {
    io.emit('players:update', {
      players: presence.getOnlinePlayersList(),
      stats: presence.getLobbyStats()
    });
  };

  io.on('connection', (socket) => {
    // ----------------------------------------------------
    // Event: player:join
    // ----------------------------------------------------
    socket.on('player:join', (playerData) => {
      if (!playerData || !playerData.id || !playerData.username) return;

      socket.data.player = playerData;
      const registered = presence.registerPlayer(socket.id, playerData);

      // Confirm to current player
      socket.emit('player:registered', registered);

      // Broadcast updated live players list to everyone
      broadcastPlayersUpdate();
    });

    // Request current players list
    socket.on('players:get', () => {
      socket.emit('players:update', {
        players: presence.getOnlinePlayersList(),
        stats: presence.getLobbyStats()
      });
    });

    // ----------------------------------------------------
    // Event: challenge:send
    // ----------------------------------------------------
    socket.on('challenge:send', ({ toPlayerId, problemId }) => {
      const fromPlayer = socket.data.player;
      if (!fromPlayer) {
        return socket.emit('challenge:error', { message: 'You must join with your name before challenging.' });
      }

      const res = presence.createDirectChallenge(fromPlayer.id, toPlayerId, problemId);
      if (!res.success) {
        return socket.emit('challenge:error', { message: res.message });
      }

      const challenge = res.challenge;
      socket.emit('challenge:sent', { challenge });

      // Send challenge:received to the target player's socket
      io.to(res.toPlayerSocketId).emit('challenge:received', {
        inviteId: challenge.id,
        challenger: challenge.fromPlayer,
        problemId: challenge.problemId,
        problemTitle: challenge.problemTitle,
        difficulty: challenge.difficulty,
        category: challenge.category,
        expiresInSeconds: 30
      });

      // Server-side 30-second expiration safety
      setTimeout(() => {
        const pending = presence.getChallenge(challenge.id);
        if (pending && pending.status === 'pending') {
          presence.resolveChallenge(challenge.id, 'expired');
          socket.emit('challenge:expired', {
            message: `Challenge to ${challenge.toPlayer.username} expired (no response in 30 seconds).`
          });
          io.to(res.toPlayerSocketId).emit('challenge:expired', {
            inviteId: challenge.id
          });
        }
      }, 30500);
    });

    // ----------------------------------------------------
    // Event: challenge:accept
    // ----------------------------------------------------
    socket.on('challenge:accept', ({ inviteId }) => {
      const current = socket.data.player;
      if (!current) return;

      const challenge = presence.getChallenge(inviteId);
      if (!challenge || challenge.toPlayerId !== current.id) {
        return socket.emit('challenge:error', { message: 'Challenge invitation is no longer valid or has expired.' });
      }

      // Mark challenge accepted
      presence.resolveChallenge(inviteId, 'accepted');
      const roomCode = 'DUEL-' + Math.floor(1000 + Math.random() * 9000);

      // Set both players status to IN COMPETITION
      presence.setPlayerStatus(challenge.fromPlayer.id, 'IN COMPETITION', roomCode);
      presence.setPlayerStatus(current.id, 'IN COMPETITION', roomCode);

      // Pre-initialize competition room with the locked-in problem!
      const room = getOrCreateRoom(roomCode, {
        userId: challenge.fromPlayer.id,
        username: challenge.fromPlayer.username,
        avatar: challenge.fromPlayer.avatar
      });
      room.problemId = challenge.problemId;
      room.status = 'in_progress';
      room.startedAt = new Date().toISOString();
      room.player1.selectedProblemId = challenge.problemId;
      room.player1.ready = true;
      room.player1.verdict = 'Coding';

      room.player2 = {
        userId: current.id,
        username: current.username,
        avatar: current.avatar,
        score: 0,
        passedTestCases: 0,
        totalTestCases: 0,
        executionTimeMs: 0,
        memoryKb: 0,
        submissionCount: 0,
        verdict: 'Coding',
        ready: true,
        selectedProblemId: challenge.problemId
      };
      addActivity(room, 'System', `Battle started! Both players are solving: ${challenge.problemTitle}`, 'success');
      updateRoom(room);

      // Notify challenger
      const challengerSession = presence.onlinePlayers.get(challenge.fromPlayer.id);
      if (challengerSession?.socketId) {
        io.to(challengerSession.socketId).emit('challenge:accepted', {
          roomCode,
          problemId: challenge.problemId,
          problemTitle: challenge.problemTitle,
          opponent: current
        });
      }

      // Notify accepting player
      socket.emit('challenge:accepted', {
        roomCode,
        problemId: challenge.problemId,
        problemTitle: challenge.problemTitle,
        opponent: challenge.fromPlayer
      });

      broadcastPlayersUpdate();
    });

    // ----------------------------------------------------
    // Event: challenge:decline
    // ----------------------------------------------------
    socket.on('challenge:decline', ({ inviteId }) => {
      const current = socket.data.player;
      if (!current) return;

      const challenge = presence.getChallenge(inviteId);
      if (!challenge) return;

      presence.resolveChallenge(inviteId, 'declined');

      const challengerSession = presence.onlinePlayers.get(challenge.fromPlayer.id);
      if (challengerSession?.socketId) {
        io.to(challengerSession.socketId).emit('challenge:declined', {
          opponentName: current.username,
          message: `${current.username} declined the challenge.`
        });
      }
    });

    // ----------------------------------------------------
    // Event: challenge:cancel
    // ----------------------------------------------------
    socket.on('challenge:cancel', ({ inviteId }) => {
      const challenge = presence.getChallenge(inviteId);
      if (challenge) {
        presence.resolveChallenge(inviteId, 'expired');
        const targetSession = presence.onlinePlayers.get(challenge.toPlayerId);
        if (targetSession?.socketId) {
          io.to(targetSession.socketId).emit('challenge:expired', { inviteId });
        }
      }
    });

    // ----------------------------------------------------
    // Workspace Room Sync
    // ----------------------------------------------------
    socket.on('join_room', ({ roomCode, user }) => {
      if (!roomCode || !user) return;
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.player = user;

      const room = getOrCreateRoom(roomCode);
      presence.setPlayerStatus(user.id, 'IN COMPETITION', roomCode);

      // Emit room state
      io.to(roomCode).emit('room_state', room);
      broadcastPlayersUpdate();
    });

    // Live Run Code
    socket.on('run_code_activity', ({ roomCode, userId }) => {
      const room = getOrCreateRoom(roomCode);
      const isP1 = room.player1?.userId === userId;
      const username = isP1 ? room.player1?.username : room.player2?.username;
      if (username) {
        addActivity(room, username, `${username} tested their solution against sample testcases.`, 'info');
        socket.to(roomCode).emit('opponent_action', {
          action: 'run_code',
          username,
          message: `${username} is testing code...`
        });
        updateRoom(room);
        io.to(roomCode).emit('room_state', room);
      }
    });

    // Live Submit Code
    socket.on('submit_code_result', ({ roomCode, userId, result }) => {
      const room = getOrCreateRoom(roomCode);
      if (room.status !== 'in_progress') return;

      const isP1 = room.player1?.userId === userId;
      const targetPlayer = isP1 ? room.player1 : room.player2;
      if (!targetPlayer) return;

      targetPlayer.submissionCount += 1;
      targetPlayer.passedTestCases = result.passedTestCases;
      targetPlayer.totalTestCases = result.totalTestCases;
      targetPlayer.executionTimeMs = result.executionTimeMs;
      targetPlayer.memoryKb = result.memoryKb;
      targetPlayer.verdict = result.verdict;
      if (result.score > targetPlayer.score) {
        targetPlayer.score = result.score;
      }

      addActivity(
        room,
        targetPlayer.username,
        `${targetPlayer.username} submitted: ${result.verdict} (${result.passedTestCases}/${result.totalTestCases} passed, +${result.score} pts)`,
        result.verdict === 'Accepted' ? 'success' : 'warning'
      );

      socket.to(roomCode).emit('opponent_action', {
        action: 'submit_code',
        username: targetPlayer.username,
        verdict: result.verdict,
        passedTestCases: result.passedTestCases,
        totalTestCases: result.totalTestCases,
        score: targetPlayer.score
      });

      updateRoom(room);
      io.to(roomCode).emit('room_state', room);

      if (room.player1?.verdict === 'Accepted' && room.player2?.verdict === 'Accepted') {
        endCompetition(io, room);
      }
    });

    // Finish / Surrender
    socket.on('finish_competition', ({ roomCode }) => {
      const room = getOrCreateRoom(roomCode);
      endCompetition(io, room);
    });

    // ----------------------------------------------------
    // Event: player:disconnect
    // ----------------------------------------------------
    socket.on('disconnect', () => {
      const playerId = presence.unregisterSocket(socket.id);
      if (playerId) {
        broadcastPlayersUpdate();
      }
    });
  });
}

function endCompetition(io, room) {
  if (room.status === 'completed') return;

  room.status = 'completed';
  room.endedAt = new Date().toISOString();

  const outcome = determineDuelWinner(
    room.player1, 
    room.player2 || { userId: 'opp', username: 'Opponent', score: 0, executionTimeMs: 0 }
  );
  room.winnerUserId = outcome.winnerUserId;
  room.winnerUsername = outcome.winnerUsername;
  room.tie = outcome.tie;
  room.tieBreakerReason = outcome.reason;

  addActivity(room, 'System', `Competition concluded! ${outcome.reason}`, 'success');
  updateRoom(room);

  // Return both players automatically to ONLINE status in live lobby
  if (room.player1?.userId) presence.setPlayerStatus(room.player1.userId, 'ONLINE');
  if (room.player2?.userId) presence.setPlayerStatus(room.player2.userId, 'ONLINE');

  updateUserStats(room);

  io.to(room.roomCode).emit('competition_ended', room);
  io.emit('players:update', {
    players: presence.getOnlinePlayersList(),
    stats: presence.getLobbyStats()
  });
}

function updateUserStats(room) {
  const p1 = room.player1;
  const p2 = room.player2;

  [p1, p2].forEach(p => {
    if (!p || !p.userId) return;
    const user = dbStore.findOne('users', u => u.id === p.userId);
    if (!user) return;

    const isWinner = room.winnerUserId === p.userId;
    const isLoser = room.winnerUserId && room.winnerUserId !== p.userId;

    const competitions = (user.competitions || 0) + 1;
    const wins = (user.wins || 0) + (isWinner ? 1 : 0);
    const losses = (user.losses || 0) + (isLoser ? 1 : 0);
    const winRate = Number(((wins / competitions) * 100).toFixed(1));
    const totalPoints = (user.totalPoints || 0) + (p.score || 0);
    const avgScore = Number((totalPoints / competitions).toFixed(1));
    const rating = Math.max(1000, (user.rating || 1500) + (isWinner ? 25 : isLoser ? -15 : 5));

    const solvedProblems = new Set(user.solvedProblems || []);
    if (p.verdict === 'Accepted' && room.problemId) {
      solvedProblems.add(room.problemId);
    }

    dbStore.update('users', u => u.id === p.userId, u => ({
      ...u,
      competitions,
      wins,
      losses,
      winRate,
      totalPoints,
      avgScore,
      rating,
      solvedProblems: Array.from(solvedProblems)
    }));
  });
}

module.exports = {
  setupDuelSocket,
  endCompetition
};
