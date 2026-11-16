import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Play, 
  Send, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Terminal, 
  Trophy, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  FileText, 
  Activity,
  ShieldAlert,
  Flame,
  Check,
  Zap,
  Code2
} from 'lucide-react';

export default function Workspace() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { currentUser } = useUser();
  const { theme } = useTheme();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomState, setRoomState] = useState(null);
  
  // Selected language
  const [language, setLanguage] = useState('python'); // 'python' | 'cpp' | 'javascript' | 'java'
  const [code, setCode] = useState('');
  
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcase');
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  
  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [opponentToast, setOpponentToast] = useState(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(900);
  const timerRef = useRef(null);

  const getStarterCodeForLang = (prob, lang) => {
    if (!prob) return '';
    if (lang === 'cpp') return prob.starterCodeCpp || `// C++ Solution for ${prob.title}\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Implement solution\n};\n`;
    if (lang === 'javascript') return prob.starterCodeJs || `// JavaScript Solution for ${prob.title}\nvar ${prob.functionName} = function(...args) {\n    // Write your code here\n};\n`;
    if (lang === 'java') return prob.starterCodeJava || `// Java Solution for ${prob.title}\nimport java.util.*;\n\nclass Solution {\n    // Implement solution\n}\n`;
    return prob.starterCode || '';
  };

  // Load problem details & room state
  useEffect(() => {
    fetch(`/api/competitions/${roomCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.competition) {
          setRoomState(data.competition);
          const probId = data.competition.problemId;
          if (probId) {
            fetch(`/api/problems/${probId}`)
              .then(pRes => pRes.json())
              .then(pData => {
                if (pData.success && pData.problem) {
                  setProblem(pData.problem);
                  setCode(getStarterCodeForLang(pData.problem, 'python'));
                  if (pData.problem.sampleTestCases?.length > 0) {
                    setCustomInputText(JSON.stringify(pData.problem.sampleTestCases[0].input));
                  }
                }
                setLoading(false);
              });
          }
        }
      })
      .catch(err => {
        console.error('Failed to load competition:', err);
        setLoading(false);
      });
  }, [roomCode]);

  // Handle switching language
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem) {
      setCode(getStarterCodeForLang(problem, newLang));
    }
  };

  // Synchronized countdown timer
  useEffect(() => {
    if (!roomState?.startedAt) return;

    const startTimestamp = new Date(roomState.startedAt).getTime();
    const durationMs = (roomState.durationSeconds || 900) * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTimestamp;
      const remainingSec = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
      setTimeLeft(remainingSec);

      if (remainingSec <= 0) {
        clearInterval(timerRef.current);
        handleEndCompetition();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => clearInterval(timerRef.current);
  }, [roomState?.startedAt, roomState?.durationSeconds]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !roomCode) return;

    socket.emit('join_room', { roomCode, user: currentUser });

    socket.on('room_state', (state) => {
      setRoomState(state);
      if (state.status === 'completed') {
        navigate(`/results/${roomCode}`);
      }
    });

    socket.on('opponent_action', (data) => {
      setOpponentToast(data);
      setTimeout(() => setOpponentToast(null), 4000);
    });

    socket.on('competition_ended', (state) => {
      setRoomState(state);
      navigate(`/results/${roomCode}`);
    });

    return () => {
      socket.off('room_state');
      socket.off('opponent_action');
      socket.off('competition_ended');
    };
  }, [socket, roomCode, currentUser, navigate]);

  const handleEndCompetition = () => {
    if (!socket || !roomCode) return;
    socket.emit('finish_competition', { roomCode });
  };

  // Run Code
  const handleRunCode = async () => {
    if (!problem || isRunning) return;
    setIsRunning(true);
    setActiveConsoleTab('result');

    socket?.emit('run_code_activity', { roomCode, userId: currentUser.id });

    try {
      const res = await fetch('/api/submissions/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          language,
          customInput: isCustomInput ? customInputText : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setRunResult(data.data);
      }
    } catch (err) {
      console.error('Run code error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code
  const handleSubmitCode = async () => {
    if (!problem || isSubmitting) return;
    setIsSubmitting(true);
    setActiveConsoleTab('result');

    try {
      const res = await fetch('/api/submissions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          userId: currentUser.id,
          username: currentUser.username,
          code,
          language,
          roomCode
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitResult(data.submission);
        setSubmissionsList(prev => [data.submission, ...prev]);

        socket?.emit('submit_code_result', {
          roomCode,
          userId: currentUser.id,
          result: data.submission
        });
      }
    } catch (err) {
      console.error('Submit code error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (problem) {
      setCode(getStarterCodeForLang(problem, language));
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const player1 = roomState?.player1;
  const player2 = roomState?.player2;
  const isP1 = player1?.userId === currentUser.id;

  if (loading || !problem) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="badge badge-medium" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Loading Coding Workspace...
          </div>
        </div>
      </div>
    );
  }

  let diffBadge = 'badge-easy';
  if (problem.difficulty === 'Medium') diffBadge = 'badge-medium';
  if (problem.difficulty === 'Hard') diffBadge = 'badge-hard';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 56px)',
      overflow: 'hidden',
      background: 'var(--bg-primary)'
    }}>
      {/* Top Workspace Header Bar */}
      <div style={{
        height: '46px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        fontSize: '0.85rem'
      }}>
        {/* Left: Problem Title & Difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {problem.title}
          </span>
          <span className={`badge ${diffBadge}`}>{problem.difficulty}</span>
          <span className="badge badge-category">{problem.category}</span>
        </div>

        {/* Center: Synchronized Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: timeLeft < 120 ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-tertiary)',
          color: timeLeft < 120 ? 'var(--color-hard)' : 'var(--text-primary)',
          padding: '0.25rem 0.75rem',
          borderRadius: '6px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          border: '1px solid ' + (timeLeft < 120 ? 'var(--color-hard)' : 'var(--border-color)')
        }}>
          <Clock size={15} />
          {formatTime(timeLeft)}
        </div>

        {/* Right: Room ID, Finish Duel button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            Room: {roomCode}
          </span>
          <button onClick={handleEndCompetition} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-hard)' }}>
            Finish Duel
          </button>
        </div>
      </div>

      {/* Opponent Real-Time Activity Toast */}
      {opponentToast && (
        <div style={{
          position: 'fixed',
          top: '65px',
          right: '20px',
          zIndex: 100,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--accent-primary)',
          borderRadius: '6px',
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.825rem',
          color: 'var(--text-primary)'
        }}>
          <Flame size={16} color="var(--accent-primary)" />
          {opponentToast.action === 'run_code' ? (
            <span><strong>{opponentToast.username}</strong> tested their code</span>
          ) : (
            <span>
              <strong>{opponentToast.username}</strong> submitted: {opponentToast.verdict} ({opponentToast.passedTestCases}/{opponentToast.totalTestCases} passed)
            </span>
          )}
        </div>
      )}

      {/* Main 3-Panel Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '360px 1fr 300px',
        height: 'calc(100% - 46px)',
        overflow: 'hidden'
      }}>
        {/* =========================================
            LEFT PANEL: Problem Description & Testcases
            ========================================= */}
        <div style={{
          borderRight: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-primary)'
          }}>
            <button
              onClick={() => setActiveLeftTab('description')}
              style={{
                flex: 1,
                padding: '0.55rem',
                fontSize: '0.8rem',
                fontWeight: activeLeftTab === 'description' ? 600 : 500,
                color: activeLeftTab === 'description' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'description' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                background: activeLeftTab === 'description' ? 'var(--bg-secondary)' : 'transparent'
              }}
            >
              Description
            </button>
            <button
              onClick={() => setActiveLeftTab('submissions')}
              style={{
                flex: 1,
                padding: '0.55rem',
                fontSize: '0.8rem',
                fontWeight: activeLeftTab === 'submissions' ? 600 : 500,
                color: activeLeftTab === 'submissions' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeLeftTab === 'submissions' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                background: activeLeftTab === 'submissions' ? 'var(--bg-secondary)' : 'transparent'
              }}
            >
              Submissions ({submissionsList.length})
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            fontSize: '0.875rem',
            lineHeight: 1.6
          }}>
            {activeLeftTab === 'description' ? (
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  {problem.title}
                </h2>

                <div style={{ color: 'var(--text-primary)', marginBottom: '1.25rem', whiteSpace: 'pre-wrap' }}>
                  {problem.description}
                </div>

                {problem.inputFormat && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      INPUT FORMAT
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{problem.inputFormat}</div>
                  </div>
                )}

                {problem.outputFormat && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      OUTPUT FORMAT
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{problem.outputFormat}</div>
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    EXAMPLES
                  </div>
                  {problem.sampleTestCases?.map((tc, idx) => (
                    <div key={idx} style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '0.75rem',
                      marginBottom: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Input: </span>
                        <span>{JSON.stringify(tc.input)}</span>
                      </div>
                      <div style={{ marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Output: </span>
                        <span>{JSON.stringify(tc.expected)}</span>
                      </div>
                      {tc.explanation && (
                        <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Explanation: </span>
                          {tc.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {problem.constraints?.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      CONSTRAINTS
                    </div>
                    <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {problem.constraints.map((c, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Your Submissions for this Duel
                </h3>
                {submissionsList.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                    No submissions yet. Click "Submit Code" to evaluate your solution against all test cases.
                  </div>
                ) : (
                  submissionsList.map((sub, idx) => {
                    const isAcc = sub.verdict === 'Accepted';
                    return (
                      <div key={idx} style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '0.65rem 0.85rem',
                        marginBottom: '0.6rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, color: isAcc ? 'var(--color-easy)' : 'var(--color-hard)', fontSize: '0.85rem' }}>
                            {sub.verdict}
                          </span>
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                            +{sub.score} pts
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                          <span>Lang: {sub.language?.toUpperCase()}</span>
                          <span>Passed: {sub.passedTestCases}/{sub.totalTestCases}</span>
                          <span>{sub.executionTimeMs} ms</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* =========================================
            CENTER PANEL: Multi-Language Code Editor
            ========================================= */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          background: 'var(--bg-primary)'
        }}>
          {/* Editor Header: Multi-Language Selector */}
          <div style={{
            height: '42px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 0.85rem',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Code2 size={16} color="var(--accent-primary)" />
              {/* Language Selector Dropdown */}
              <select
                value={language}
                onChange={e => handleLanguageChange(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '5px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="python">Python 3</option>
                <option value="cpp">C++ (G++ 17/20)</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="java">Java (JDK 21)</option>
              </select>

              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Write any algorithmic approach in your preferred language
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button onClick={handleResetCode} className="btn btn-secondary btn-sm" title="Reset starter code" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>

          {/* Monaco Code Editor with dynamic language mode */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : (language === 'javascript' ? 'javascript' : (language === 'java' ? 'java' : 'python'))}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(newVal) => setCode(newVal || '')}
              options={{
                fontSize: 13.5,
                fontFamily: 'Fira Code, Consolas, Courier New, monospace',
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                tabSize: 4,
                insertSpaces: true,
                automaticLayout: true,
                padding: { top: 10 }
              }}
            />
          </div>

          {/* Bottom Console: Testcase & Result */}
          <div style={{
            height: '240px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Console Tabs */}
            <div style={{
              height: '36px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 0.75rem',
              background: 'var(--bg-tertiary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setActiveConsoleTab('testcase')}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.78rem',
                    fontWeight: activeConsoleTab === 'testcase' ? 600 : 500,
                    color: activeConsoleTab === 'testcase' ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: activeConsoleTab === 'testcase' ? 'var(--bg-secondary)' : 'transparent',
                    borderRadius: '4px'
                  }}
                >
                  <Terminal size={13} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                  Testcase
                </button>
                <button
                  onClick={() => setActiveConsoleTab('result')}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.78rem',
                    fontWeight: activeConsoleTab === 'result' ? 600 : 500,
                    color: activeConsoleTab === 'result' ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: activeConsoleTab === 'result' ? 'var(--bg-secondary)' : 'transparent',
                    borderRadius: '4px'
                  }}
                >
                  Run Result
                </button>
              </div>

              {/* Action Buttons: Run Code and Submit Code */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 600 }}
                >
                  <Play size={13} />
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
                <button
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 600 }}
                >
                  <Send size={13} />
                  {isSubmitting ? 'Evaluating...' : 'Submit Code'}
                </button>
              </div>
            </div>

            {/* Console Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem' }}>
              {activeConsoleTab === 'testcase' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    {problem.sampleTestCases?.map((tc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsCustomInput(false);
                          setActiveTestCaseIndex(idx);
                        }}
                        style={{
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          background: !isCustomInput && activeTestCaseIndex === idx ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                          color: !isCustomInput && activeTestCaseIndex === idx ? 'var(--accent-primary)' : 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          fontWeight: !isCustomInput && activeTestCaseIndex === idx ? 600 : 400
                        }}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsCustomInput(true)}
                      style={{
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        background: isCustomInput ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                        color: isCustomInput ? 'var(--accent-primary)' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        fontWeight: isCustomInput ? 600 : 400
                      }}
                    >
                      Custom Testcase
                    </button>
                  </div>

                  {isCustomInput ? (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        Input parameters (JSON array or raw value):
                      </div>
                      <input
                        type="text"
                        value={customInputText}
                        onChange={e => setCustomInputText(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem'
                        }}
                      />
                    </div>
                  ) : (
                    problem.sampleTestCases?.[activeTestCaseIndex] && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Input =</div>
                        <div style={{ background: 'var(--bg-tertiary)', padding: '0.4rem 0.6rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
                          {JSON.stringify(problem.sampleTestCases[activeTestCaseIndex].input)}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Expected Output =</div>
                        <div style={{ background: 'var(--bg-tertiary)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                          {JSON.stringify(problem.sampleTestCases[activeTestCaseIndex].expected)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                /* Run Result View */
                <div>
                  {runResult || submitResult ? (
                    (() => {
                      const res = submitResult || runResult;
                      const isAcc = res.verdict === 'Accepted';
                      const isTLE = res.verdict === 'Time Limit Exceeded';
                      const isRE = res.verdict === 'Runtime Error';

                      let vColor = 'var(--color-easy)';
                      if (res.verdict === 'Wrong Answer') vColor = 'var(--color-hard)';
                      if (isTLE || isRE) vColor = 'var(--color-hard)';

                      return (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: vColor }}>
                                {res.verdict}
                              </span>
                              <span className="badge badge-category">
                                Passed: {res.passedTestCases}/{res.totalTestCases}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              <span>Runtime: <strong style={{ color: 'var(--text-primary)' }}>{res.executionTimeMs} ms</strong></span>
                              <span>Memory: <strong style={{ color: 'var(--text-primary)' }}>{res.memoryKb} KB</strong></span>
                              {res.score !== undefined && (
                                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                                  Score: {res.score} pts
                                </span>
                              )}
                            </div>
                          </div>

                          {res.error && (
                            <pre style={{
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid var(--color-hard)',
                              color: 'var(--color-hard)',
                              padding: '0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              overflowX: 'auto',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {res.error}
                            </pre>
                          )}

                          {res.results?.length > 0 && !res.error && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                              {res.results.slice(0, 3).map((r, i) => (
                                <div key={i} style={{
                                  background: 'var(--bg-tertiary)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '4px',
                                  padding: '0.45rem 0.65rem'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                    <span style={{ fontWeight: 600 }}>Testcase #{r.testCaseIndex} {r.hidden ? '(Hidden)' : ''}</span>
                                    <span style={{ color: r.passed ? 'var(--color-easy)' : 'var(--color-hard)', fontWeight: 700 }}>
                                      {r.passed ? '✓ Passed' : '✗ Failed'}
                                    </span>
                                  </div>
                                  {!r.hidden && (
                                    <div style={{ color: 'var(--text-secondary)' }}>
                                      <div>Actual: {JSON.stringify(r.actual)}</div>
                                      {r.expected !== undefined && <div>Expected: {JSON.stringify(r.expected)}</div>}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.85rem' }}>
                      Click "Run Code" to test against sample testcases, or "Submit Code" to evaluate against all test cases.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            RIGHT PANEL: Live Competition Dashboard
            ========================================= */}
        <div style={{
          borderLeft: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '38px',
            background: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 0.85rem',
            fontWeight: 700,
            fontSize: '0.8rem',
            gap: '0.5rem'
          }}>
            <Trophy size={14} color="var(--accent-primary)" />
            Live Competition Dashboard
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem' }}>
            {/* Player 1 Card */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: `1px solid ${isP1 ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              borderRadius: '6px',
              padding: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={player1?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=P1'}
                    alt="P1"
                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {player1?.username || 'Player 1'}
                    {isP1 && <span style={{ color: 'var(--accent-primary)', fontSize: '0.725rem', marginLeft: '0.3rem' }}>(You)</span>}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-primary)' }}>
                  {player1?.score || 0} pts
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Passed: {player1?.passedTestCases || 0}/{player1?.totalTestCases || 0}</span>
                <span>Submissions: {player1?.submissionCount || 0}</span>
                <span style={{ color: player1?.verdict === 'Accepted' ? 'var(--color-easy)' : 'var(--text-secondary)' }}>
                  {player1?.verdict || 'Coding'}
                </span>
              </div>
            </div>

            {/* Player 2 Card */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: `1px solid ${!isP1 ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              borderRadius: '6px',
              padding: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={player2?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=P2'}
                    alt="P2"
                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {player2?.username || 'Player 2'}
                    {!isP1 && <span style={{ color: 'var(--accent-primary)', fontSize: '0.725rem', marginLeft: '0.3rem' }}>(You)</span>}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-primary)' }}>
                  {player2?.score || 0} pts
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Passed: {player2?.passedTestCases || 0}/{player2?.totalTestCases || 0}</span>
                <span>Submissions: {player2?.submissionCount || 0}</span>
                <span style={{ color: player2?.verdict === 'Accepted' ? 'var(--color-easy)' : 'var(--text-secondary)' }}>
                  {player2?.verdict || 'Coding'}
                </span>
              </div>
            </div>

            {/* Live Progress Bar Comparison */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                SCORE COMPARISON
              </div>
              <div style={{
                height: '8px',
                background: 'var(--bg-tertiary)',
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex'
              }}>
                <div style={{
                  width: `${(player1?.score || 0) + (player2?.score || 0) === 0 ? 50 : ((player1?.score || 0) / ((player1?.score || 1) + (player2?.score || 1))) * 100}%`,
                  background: 'var(--accent-primary)',
                  transition: 'width 0.3s ease'
                }} />
                <div style={{
                  flex: 1,
                  background: 'var(--color-easy)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Activity Feed */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                DUEL ACTIVITY FEED
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {roomState?.activityFeed?.slice(-8).reverse().map((act, i) => (
                  <div key={i} style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '4px',
                    background: 'var(--bg-tertiary)',
                    borderLeft: `2px solid ${act.type === 'success' ? 'var(--color-easy)' : (act.type === 'warning' ? 'var(--color-hard)' : 'var(--border-color)')}`
                  }}>
                    <span style={{ color: 'var(--text-primary)' }}>{act.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
