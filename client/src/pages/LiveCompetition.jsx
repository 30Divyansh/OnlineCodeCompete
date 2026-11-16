import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import SendChallengeModal from '../components/SendChallengeModal';
import { 
  Users, 
  Swords, 
  Trophy, 
  Clock, 
  X, 
  Zap, 
  Search, 
  User, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function LiveCompetition() {
  const { socket } = useSocket();
  const { currentUser } = useUser();
  const navigate = useNavigate();

  const [lobbyStats, setLobbyStats] = useState({
    playersOnline: 0,
    availablePlayers: 0,
    playersCompeting: 0
  });
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Selected opponent for sending challenge
  const [opponentToChallenge, setOpponentToChallenge] = useState(null);
  
  // Pending sent challenge tracking
  const [pendingSentChallenge, setPendingSentChallenge] = useState(null);
  const [statusNotice, setStatusNotice] = useState(null);

  // Fetch initial lobby status via REST
  useEffect(() => {
    fetch('/api/lobby/live-users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLobbyStats(data.stats);
          setOnlinePlayers(data.users);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load live players:', err);
        setLoading(false);
      });
  }, []);

  // Real-time socket events
  useEffect(() => {
    if (!socket || !currentUser) return;

    // Join / presence registration
    socket.emit('player:join', currentUser);

    const handlePlayersUpdate = (data) => {
      if (data.stats) setLobbyStats(data.stats);
      if (data.players) setOnlinePlayers(data.players);
    };

    const handleChallengeSent = ({ challenge }) => {
      setPendingSentChallenge({
        inviteId: challenge.id,
        toPlayer: challenge.toPlayer,
        problemTitle: challenge.problemTitle,
        timeLeft: 30
      });
      setStatusNotice(null);
    };

    const handleChallengeAccepted = ({ roomCode }) => {
      setPendingSentChallenge(null);
      navigate(`/workspace/${roomCode}`);
    };

    const handleChallengeDeclined = ({ opponentName, message }) => {
      setPendingSentChallenge(null);
      setStatusNotice({
        type: 'error',
        text: message || `${opponentName} declined the challenge.`
      });
      setTimeout(() => setStatusNotice(null), 5000);
    };

    const handleChallengeExpired = ({ message }) => {
      setPendingSentChallenge(null);
      if (message) {
        setStatusNotice({
          type: 'info',
          text: message
        });
        setTimeout(() => setStatusNotice(null), 5000);
      }
    };

    const handleChallengeError = ({ message }) => {
      setPendingSentChallenge(null);
      setStatusNotice({
        type: 'error',
        text: message || 'Challenge failed.'
      });
      setTimeout(() => setStatusNotice(null), 5000);
    };

    socket.on('players:update', handlePlayersUpdate);
    socket.on('challenge:sent', handleChallengeSent);
    socket.on('challenge:accepted', handleChallengeAccepted);
    socket.on('challenge:declined', handleChallengeDeclined);
    socket.on('challenge:expired', handleChallengeExpired);
    socket.on('challenge:error', handleChallengeError);

    return () => {
      socket.off('players:update', handlePlayersUpdate);
      socket.off('challenge:sent', handleChallengeSent);
      socket.off('challenge:accepted', handleChallengeAccepted);
      socket.off('challenge:declined', handleChallengeDeclined);
      socket.off('challenge:expired', handleChallengeExpired);
      socket.off('challenge:error', handleChallengeError);
    };
  }, [socket, currentUser, navigate]);

  // Countdown timer for sent challenge
  useEffect(() => {
    if (!pendingSentChallenge) return;

    const timer = setInterval(() => {
      setPendingSentChallenge(prev => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          setStatusNotice({
            type: 'info',
            text: `Challenge to ${prev.toPlayer?.username} expired.`
          });
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingSentChallenge]);

  const handleSendChallengeWithProblem = (toPlayerId, problemId) => {
    if (!socket) return;
    socket.emit('challenge:send', {
      toPlayerId,
      problemId
    });
  };

  const handleCancelSentChallenge = () => {
    if (!socket || !pendingSentChallenge) return;
    socket.emit('challenge:cancel', { inviteId: pendingSentChallenge.inviteId });
    setPendingSentChallenge(null);
  };

  const openSecondBrowserTab = () => {
    const randomNames = ['Rahul', 'Priya', 'Kavya', 'Rohan', 'Amit', 'Sara', 'Dev'];
    const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const url = `${window.location.origin}/live?name=${chosenName}`;
    window.open(url, '_blank');
  };

  const filteredPlayers = onlinePlayers.filter(p => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.username.toLowerCase().includes(q) || (p.displayName && p.displayName.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div style={{ flex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        {/* Top Header Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--color-easy)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-easy)', display: 'inline-block' }} />
                  REAL-TIME LOBBY
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                LIVE PLAYERS – FIND YOUR OPPONENT
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Only actual connected users are displayed. Select an available player to choose a problem and send a direct duel challenge.
              </p>
            </div>

            <button onClick={openSecondBrowserTab} className="btn btn-secondary btn-sm" title="Open a second player in new tab">
              <ExternalLink size={14} />
              Open 2nd Player Window
            </button>
          </div>

          {/* Top Statistics Bar: Total Online | Available | Currently Competing */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            background: 'var(--bg-tertiary)',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-easy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PLAYERS ONLINE</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {lobbyStats.playersOnline}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVAILABLE PLAYERS</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-easy)' }}>
                  {lobbyStats.availablePlayers}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-hard)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Swords size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PLAYERS COMPETING</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {lobbyStats.playersCompeting}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Toast */}
        {statusNotice && (
          <div style={{
            background: statusNotice.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
            border: `1px solid ${statusNotice.type === 'error' ? 'var(--color-hard)' : 'var(--border-color)'}`,
            color: statusNotice.type === 'error' ? 'var(--color-hard)' : 'var(--text-primary)',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem'
          }}>
            <span>{statusNotice.text}</span>
            <button onClick={() => setStatusNotice(null)} style={{ color: 'inherit' }}><X size={16} /></button>
          </div>
        )}

        {/* Active Challenge Sent Banner */}
        {pendingSentChallenge && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--accent-primary)',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-primary)' }} className="pulse-match" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  Challenge Sent to <span style={{ color: 'var(--accent-primary)' }}>{pendingSentChallenge.toPlayer?.username}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Selected Problem: <strong>{pendingSentChallenge.problemTitle}</strong> • Auto-cancels in {pendingSentChallenge.timeLeft}s
                </div>
              </div>
            </div>

            <button onClick={handleCancelSentChallenge} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-hard)' }}>
              <X size={14} /> Cancel Challenge
            </button>
          </div>
        )}

        {/* Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            minWidth: '280px'
          }}>
            <Search size={15} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search connected player..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredPlayers.length}</strong> real connected visitor(s)
          </div>
        </div>

        {/* Players Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: '1rem'
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Checking active connections...
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '3rem 1.5rem',
              textAlign: 'center'
            }}>
              <Users size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                No Other Players Online
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                You are currently the only player in the live lobby. Open a second browser tab or share this link to challenge another player!
              </p>
              <button onClick={openSecondBrowserTab} className="btn btn-primary btn-sm">
                <ExternalLink size={14} /> Open 2nd Player Window
              </button>
            </div>
          ) : (
            filteredPlayers.map(player => {
              const isMe = currentUser && player.id === currentUser.id;
              const isOnline = player.status === 'ONLINE';
              const isInBattle = player.status === 'IN COMPETITION';

              return (
                <div
                  key={player.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: `1px solid ${isMe ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    {/* Player Info Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ position: 'relative' }}>
                          <img
                            src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(player.username)}`}
                            alt={player.username}
                            style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg-tertiary)' }}
                          />
                          {/* Green LIVE dot */}
                          <span style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#10b981',
                            border: '2px solid var(--bg-secondary)'
                          }} />
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {player.username}
                            {isMe && <span style={{ color: 'var(--accent-primary)', fontSize: '0.725rem', marginLeft: '0.4rem' }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Rating: <strong style={{ color: 'var(--accent-primary)' }}>{player.rating || 1500}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Availability Badge */}
                      {isOnline ? (
                        <span className="badge badge-easy" style={{ gap: '0.25rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-easy)' }} />
                          ONLINE
                        </span>
                      ) : (
                        <span className="badge badge-medium" style={{ gap: '0.25rem' }}>
                          <Swords size={12} />
                          IN COMPETITION
                        </span>
                      )}
                    </div>

                    {/* Stats summary */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      background: 'var(--bg-tertiary)',
                      padding: '0.6rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      textAlign: 'center',
                      marginBottom: '1rem',
                      fontSize: '0.75rem'
                    }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Played</div>
                        <div style={{ fontWeight: 600 }}>{player.competitions || 0}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>W / L</div>
                        <div style={{ fontWeight: 600 }}>
                          <span style={{ color: 'var(--color-easy)' }}>{player.wins || 0}</span> / <span style={{ color: 'var(--color-hard)' }}>{player.losses || 0}</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Win Rate</div>
                        <div style={{ fontWeight: 600 }}>{player.winRate || 0}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row: View Profile and Challenge button */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem' }}>
                    <Link
                      to={`/profile/${player.id}`}
                      className="btn btn-secondary btn-sm"
                      title="View Profile"
                    >
                      <User size={14} /> Profile
                    </Link>

                    {isMe ? (
                      <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.7 }}>
                        Your Profile
                      </button>
                    ) : (
                      <button
                        onClick={() => setOpponentToChallenge(player)}
                        disabled={!isOnline || pendingSentChallenge !== null}
                        className="btn btn-primary btn-sm"
                        style={{ fontWeight: 600 }}
                      >
                        <Swords size={14} />
                        {isOnline ? 'Challenge' : 'In Competition'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Challenge Modal with Problem Selection (30 Questions) */}
      <SendChallengeModal
        isOpen={opponentToChallenge !== null}
        onClose={() => setOpponentToChallenge(null)}
        opponent={opponentToChallenge}
        onSendChallenge={handleSendChallengeWithProblem}
      />
    </div>
  );
}
