const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const dbStore = require('../services/dbStore');
const { executeCode } = require('../services/multiRunner');
const { calculateScore } = require('../services/scoringEngine');

// POST /api/submissions/run - Run code against sample testcases or custom input
router.post('/run', async (req, res) => {
  try {
    const { problemId, code, customInput, language = 'python' } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }

    const problem = dbStore.findOne('problems', p => p.id === problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    let testCasesToRun = [];
    let isCustom = false;

    if (customInput !== undefined && customInput !== null && customInput !== '') {
      isCustom = true;
      let parsedArgs;
      try {
        parsedArgs = JSON.parse(customInput);
      } catch (e) {
        parsedArgs = isNaN(Number(customInput)) ? customInput : Number(customInput);
      }
      testCasesToRun = [{ input: parsedArgs }];
    } else {
      testCasesToRun = problem.sampleTestCases || [];
    }

    const execResult = await executeCode({
      language,
      userCode: code,
      functionName: problem.functionName,
      testCases: testCasesToRun,
      isCustomInput: isCustom,
      timeoutMs: 4000
    });

    res.json({
      success: true,
      data: execResult
    });
  } catch (err) {
    console.error('Run code error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/submissions/submit - Submit solution against all (visible + hidden) testcases
router.post('/submit', async (req, res) => {
  try {
    const { problemId, userId, username, code, roomCode, language = 'python' } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({ success: false, message: 'Problem ID and Code are required' });
    }

    const problem = dbStore.findOne('problems', p => p.id === problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Combine sample and hidden test cases
    const sampleCases = (problem.sampleTestCases || []).map(tc => ({ ...tc, hidden: false }));
    const hiddenCases = (problem.hiddenTestCases || []).map(tc => ({ ...tc, hidden: true }));
    const allTestCases = [...sampleCases, ...hiddenCases];

    // Count user's previous submissions for this problem/duel
    const userSubmissions = dbStore.find('submissions', s => 
      s.userId === (userId || 'guest') && s.problemId === problemId && (!roomCode || s.competitionId === roomCode)
    );
    const submissionCount = userSubmissions.length + 1;

    // Run evaluation in selected language
    const execResult = await executeCode({
      language,
      userCode: code,
      functionName: problem.functionName,
      testCases: allTestCases,
      isCustomInput: false,
      timeoutMs: 5000
    });

    // Calculate score using dynamic scoring system
    const scoreResult = calculateScore({
      verdict: execResult.verdict,
      passedTestCases: execResult.passedTestCases,
      totalTestCases: execResult.totalTestCases,
      executionTimeMs: execResult.executionTimeMs,
      memoryKb: execResult.memoryKb,
      submissionCount
    });

    const submissionRecord = {
      id: uuidv4(),
      competitionId: roomCode || null,
      problemId,
      problemTitle: problem.title,
      userId: userId || 'anonymous',
      username: username || 'Player',
      code,
      language,
      verdict: execResult.verdict,
      passedTestCases: execResult.passedTestCases,
      totalTestCases: execResult.totalTestCases,
      executionTimeMs: execResult.executionTimeMs,
      memoryKb: execResult.memoryKb,
      score: scoreResult.totalScore,
      scoreBreakdown: scoreResult.breakdown,
      errorMessage: execResult.error,
      results: execResult.results,
      createdAt: new Date().toISOString()
    };

    dbStore.insert('submissions', submissionRecord);

    res.json({
      success: true,
      submission: submissionRecord
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/submissions - Get submissions list
router.get('/', (req, res) => {
  const { userId, problemId, roomCode } = req.query;
  const submissions = dbStore.find('submissions', s => {
    if (userId && s.userId !== userId) return false;
    if (problemId && s.problemId !== problemId) return false;
    if (roomCode && s.competitionId !== roomCode) return false;
    return true;
  });

  submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, count: submissions.length, submissions });
});

module.exports = router;
