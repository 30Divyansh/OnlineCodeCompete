const { runPythonCode } = require('./pythonRunner');
const { runJsCode } = require('./jsRunner');
const { runCppCode } = require('./cppRunner');

/**
 * Executes user code in the selected language
 */
async function executeCode({
  language = 'python',
  userCode,
  functionName,
  testCases,
  isCustomInput = false,
  timeoutMs = 4000
}) {
  const lang = (language || 'python').toLowerCase();

  switch (lang) {
    case 'python':
    case 'python3':
    case 'py':
      return await runPythonCode({
        userCode,
        functionName,
        testCases,
        isCustomInput,
        timeoutMs
      });

    case 'javascript':
    case 'js':
    case 'nodejs':
      return await runJsCode({
        userCode,
        functionName,
        testCases,
        isCustomInput,
        timeoutMs
      });

    case 'cpp':
    case 'c++':
      return await runCppCode({
        userCode,
        functionName,
        testCases,
        isCustomInput,
        timeoutMs
      });

    default:
      // Default to Python 3
      return await runPythonCode({
        userCode,
        functionName,
        testCases,
        isCustomInput,
        timeoutMs
      });
  }
}

module.exports = {
  executeCode
};
