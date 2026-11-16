const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const scratchDir = path.join(__dirname, '..', 'scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

function createJsRunnerScript(userCode, functionName, testCases, isCustomInput = false) {
  const testCasesJson = JSON.stringify(testCases);

  return `
const { performance } = require('perf_hooks');

function normalizeVal(val) {
  if (Array.isArray(val)) {
    return val.map(normalizeVal);
  }
  if (typeof val === 'number' && !Number.isInteger(val)) {
    return Math.round(val * 100000) / 100000;
  }
  return val;
}

function deepEqual(a, b) {
  const na = normalizeVal(a);
  const nb = normalizeVal(b);
  if (typeof na === 'number' && typeof nb === 'number' && !Number.isInteger(na)) {
    return Math.abs(na - nb) < 1e-5;
  }
  return JSON.stringify(na) === JSON.stringify(nb);
}

// User code execution
let userScope = {};
try {
  ${userCode}

  // Find target function
  let targetFn = null;
  const fnName = ${JSON.stringify(functionName)};

  if (typeof eval(fnName) === 'function') {
    targetFn = eval(fnName);
  } else if (typeof Solution !== 'undefined' && typeof (new Solution())[fnName] === 'function') {
    const sol = new Solution();
    targetFn = sol[fnName].bind(sol);
  } else {
    // Try global search
    targetFn = eval(fnName);
  }

  if (typeof targetFn !== 'function') {
    console.log(JSON.stringify({
      verdict: 'Runtime Error',
      passedTestCases: 0,
      totalTestCases: 0,
      executionTimeMs: 0,
      memoryKb: 0,
      error: 'Function "' + fnName + '" not found. Please implement function ' + fnName + '(...).'
    }));
    process.exit(0);
  }

  const testCases = ${testCasesJson};
  const results = [];
  let passedCount = 0;
  let totalTimeMs = 0;
  let peakMemKb = 0;
  const isCustom = ${isCustomInput ? 'true' : 'false'};

  for (let idx = 0; idx < testCases.length; idx++) {
    const tc = testCases[idx];
    const args = tc.input || [];
    const expected = tc.expected;
    const isHidden = tc.hidden || false;

    const startMem = process.memoryUsage().heapUsed;
    const tStart = performance.now();
    let actual = null;
    let errStr = null;

    try {
      if (Array.isArray(args)) {
        actual = targetFn(...args);
      } else {
        actual = targetFn(args);
      }
    } catch (e) {
      errStr = e.stack || e.message;
    }

    const tEnd = performance.now();
    const endMem = process.memoryUsage().heapUsed;
    const durMs = Math.round((tEnd - tStart) * 100) / 100;
    totalTimeMs += durMs;
    const memKb = Math.round(Math.max(0, endMem - startMem) / 1024);
    if (memKb > peakMemKb) peakMemKb = memKb;

    if (errStr) {
      results.push({
        testCaseIndex: idx + 1,
        hidden: isHidden,
        passed: false,
        error: errStr,
        timeMs: durMs,
        memoryKb: memKb
      });
      break;
    }

    if (isCustom) {
      results.push({
        testCaseIndex: idx + 1,
        hidden: false,
        passed: true,
        input: args,
        actual: actual,
        timeMs: durMs,
        memoryKb: memKb
      });
      passedCount++;
    } else {
      const isCorrect = deepEqual(actual, expected);
      if (isCorrect) passedCount++;

      const resObj = {
        testCaseIndex: idx + 1,
        hidden: isHidden,
        passed: isCorrect,
        timeMs: durMs,
        memoryKb: memKb
      };

      if (!isHidden) {
        resObj.input = args;
        resObj.expected = expected;
        resObj.actual = actual;
      } else if (!isCorrect) {
        resObj.message = 'Hidden testcase failed';
      }

      results.push(resObj);
    }
  }

  const totalTc = testCases.length;
  let verdict = 'Accepted';
  if (results.some(r => r.error)) {
    verdict = 'Runtime Error';
  } else if (passedCount !== totalTc) {
    verdict = 'Wrong Answer';
  }

  console.log(JSON.stringify({
    verdict,
    passedTestCases: passedCount,
    totalTestCases: totalTc,
    executionTimeMs: Math.round(totalTimeMs * 100) / 100,
    memoryKb: peakMemKb,
    error: null,
    results
  }));

} catch (topErr) {
  console.log(JSON.stringify({
    verdict: 'Runtime Error',
    passedTestCases: 0,
    totalTestCases: 0,
    executionTimeMs: 0,
    memoryKb: 0,
    error: topErr.stack || topErr.message,
    results: []
  }));
}
`;
}

function runJsCode({ userCode, functionName, testCases, isCustomInput = false, timeoutMs = 4000 }) {
  return new Promise((resolve) => {
    const fileId = uuidv4();
    const scriptPath = path.join(scratchDir, `eval_js_${fileId}.js`);
    const scriptContent = createJsRunnerScript(userCode, functionName, testCases, isCustomInput);

    fs.writeFileSync(scriptPath, scriptContent, 'utf-8');

    let isTimedOut = false;
    let stdoutData = '';
    let stderrData = '';

    const jsProcess = spawn('node', [scriptPath], {
      windowsHide: true
    });

    const timer = setTimeout(() => {
      isTimedOut = true;
      try { jsProcess.kill('SIGKILL'); } catch (e) {}
    }, timeoutMs);

    jsProcess.stdout.on('data', (d) => { stdoutData += d.toString(); });
    jsProcess.stderr.on('data', (d) => { stderrData += d.toString(); });

    jsProcess.on('close', () => {
      clearTimeout(timer);
      try { if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath); } catch (e) {}

      if (isTimedOut) {
        return resolve({
          verdict: 'Time Limit Exceeded',
          passedTestCases: 0,
          totalTestCases: testCases.length,
          executionTimeMs: timeoutMs,
          memoryKb: 0,
          error: `Time Limit Exceeded (${timeoutMs / 1000}s limit exceeded)`,
          results: []
        });
      }

      try {
        const jsonStart = stdoutData.indexOf('{');
        const jsonEnd = stdoutData.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const parsed = JSON.parse(stdoutData.substring(jsonStart, jsonEnd + 1));
          return resolve(parsed);
        } else {
          return resolve({
            verdict: 'Runtime Error',
            passedTestCases: 0,
            totalTestCases: testCases.length,
            executionTimeMs: 0,
            memoryKb: 0,
            error: stdoutData || stderrData || 'Unknown JavaScript execution error',
            results: []
          });
        }
      } catch (e) {
        return resolve({
          verdict: 'Runtime Error',
          passedTestCases: 0,
          totalTestCases: testCases.length,
          executionTimeMs: 0,
          memoryKb: 0,
          error: `Execution error: ${stdoutData || stderrData}`,
          results: []
        });
      }
    });

    jsProcess.on('error', (err) => {
      clearTimeout(timer);
      try { if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath); } catch (e) {}
      resolve({
        verdict: 'Runtime Error',
        passedTestCases: 0,
        totalTestCases: testCases.length,
        executionTimeMs: 0,
        memoryKb: 0,
        error: `Failed to spawn Node process: ${err.message}`,
        results: []
      });
    });
  });
}

module.exports = {
  runJsCode
};
