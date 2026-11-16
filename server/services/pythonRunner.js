const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const scratchDir = path.join(__dirname, '..', 'scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

/**
 * Generates the Python evaluation wrapper script
 */
function createPythonRunnerScript(userCode, functionName, testCases, isCustomInput = false) {
  // Serialize testcases safely
  const testCasesJson = JSON.stringify(testCases);

  return `
import sys
import json
import time
import tracemalloc
import traceback

def normalize_val(val):
    if isinstance(val, (tuple, list)):
        return [normalize_val(x) for x in val]
    if isinstance(val, float):
        return round(val, 5)
    return val

def deep_equal(a, b):
    na = normalize_val(a)
    nb = normalize_val(b)
    if isinstance(na, float) and isinstance(nb, float):
        return abs(na - nb) < 1e-5
    if isinstance(na, list) and isinstance(nb, list):
        if len(na) != len(nb):
            return False
        # If elements are lists, sort if applicable or compare element-by-element
        return na == nb
    return na == nb

# User code execution scope
user_scope = {}
code_str = ${JSON.stringify(userCode)}

try:
    exec(code_str, user_scope)
except Exception as e:
    tb = traceback.format_exc()
    # Filter internal traceback lines
    print(json.dumps({
        "verdict": "Runtime Error",
        "passedTestCases": 0,
        "totalTestCases": 0,
        "executionTimeMs": 0,
        "memoryKb": 0,
        "error": tb,
        "results": []
    }))
    sys.exit(0)

# Resolve target function
target_fn = None
fn_name = ${JSON.stringify(functionName)}

if fn_name in user_scope and callable(user_scope[fn_name]):
    target_fn = user_scope[fn_name]
elif 'Solution' in user_scope and hasattr(user_scope['Solution'], fn_name):
    sol_instance = user_scope['Solution']()
    target_fn = getattr(sol_instance, fn_name)
else:
    # Try finding any callable function in user_scope
    for k, v in user_scope.items():
        if not k.startswith('_') and callable(v):
            target_fn = v
            break

if not target_fn:
    print(json.dumps({
        "verdict": "Runtime Error",
        "passedTestCases": 0,
        "totalTestCases": 0,
        "executionTimeMs": 0,
        "memoryKb": 0,
        "error": f"Function '{fn_name}' not found. Please implement 'def {fn_name}(...)' in your solution.",
        "results": []
    }))
    sys.exit(0)

test_cases = json.loads(${JSON.stringify(testCasesJson)})
results = []
passed_count = 0
total_time_ms = 0.0
peak_mem_kb = 0.0

is_custom = ${isCustomInput ? 'True' : 'False'}

for idx, tc in enumerate(test_cases):
    args = tc.get('input', [])
    expected = tc.get('expected', None)
    is_hidden = tc.get('hidden', False)
    
    tracemalloc.start()
    t_start = time.perf_counter()
    err_str = None
    actual = None
    
    try:
        if isinstance(args, list):
            actual = target_fn(*args)
        else:
            actual = target_fn(args)
    except Exception as e:
        err_str = traceback.format_exc()
    
    t_end = time.perf_counter()
    current_mem, peak_mem = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    
    dur_ms = round((t_end - t_start) * 1000.0, 2)
    total_time_ms += dur_ms
    mem_kb = round(peak_mem / 1024.0, 2)
    if mem_kb > peak_mem_kb:
        peak_mem_kb = mem_kb

    if err_str:
        results.append({
            "testCaseIndex": idx + 1,
            "hidden": is_hidden,
            "passed": False,
            "error": err_str,
            "timeMs": dur_ms,
            "memoryKb": mem_kb
        })
        break
    
    if is_custom:
        results.append({
            "testCaseIndex": idx + 1,
            "hidden": False,
            "passed": True,
            "input": args,
            "actual": actual,
            "timeMs": dur_ms,
            "memoryKb": mem_kb
        })
        passed_count += 1
    else:
        is_correct = deep_equal(actual, expected)
        if is_correct:
            passed_count += 1
            
        res_obj = {
            "testCaseIndex": idx + 1,
            "hidden": is_hidden,
            "passed": is_correct,
            "timeMs": dur_ms,
            "memoryKb": mem_kb
        }
        
        if not is_hidden:
            res_obj["input"] = args
            res_obj["expected"] = expected
            res_obj["actual"] = actual
        else:
            if not is_correct:
                res_obj["message"] = "Hidden testcase failed"

        results.append(res_obj)
        if not is_correct and not is_custom:
            # Stop at first failed test case if needed or continue
            pass

total_tc = len(test_cases)
if any(r.get('error') for r in results):
    verdict = "Runtime Error"
elif passed_count == total_tc:
    verdict = "Accepted"
else:
    verdict = "Wrong Answer"

avg_or_total_time = round(total_time_ms, 2)

print(json.dumps({
    "verdict": verdict,
    "passedTestCases": passed_count,
    "totalTestCases": total_tc,
    "executionTimeMs": avg_or_total_time,
    "memoryKb": peak_mem_kb,
    "error": None,
    "results": results
}))
`;
}

/**
 * Execute python code against test cases with timeout enforcement
 */
function runPythonCode({ userCode, functionName, testCases, isCustomInput = false, timeoutMs = 4000 }) {
  return new Promise((resolve) => {
    const fileId = uuidv4();
    const scriptPath = path.join(scratchDir, `eval_${fileId}.py`);
    const scriptContent = createPythonRunnerScript(userCode, functionName, testCases, isCustomInput);

    fs.writeFileSync(scriptPath, scriptContent, 'utf-8');

    let isTimedOut = false;
    let stdoutData = '';
    let stderrData = '';

    const pyProcess = spawn('python', [scriptPath], {
      windowsHide: true
    });

    const timer = setTimeout(() => {
      isTimedOut = true;
      try {
        pyProcess.kill('SIGKILL');
      } catch (e) {}
    }, timeoutMs);

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', (code) => {
      clearTimeout(timer);

      // Clean up temp file
      try {
        if (fs.existsSync(scriptPath)) {
          fs.unlinkSync(scriptPath);
        }
      } catch (e) {}

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

      if (stderrData && !stdoutData) {
        return resolve({
          verdict: 'Runtime Error',
          passedTestCases: 0,
          totalTestCases: testCases.length,
          executionTimeMs: 0,
          memoryKb: 0,
          error: stderrData.trim(),
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
            error: stdoutData || stderrData || 'Unknown Python execution error',
            results: []
          });
        }
      } catch (parseErr) {
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

    pyProcess.on('error', (err) => {
      clearTimeout(timer);
      try {
        if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
      } catch (e) {}
      resolve({
        verdict: 'Runtime Error',
        passedTestCases: 0,
        totalTestCases: testCases.length,
        executionTimeMs: 0,
        memoryKb: 0,
        error: `Failed to spawn Python process: ${err.message}`,
        results: []
      });
    });
  });
}

module.exports = {
  runPythonCode
};
