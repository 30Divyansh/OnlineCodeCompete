const { getOrCreateRoom, updateRoom, addActivity } = require('../services/duelManager');
const dbStore = require('../services/dbStore');
const { determineDuelWinner } = require('../services/scoringEngine');
const { runPythonCode } = require('../services/pythonRunner');
const presence = require('../services/presenceManager');

function setupDuelSocket(io) {
  // Broadcast lobby update helper
  const broadcastLobby = () => {
    io.emit('lobby_update', {
      users: presence.getOnlineUsersList(),
      stats: presence.getLobbyStats()
    });
  };

  io.on('connection', (socket) => {
    // ----------------------------------------------------
    // Presence & Live Lobby Handshake
    // ----------------------------------------------------
    socket.on('register_presence', ({ user }) => {
      if (!user || !user.id) return;
      socket.data.user = user;
      presence.registerUser(socket.id, user);
      broadcastLobby();
    });

    socket.on('get_lobby_state', () => {
      socket.emit('lobby_update', {
        users: presence.getOnlineUsersList(),
        stats: presence.getLobbyStats()
      });
    });

    // ----------------------------------------------------
    // Challenge / Invitation System
    // ----------------------------------------------------
    socket.on('send_challenge', ({ toUserId }) => {
      const fromUser = socket.data.user;
      if (!fromUser) {
        return socket.emit('challenge_error', { message: 'Must be logged in to challenge.' });
      }

      const res = presence.createChallenge(fromUser, toUserId);
      if (!res.success) {
        return socket.emit('challenge_error', { message: res.message });
      }

      const invite = res.invite;
      socket.emit('challenge_sent_success', { invite });

      // Check if target is a real connected socket
      const targetEntry = presence.onlineUsers.get(toUserId);
      if (targetEntry && targetEntry.socketId) {
        io.to(targetEntry.socketId).emit('challenge_received', {
          inviteId: invite.id,
          challenger: invite.fromUser,
          expiresInSeconds: 30
        });
      } else {
        // Target is a simulated live bot (e.g. ZenithCoder, MarcusB)
        // Auto-accept after 2.5 seconds to provide instant testability
        setTimeout(() => {
          const roomCode = 'DUEL-' + Math.floor(1000 + Math.random() * 9000);
          presence.resolveInvitation(invite.id, 'accepted');
          presence.setUserStatus(fromUser.id, 'in_competition', roomCode);

          socket.emit('challenge_accepted', {
            roomCode,
            opponent: invite.toUser
          });

          broadcastLobby();
        }, 2200);
      }
    });

    // Accept or decline challenge
    socket.on('respond_challenge', ({ inviteId, accept }) => {
      const currentUser = socket.data.user;
      if (!currentUser) return;

      const invite = presence.getInvitation(inviteId);
      if (!invite || invite.toUserId !== currentUser.id) {
        return socket.emit('challenge_error', { message: 'Invitation no longer valid.' });
      }

      if (accept) {
        presence.resolveInvitation(inviteId, 'accepted');
        const roomCode = 'DUEL-' + Math.floor(1000 + Math.random() * 9000);

        // Update status for both players
        presence.setUserStatus(invite.fromUser.id, 'in_competition', roomCode);
        presence.setUserStatus(currentUser.id, 'in_competition', roomCode);

        // Pre-initialize duel room with Player 1 and Player 2
        const room = getOrCreateRoom(roomCode, {
          userId: invite.fromUser.id,
          username: invite.fromUser.username,
          avatar: invite.fromUser.avatar
        });
        room.player2 = {
          userId: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          score: 0,
          passedTestCases: 0,
          totalTestCases: 0,
          executionTimeMs: 0,
          memoryKb: 0,
          submissionCount: 0,
          verdict: 'Selecting',
          ready: false,
          selectedProblemId: null
        };
        updateRoom(room);

        // Notify challenger
        const challengerEntry = presence.onlineUsers.get(invite.fromUser.id);
        if (challengerEntry?.socketId) {
          io.to(challengerEntry.socketId).emit('challenge_accepted', {
            roomCode,
            opponent: currentUser
          });
        }

        // Notify accepting player
        socket.emit('challenge_accepted', {
          roomCode,
          opponent: invite.fromUser
        });

        broadcastLobby();
      } else {
        // Declined
        presence.resolveInvitation(inviteId, 'declined');

        const challengerEntry = presence.onlineUsers.get(invite.fromUser.id);
        if (challengerEntry?.socketId) {
          io.to(challengerEntry.socketId).emit('challenge_declined', {
            opponentName: currentUser.username,
            message: `${currentUser.username} declined the challenge.`
          });
        }
      }
    });

    // Cancel challenge
    socket.on('cancel_challenge', ({ inviteId }) => {
      const invite = presence.getInvitation(inviteId);
      if (invite) {
        presence.resolveInvitation(inviteId, 'expired');
        const targetEntry = presence.onlineUsers.get(invite.toUserId);
        if (targetEntry?.socketId) {
          io.to(targetEntry.socketId).emit('challenge_cancelled', { inviteId });
        }
      }
    });

    // ----------------------------------------------------
    // Competition Room Handlers
    // ----------------------------------------------------
    socket.on('join_room', ({ roomCode, user }) => {
      if (!roomCode || !user) return;
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.user = user;

      const room = getOrCreateRoom(roomCode);
      presence.setUserStatus(user.id, 'in_competition', roomCode);

      // Assign player 1 or player 2
      if (!room.player1 || room.player1.userId === user.id) {
        room.player1 = {
          userId: user.id,
          username: user.username,
          avatar: user.avatar || '',
          score: room.player1 ? room.player1.score : 0,
          passedTestCases: room.player1 ? room.player1.passedTestCases : 0,
          totalTestCases: room.player1 ? room.player1.totalTestCases : 0,
          executionTimeMs: room.player1 ? room.player1.executionTimeMs : 0,
          memoryKb: room.player1 ? room.player1.memoryKb : 0,
          submissionCount: room.player1 ? room.player1.submissionCount : 0,
          verdict: room.player1 ? room.player1.verdict : 'Selecting',
          ready: room.player1 ? room.player1.ready : false,
          selectedProblemId: room.player1 ? room.player1.selectedProblemId : null
        };
      } else if (!room.player2 || room.player2.userId === user.id) {
        room.player2 = {
          userId: user.id,
          username: user.username,
          avatar: user.avatar || '',
          score: room.player2 ? room.player2.score : 0,
          passedTestCases: room.player2 ? room.player2.passedTestCases : 0,
          totalTestCases: room.player2 ? room.player2.totalTestCases : 0,
          executionTimeMs: room.player2 ? room.player2.executionTimeMs : 0,
          memoryKb: room.player2 ? room.player2.memoryKb : 0,
          submissionCount: room.player2 ? room.player2.submissionCount : 0,
          verdict: room.player2 ? room.player2.verdict : 'Selecting',
          ready: room.player2 ? room.player2.ready : false,
          selectedProblemId: room.player2 ? room.player2.selectedProblemId : null
        };
      }

      addActivity(room, user.username, `${user.username} entered the room.`);
      updateRoom(room);

      io.to(roomCode).emit('room_state', room);
      broadcastLobby();
    });

    // Select problem
    socket.on('select_problem', ({ roomCode, userId, problemId }) => {
      const room = getOrCreateRoom(roomCode);
      if (room.status === 'in_progress' || room.status === 'completed') return;

      const problems = dbStore.find('problems');
      const selectedProblem = problems.find(p => p.id === problemId);
      const problemTitle = selectedProblem ? selectedProblem.title : problemId;

      if (room.player1 && room.player1.userId === userId) {
        room.player1.selectedProblemId = problemId;
        room.player1.ready = false;
        addActivity(room, room.player1.username, `${room.player1.username} selected "${problemTitle}".`);
      } else if (room.player2 && room.player2.userId === userId) {
        room.player2.selectedProblemId = problemId;
        room.player2.ready = false;
        addActivity(room, room.player2.username, `${room.player2.username} selected "${problemTitle}".`);
      }

      const p1Selected = room.player1?.selectedProblemId;
      const p2Selected = room.player2?.selectedProblemId;

      if (p1Selected && p2Selected) {
        if (p1Selected === p2Selected) {
          room.status = 'matched';
          room.problemId = p1Selected;
          room.player1.ready = false;
          room.player2.ready = false;
          addActivity(room, 'System', `Both players agreed on "${problemTitle}"! Ready to confirm.`, 'success');
        } else {
          room.status = 'selection';
          room.problemId = null;
          room.player1.ready = false;
          room.player2.ready = false;
          const p1Prob = problems.find(p => p.id === p1Selected)?.title || p1Selected;
          const p2Prob = problems.find(p => p.id === p2Selected)?.title || p2Selected;
          addActivity(room, 'System', `Selection mismatch: ${room.player1.username} picked "${p1Prob}" but ${room.player2.username} picked "${p2Prob}". Both players must select the same problem!`, 'warning');
        }
      } else {
        room.status = 'selection';
        room.problemId = null;
      }

      updateRoom(room);
      io.to(roomCode).emit('room_state', room);
    });

    // Confirm ready
    socket.on('confirm_ready', ({ roomCode, userId }) => {
      const room = getOrCreateRoom(roomCode);
      if (room.status !== 'matched') return;

      if (room.player1 && room.player1.userId === userId) {
        room.player1.ready = true;
        addActivity(room, room.player1.username, `${room.player1.username} is ready to battle!`);
      } else if (room.player2 && room.player2.userId === userId) {
        room.player2.ready = true;
        addActivity(room, room.player2.username, `${room.player2.username} is ready to battle!`);
      }

      updateRoom(room);
      io.to(roomCode).emit('room_state', room);

      if (room.player1?.ready && room.player2?.ready) {
        io.to(roomCode).emit('ready_for_start', {
          problemId: room.problemId
        });
      }
    });

    // Start competition
    socket.on('start_competition', ({ roomCode }) => {
      const room = getOrCreateRoom(roomCode);
      if (!room.player1?.ready || !room.player2?.ready || !room.problemId) return;

      room.status = 'in_progress';
      room.startedAt = new Date().toISOString();
      room.player1.verdict = 'Coding';
      room.player2.verdict = 'Coding';

      addActivity(room, 'System', 'The competition has officially started! Good luck!', 'success');
      updateRoom(room);

      io.to(roomCode).emit('competition_started', room);
      broadcastLobby();

      if (room.player2?.userId === 'bot_codeduel' || room.player2?.userId?.startsWith('user_')) {
        // If simulated bot, trigger bot coder
        if (room.player2?.userId?.startsWith('user_') && room.player2?.userId !== socket.data.user?.id) {
          runBotBehavior(io, room);
        }
      }
    });

    // Enable bot opponent
    socket.on('enable_bot', ({ roomCode }) => {
      const room = getOrCreateRoom(roomCode);
      room.player2 = {
        userId: 'bot_codeduel',
        username: 'CodeDuel Bot',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BotCompetitor',
        score: 0,
        passedTestCases: 0,
        totalTestCases: 0,
        executionTimeMs: 0,
        memoryKb: 0,
        submissionCount: 0,
        verdict: 'Ready',
        ready: false,
        selectedProblemId: null
      };

      if (room.player1?.selectedProblemId) {
        room.player2.selectedProblemId = room.player1.selectedProblemId;
        room.status = 'matched';
        room.problemId = room.player1.selectedProblemId;
        room.player2.ready = true;
      }

      addActivity(room, 'CodeDuel Bot', 'CodeDuel Bot has joined the duel room.');
      updateRoom(room);
      io.to(roomCode).emit('room_state', room);
    });

    // Live Run Code activity notification
    socket.on('run_code_activity', ({ roomCode, userId }) => {
      const room = getOrCreateRoom(roomCode);
      const isP1 = room.player1?.userId === userId;
      const username = isP1 ? room.player1?.username : room.player2?.username;
      if (username) {
        addActivity(room, username, `${username} tested their solution against sample testcases.`, 'info');
        socket.to(roomCode).emit('opponent_action', {
          action: 'run_code',
          username,
          message: `${username} is running tests...`
        });
        updateRoom(room);
        io.to(roomCode).emit('room_state', room);
      }
    });

    // Live Submit Code sync
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

      const msgType = result.verdict === 'Accepted' ? 'success' : 'warning';
      addActivity(
        room,
        targetPlayer.username,
        `${targetPlayer.username} submitted: ${result.verdict} (${result.passedTestCases}/${result.totalTestCases} test cases passed, +${result.score} pts)`,
        msgType
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

      if (room.player1.verdict === 'Accepted' && room.player2?.verdict === 'Accepted') {
        endCompetition(io, room);
      }
    });

    // Finish / Surrender competition
    socket.on('finish_competition', ({ roomCode }) => {
      const room = getOrCreateRoom(roomCode);
      endCompetition(io, room);
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      presence.unregisterSocket(socket.id);
      broadcastLobby();
    });
  });
}

