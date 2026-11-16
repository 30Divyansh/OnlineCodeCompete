const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: mongoose.Schema.Types.Mixed, required: true },
  expected: { type: mongoose.Schema.Types.Mixed, required: true },
  explanation: { type: String, default: '' },
  hidden: { type: Boolean, default: false }
}, { _id: false });

const problemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  description: { type: String, required: true },
  inputFormat: { type: String, default: '' },
  outputFormat: { type: String, default: '' },
  constraints: [{ type: String }],
  functionName: { type: String, required: true },
  starterCode: { type: String, required: true },
  sampleTestCases: [testCaseSchema],
  hiddenTestCases: [testCaseSchema],
  solutionCode: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Problem || mongoose.model('Problem', problemSchema);
