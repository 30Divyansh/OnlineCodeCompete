const express = require('express');
const router = express.Router();
const dbStore = require('../services/dbStore');

// GET /api/problems - List all problems
router.get('/', (req, res) => {
  const problems = dbStore.find('problems');
  // For security, hide hiddenTestCases in the public problem list
  const sanitized = problems.map(p => {
    const { hiddenTestCases, solutionCode, ...rest } = p;
    return rest;
  });
  res.json({ success: true, count: sanitized.length, problems: sanitized });
});

// GET /api/problems/:id - Get specific problem details
router.get('/:id', (req, res) => {
  const problem = dbStore.findOne('problems', p => p.id === req.params.id);
  if (!problem) {
    return res.status(404).json({ success: false, message: 'Problem not found' });
  }
  const { hiddenTestCases, solutionCode, ...sanitized } = problem;
  res.json({ success: true, problem: sanitized });
});

// POST /api/problems - Admin Add Problem
router.post('/', (req, res) => {
  const {
    id,
    title,
    category,
    difficulty,
    description,
    inputFormat,
    outputFormat,
    constraints,
    functionName,
    starterCode,
    sampleTestCases,
    hiddenTestCases,
    solutionCode
  } = req.body;

  if (!title || !category || !difficulty || !functionName || !starterCode) {
    return res.status(400).json({ success: false, message: 'Required fields missing' });
  }

  const problemId = id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existing = dbStore.findOne('problems', p => p.id === problemId);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Problem ID already exists' });
  }

  const newProblem = {
    id: problemId,
    title,
    category,
    difficulty,
    description: description || '',
    inputFormat: inputFormat || '',
    outputFormat: outputFormat || '',
    constraints: constraints || [],
    functionName,
    starterCode,
    sampleTestCases: sampleTestCases || [],
    hiddenTestCases: hiddenTestCases || [],
    solutionCode: solutionCode || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbStore.insert('problems', newProblem);
  res.status(201).json({ success: true, problem: newProblem });
});

// PUT /api/problems/:id - Admin Edit Problem
router.put('/:id', (req, res) => {
  const problemId = req.params.id;
  const existing = dbStore.findOne('problems', p => p.id === problemId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Problem not found' });
  }

  const updated = dbStore.update(
    'problems',
    p => p.id === problemId,
    old => ({
      ...old,
      ...req.body,
      id: old.id, // prevent changing id
      updatedAt: new Date().toISOString()
    })
  );

  res.json({ success: true, problem: updated });
});

// DELETE /api/problems/:id - Admin Delete Problem
router.delete('/:id', (req, res) => {
  const problemId = req.params.id;
  const deleted = dbStore.delete('problems', p => p.id === problemId);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Problem not found' });
  }
  res.json({ success: true, message: 'Problem deleted successfully' });
});

module.exports = router;
