const { getOrCreateRoom, updateRoom, addActivity } = require('../services/duelManager');
const dbStore = require('../services/dbStore');
const { determineDuelWinner } = require('../services/scoringEngine');
const { runPythonCode } = require('../services/pythonRunner');

function setupDuelSocket(io) {
  io.on('connection', (socket) => {
    // console.log(`Socket connected: ${socket.id}`);

    // Join room
    socket.on('join_room', ({ roomCode, user }) => {
      if (!roomCode || !user) return;
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.user = user;

      const room = getOrCreateRoom(roomCode);

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

      // Check matchmaking condition
      const p1Selected = room.player1?.selectedProblemId;
      const p2Selected = room.player2?.selectedProblemId;

      if (p1Selected && p2Selected) {
        if (p1Selected === p2Selected) {
          // Exact match!
          room.status = 'matched';
          room.problemId = p1Selected;
          room.player1.ready = false;
          room.player2.ready = false;
          addActivity(room, 'System', `Both players agreed on "${problemTitle}"! Ready to confirm.`, 'success');
        } else {
          // Mismatch!
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

      // If both ready, notify frontend that Start Competition can begin
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

      // Start Bot simulation if player2 is a bot
      if (room.player2?.userId === 'bot_codeduel') {
        runBotBehavior(io, room);
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

      // If player1 already selected a problem, Bot agrees and confirms
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

    // Live Run Code activity notification (code is not sent to opponent)
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
      // Retain maximum score achieved
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

      // Notify opponent
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

      // Check if both players have achieved Accepted
      if (room.player1.verdict === 'Accepted' && room.player2?.verdict === 'Accepted') {
        endCompetition(io, room);
      }
    });

    // Finish / Surrender competition
    socket.on('finish_competition', ({ roomCode }) => {
      const room = getOrCreateRoom(roomCode);
      endCompetition(io, room);
    });

    socket.on('disconnect', () => {
      // socket disconnected
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

  // Update user statistics in dbStore
  updateUserStats(room);

  io.to(room.roomCode).emit('competition_ended', room);
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

// Bot simulation behavior during duel
function runBotBehavior(io, room) {
  // Bot submits code after 15 to 25 seconds
  const delayMs = Math.floor(Math.random() * 8000) + 14000;

  setTimeout(async () => {
    const curRoom = getOrCreateRoom(room.roomCode);
    if (curRoom.status !== 'in_progress') return;

    const problems = dbStore.find('problems');
    const problem = problems.find(p => p.id === curRoom.problemId);
    if (!problem) return;

    // Run bot's reference solution
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
      'CodeDuel Bot',
      `CodeDuel Bot submitted solution: ${execRes.verdict} (${execRes.passedTestCases}/${execRes.totalTestCases} passed, +${scoreData.totalScore} pts)`,
      'success'
    );

    updateRoom(curRoom);
    io.to(curRoom.roomCode).emit('room_state', curRoom);

    // If player 1 is also accepted, end competition
    if (curRoom.player1.verdict === 'Accepted') {
      endCompetition(io, curRoom);
    }
  }, delayMs);
}

module.exports = {
  setupDuelSocket,
  endCompetition
};