function endCompetition(io, room) {
  if (room.status === 'completed') return;

  room.status = 'completed';
  room.endedAt = new Date().toISOString();

  const outcome = determineDuelWinner(room.player1, room.player2 || { userId: 'bot', username: 'Bot', score: 0, executionTimeMs: 0 });
  room.winnerUserId = outcome.winnerUserId;
  room.winnerUsername = outcome.winnerUsername;
  room.tie = outcome.tie;
  room.tieBreakerReason = outcome.reason;

  addActivity(room, 'System', `Competition concluded! ${outcome.reason}`, 'success');
  updateRoom(room);

  // Set players back to available in lobby
  if (room.player1?.userId) presence.setUserStatus(room.player1.userId, 'available');
  if (room.player2?.userId) presence.setUserStatus(room.player2.userId, 'available');

  updateUserStats(room);

  io.to(room.roomCode).emit('competition_ended', room);
  io.emit('lobby_update', {
    users: presence.getOnlineUsersList(),
    stats: presence.getLobbyStats()
  });
}

function updateUserStats(room) {
  const p1 = room.player1;
  const p2 = room.player2;

  [p1, p2].forEach(p => {
    if (!p || p.userId.startsWith('bot_')) return;
    const user = dbStore.findOne('users', u => u.id === p.userId);
    if (!user) return;

    const isWinner = room.winnerUserId === p.userId;
    const isLoser = room.winnerUserId && room.winnerUserId !== p.userId;

    const competitions = (user.competitions || 0) + 1;
    const wins = (user.wins || 0) + (isWinner ? 1 : 0);
    const losses = (user.losses || 0) + (isLoser ? 1 : 0);
    const winRate = Number(((wins / competitions) * 100).toFixed(1));
    const totalPoints = (user.totalPoints || 0) + p.score;
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

function runBotBehavior(io, room) {
  const delayMs = Math.floor(Math.random() * 8000) + 14000;

  setTimeout(async () => {
    const curRoom = getOrCreateRoom(room.roomCode);
    if (curRoom.status !== 'in_progress') return;

    const problems = dbStore.find('problems');
    const problem = problems.find(p => p.id === curRoom.problemId);
    if (!problem) return;

    const allTestCases = [...problem.sampleTestCases, ...(problem.hiddenTestCases || []).map(tc => ({ ...tc, hidden: true }))];
    const execRes = await runPythonCode({
      userCode: problem.solutionCode,
      functionName: problem.functionName,
      testCases: allTestCases
    });

    const { calculateScore } = require('../services/scoringEngine');
    const scoreData = calculateScore({
      verdict: execRes.verdict,
      passedTestCases: execRes.passedTestCases,
      totalTestCases: execRes.totalTestCases,
      executionTimeMs: execRes.executionTimeMs,
      memoryKb: execRes.memoryKb,
      submissionCount: 1
    });

    curRoom.player2.submissionCount += 1;
    curRoom.player2.passedTestCases = execRes.passedTestCases;
    curRoom.player2.totalTestCases = execRes.totalTestCases;
    curRoom.player2.executionTimeMs = execRes.executionTimeMs;
    curRoom.player2.memoryKb = execRes.memoryKb;
    curRoom.player2.verdict = execRes.verdict;
    curRoom.player2.score = scoreData.totalScore;

    addActivity(
      curRoom,
      curRoom.player2.username,
      `${curRoom.player2.username} submitted solution: ${execRes.verdict} (${execRes.passedTestCases}/${execRes.totalTestCases} passed, +${scoreData.totalScore} pts)`,
      'success'
    );

    updateRoom(curRoom);
    io.to(curRoom.roomCode).emit('room_state', curRoom);

    if (curRoom.player1.verdict === 'Accepted') {
      endCompetition(io, curRoom);
    }
  }, delayMs);
}

module.exports = {
  setupDuelSocket,
  endCompetition
};
