import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import { 
  Swords, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Copy, 
  ExternalLink, 
  Bot, 
  Search, 
  Filter, 
  Check, 
  Play, 
  RefreshCw,
  Users
} from 'lucide-react';

export default function Matchmaking() {
  const { roomCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { currentUser } = useUser();

  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [roomState, setRoomState] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [countdown, setCountdown] = useState(null);

  const categories = [
    'All',
    'Arrays and Searching',
    'Sorting and Searching',
    'Dynamic Programming',
    'Trees and Graphs',
    'Greedy and Other Algorithms',
    'Stacks, Queues and Strings'
  ];

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  // Fetch all 30 problems
  useEffect(() => {
    fetch('/api/problems')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.problems) {
          setProblems(data.problems);
        }
        setLoadingProblems(false);
      })
      .catch(err => {
        console.error('Failed to load problems:', err);
        setLoadingProblems(false);
      });
  }, []);

  // Socket room connection
  useEffect(() => {
    if (!socket || !roomCode || !currentUser) return;

    socket.emit('join_room', {
      roomCode,
      user: currentUser
    });

    const isBotRequested = searchParams.get('bot') === 'true';
    if (isBotRequested) {
      setTimeout(() => {
        socket.emit('enable_bot', { roomCode });
      }, 500);
    }

    const handleRoomState = (state) => {
      setRoomState(state);
      if (state.status === 'in_progress') {
        navigate(`/workspace/${roomCode}`);
      }
    };

    const handleCompetitionStarted = (state) => {
      setRoomState(state);
      navigate(`/workspace/${roomCode}`);
    };

    const handleReadyForStart = () => {
      // Both ready!
    };

    socket.on('room_state', handleRoomState);
    socket.on('competition_started', handleCompetitionStarted);
    socket.on('ready_for_start', handleReadyForStart);

    return () => {
      socket.off('room_state', handleRoomState);
      socket.off('competition_started', handleCompetitionStarted);
      socket.off('ready_for_start', handleReadyForStart);
    };
  }, [socket, roomCode, currentUser, searchParams, navigate]);

  // Handle problem selection by current user
  const handleSelectProblem = (problemId) => {
    if (!socket || !roomCode) return;
    socket.emit('select_problem', {
      roomCode,
      userId: currentUser.id,
      problemId
    });
  };

  // Handle confirm ready
  const handleConfirmReady = () => {
    if (!socket || !roomCode) return;
    socket.emit('confirm_ready', {
      roomCode,
      userId: currentUser.id
    });
  };

  // Handle start competition
  const handleStartCompetition = () => {
    if (!socket || !roomCode) return;
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        socket.emit('start_competition', { roomCode });
      } else {
        setCountdown(count);
      }
    }, 900);
  };

  const handleEnableBot = () => {
    if (!socket || !roomCode) return;
    socket.emit('enable_bot', { roomCode });
  };

  const copyRoomLink = () => {
    const url = window.location.origin + `/matchmaking/${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openSecondPlayerTab = () => {
    const url = `${window.location.origin}/matchmaking/${roomCode}?user=sarah`;
    window.open(url, '_blank');
  };

  // Derive player info
  const player1 = roomState?.player1;
  const player2 = roomState?.player2;
  const isP1 = player1?.userId === currentUser.id;
  const isP2 = player2?.userId === currentUser.id;

  const mySelection = isP1 ? player1?.selectedProblemId : (isP2 ? player2?.selectedProblemId : null);
  const oppSelection = isP1 ? player2?.selectedProblemId : (isP2 ? player1?.selectedProblemId : null);

  const bothSelected = player1?.selectedProblemId && player2?.selectedProblemId;
  const isMatched = bothSelected && player1.selectedProblemId === player2.selectedProblemId;
  const isMismatch = bothSelected && player1.selectedProblemId !== player2.selectedProblemId;

  const matchedProblem = isMatched ? problems.find(p => p.id === player1.selectedProblemId) : null;
  const bothReady = isMatched && player1?.ready && player2?.ready;

  // Filter problems
  const filteredProblems = problems.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ flex: 1, padding: '1.5rem 0 3rem 0' }}>
      <div className="container">
        {/* Room Header & 2-Player Testing Controls */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: '0.05em'
            }}>
              {roomCode}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Matchmaking Duel Lobby</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Share this room code with your opponent or open a 2nd tab to test duel.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button onClick={copyRoomLink} className="btn btn-secondary btn-sm" title="Copy room link">
              <Copy size={14} />
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>

            <button onClick={openSecondPlayerTab} className="btn btn-secondary btn-sm" title="Open 2nd player tab">
              <ExternalLink size={14} />
              Open Player 2 Tab
            </button>

            {!player2 && (
              <button onClick={handleEnableBot} className="btn btn-primary btn-sm">
                <Bot size={14} />
                Add CodeDuel Bot
              </button>
            )}
          </div>
        </div>

        {/* Competitor Cards: Player 1 vs Player 2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          {/* Player 1 Card */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: `2px solid ${player1?.selectedProblemId ? 'var(--accent-primary)' : 'var(--border-color)'}`,
            borderRadius: '8px',
            padding: '1.1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src={player1?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=P1'}
                  alt="Player 1"
                  style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {player1 ? player1.username : 'Player 1 (Waiting...)'}
                    {isP1 && <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', marginLeft: '0.4rem' }}>(You)</span>}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Competitor 1</div>
                </div>
              </div>

              {player1?.ready && (
                <span className="badge badge-easy" style={{ gap: '0.25rem' }}>
                  <Check size={12} /> Ready
                </span>
              )}
            </div>

            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '0.6rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Selected: </span>
              {player1?.selectedProblemId ? (
                <strong style={{ color: 'var(--text-primary)' }}>
                  {problems.find(p => p.id === player1.selectedProblemId)?.title || player1.selectedProblemId}
                </strong>
              ) : (
                <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Choosing a problem...</span>
              )}
            </div>
          </div>

          {/* VS Badge */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            border: '2px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
            color: 'var(--accent-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            VS
          </div>

          {/* Player 2 Card */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: `2px solid ${player2?.selectedProblemId ? 'var(--accent-primary)' : 'var(--border-color)'}`,
            borderRadius: '8px',
            padding: '1.1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src={player2?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=P2'}
                  alt="Player 2"
                  style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {player2 ? player2.username : 'Waiting for Player 2...'}
                    {isP2 && <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', marginLeft: '0.4rem' }}>(You)</span>}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Competitor 2</div>
                </div>
              </div>

              {player2?.ready && (
                <span className="badge badge-easy" style={{ gap: '0.25rem' }}>
                  <Check size={12} /> Ready
                </span>
              )}
            </div>

            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '0.6rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Selected: </span>
              {player2?.selectedProblemId ? (
                <strong style={{ color: 'var(--text-primary)' }}>
                  {problems.find(p => p.id === player2.selectedProblemId)?.title || player2.selectedProblemId}
                </strong>
              ) : (
                <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Waiting for selection...</span>
              )}
            </div>
          </div>
        </div>

        {/* MATCHMAKING LOGIC ALERTS & CONFIRMATION BOX */}

        {/* 1. Mismatch State */}
        {isMismatch && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid var(--color-hard)',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <div style={{ color: 'var(--color-hard)', marginTop: '2px' }}>
              <AlertTriangle size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: 'var(--color-hard)', fontWeight: 700, marginBottom: '0.35rem' }}>
                Problem Selection Mismatch!
              </h4>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Both competitors must select the exact same algorithmic problem to duel. Current choices:
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                <li><strong>{player1.username}</strong> selected: <em>{problems.find(p => p.id === player1.selectedProblemId)?.title}</em></li>
                <li><strong>{player2.username}</strong> selected: <em>{problems.find(p => p.id === player2.selectedProblemId)?.title}</em></li>
              </ul>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Please choose the same problem from the library below to align your selection and unlock the battle.
              </p>
            </div>
          </div>
        )}

        {/* 2. Matched Confirmation Screen */}
        {isMatched && matchedProblem && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--color-easy)',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '1.75rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={24} color="var(--color-easy)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Both Players Selected: <span style={{ color: 'var(--color-easy)' }}>{matchedProblem.title}</span>
              </h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Category: <strong>{matchedProblem.category}</strong> | Difficulty: <strong>{matchedProblem.difficulty}</strong>. 
              Confirm your readiness below to begin the simultaneous coding battle!
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              background: 'var(--bg-tertiary)',
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              {/* Ready confirmation buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{player1?.username}:</span>
                  {player1?.ready ? (
                    <span className="badge badge-easy"><Check size={12} /> Confirmed</span>
                  ) : (
                    <span className="badge badge-category">Pending</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{player2?.username}:</span>
                  {player2?.ready ? (
                    <span className="badge badge-easy"><Check size={12} /> Confirmed</span>
                  ) : (
                    <span className="badge badge-category">Pending</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Confirm Ready button for active player */}
                {((isP1 && !player1?.ready) || (isP2 && !player2?.ready)) && (
                  <button onClick={handleConfirmReady} className="btn btn-primary btn-sm">
                    <Check size={16} />
                    Confirm &amp; Ready
                  </button>
                )}

                {/* Start Competition button (unlocked when both confirm) */}
                {bothReady && (
                  <button
                    onClick={handleStartCompetition}
                    className="btn btn-success btn-lg pulse-match"
                    style={{ fontWeight: 700 }}
                  >
                    <Play size={18} />
                    {countdown !== null ? `Starting in ${countdown}...` : 'START COMPETITION'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Waiting for other player to select */}
        {!bothSelected && mySelection && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <RefreshCw size={18} className="spin" color="var(--accent-primary)" />
            <div style={{ fontSize: '0.9rem' }}>
              You selected <strong>{problems.find(p => p.id === mySelection)?.title}</strong>. Waiting for your opponent to make their selection...
            </div>
          </div>
        )}

        {/* 30 Standard Algorithmic Problems Library */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Select Problem from Library ({problems.length} Standard Questions)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Click any problem to set your selection. Both competitors must choose the same problem to start the duel.
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            {/* Search Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              minWidth: '240px'
            }}>
              <Search size={15} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input
                type="text"
                placeholder="Search problem title or topic..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    borderRadius: '999px',
                    fontWeight: selectedCategory === cat ? 600 : 500,
                    background: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid ' + (selectedCategory === cat ? 'var(--accent-primary)' : 'var(--border-color)'),
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {difficulties.map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    borderRadius: '999px',
                    fontWeight: selectedDifficulty === diff ? 600 : 500,
                    background: selectedDifficulty === diff ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                    color: selectedDifficulty === diff ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: '1px solid ' + (selectedDifficulty === diff ? 'var(--accent-primary)' : 'var(--border-color)')
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Problem Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '0.85rem'
          }}>
            {filteredProblems.map(p => {
              const isSelectedByMe = mySelection === p.id;
              const isSelectedByOpp = oppSelection === p.id;
              const isBothSelected = isSelectedByMe && isSelectedByOpp;

              let badgeClass = 'badge-easy';
              if (p.difficulty === 'Medium') badgeClass = 'badge-medium';
              if (p.difficulty === 'Hard') badgeClass = 'badge-hard';

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProblem(p.id)}
                  style={{
                    background: isBothSelected 
                      ? 'var(--accent-light)' 
                      : (isSelectedByMe ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'),
                    border: isBothSelected 
                      ? '2px solid var(--color-easy)' 
                      : (isSelectedByMe ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)'),
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span className={`badge ${badgeClass}`}>{p.difficulty}</span>
                      <span className="badge badge-category">{p.category}</span>
                    </div>

                    <h4 style={{
                      fontSize: '0.975rem',
                      fontWeight: 600,
                      marginBottom: '0.35rem',
                      color: 'var(--text-primary)'
                    }}>
                      {p.title}
                    </h4>

                    <div style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: '0.75rem'
                    }}>
                      def {p.functionName}(...)
                    </div>
                  </div>

                  {/* Selection Status Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.75rem'
                  }}>
                    <div>
                      {isSelectedByMe && (
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                          ✓ Your Selection
                        </span>
                      )}
                      {isSelectedByOpp && !isSelectedByMe && (
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Opponent's Selection
                        </span>
                      )}
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.725rem',
                        background: isSelectedByMe ? 'var(--accent-primary)' : 'transparent',
                        color: isSelectedByMe ? '#ffffff' : 'var(--text-primary)'
                      }}
                    >
                      {isSelectedByMe ? 'Selected' : 'Select Problem'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
