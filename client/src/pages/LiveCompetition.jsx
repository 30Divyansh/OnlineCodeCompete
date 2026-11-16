import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import { 
  Users, 
  Swords, 
  Trophy, 
  Flame, 
  Search, 
  Clock, 
  Check, 
  X, 
  ShieldAlert, 
  Zap, 
  Filter,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function LiveCompetition() {
  const { socket } = useSocket();
  const { currentUser } = useUser();
  const navigate = useNavigate();

  const [lobbyStats, setLobbyStats] = useState({
    playersOnline: 0,
    playersAvailable: 0,
    activeBattles: 0
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Available' | 'In Competition'

  // Invitation tracking state for the challenger
  const [pendingChallenge, setPendingChallenge] = useState(null); // { toUser, inviteId, timeLeft }
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch initial lobby status
  useEffect(() => {
    fetch('/api/lobby/live-users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLobbyStats(data.stats);
          setOnlineUsers(data.users);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch lobby:', err);
        setLoading(false);
      });
  }, []);

  // Socket presence and challenge listeners
  useEffect(() => {
    if (!socket || !currentUser) return;

    // Register active user in presence system
    socket.emit('register_presence', { user: currentUser });

    const handleLobbyUpdate = (data) => {
      if (data.stats) setLobbyStats(data.stats);
      if (data.users) setOnlineUsers(data.users);
    };

    const handleChallengeSentSuccess = ({ invite }) => {
      setPendingChallenge({
        inviteId: invite.id,
        toUser: invite.toUser,
        timeLeft: 30
      });
      setStatusMessage(null);
    };

    const handleChallengeAccepted = ({ roomCode }) => {
      setPendingChallenge(null);
      navigate(`/matchmaking/${roomCode}`);
    };

    const handleChallengeDeclined = ({ opponentName, message }) => {
      setPendingChallenge(null);
      setStatusMessage({
        type: 'error',
        text: message || `${opponentName} declined the challenge.`
      });
      setTimeout(() => setStatusMessage(null), 5000);
    };

    const handleChallengeError = ({ message }) => {
      setPendingChallenge(null);
      setStatusMessage({
        type: 'error',
        text: message || 'Could not send challenge.'
      });
      setTimeout(() => setStatusMessage(null), 5000);
    };

    socket.on('lobby_update', handleLobbyUpdate);
    socket.on('challenge_sent_success', handleChallengeSentSuccess);
    socket.on('challenge_accepted', handleChallengeAccepted);
    socket.on('challenge_declined', handleChallengeDeclined);
    socket.on('challenge_error', handleChallengeError);

    return () => {
      socket.off('lobby_update', handleLobbyUpdate);
      socket.off('challenge_sent_success', handleChallengeSentSuccess);
      socket.off('challenge_accepted', handleChallengeAccepted);
      socket.off('challenge_declined', handleChallengeDeclined);
      socket.off('challenge_error', handleChallengeError);
    };
  }, [socket, currentUser, navigate]);

  // Countdown for sent challenge
  useEffect(() => {
    if (!pendingChallenge) return;

    const interval = setInterval(() => {
      setPendingChallenge(prev => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          clearInterval(interval);
          setStatusMessage({
            type: 'info',
            text: `Challenge to ${prev.toUser?.username} expired without a response.`
          });
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingChallenge]);

  const handleSendChallenge = (targetUser) => {
    if (!socket || !currentUser) return;
    socket.emit('send_challenge', { toUserId: targetUser.id });
  };

  const handleCancelSentChallenge = () => {
    if (!socket || !pendingChallenge) return;
    socket.emit('cancel_challenge', { inviteId: pendingChallenge.inviteId });
    setPendingChallenge(null);
  };

  const openSecondPlayerTab = () => {
    const url = `${window.location.origin}/live?user=sarah`;
    window.open(url, '_blank');
  };

  // Filter users
  const filteredUsers = onlineUsers.filter(u => {
    if (statusFilter === 'Available' && u.status !== 'available') return false;
    if (statusFilter === 'In Competition' && u.status !== 'in_competition') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.username.toLowerCase().includes(q) || (u.displayName && u.displayName.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div style={{ flex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Top Header & Real-Time Presence Counters */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--color-easy)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-easy)', display: 'inline-block' }} />
                  LIVE MULTIPLAYER LOBBY
                </div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Live Competition &amp; Opponent Matchmaking</h1>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                See who is online right now. Select any available programmer and challenge them to a head-to-head coding duel.
              </p>
            </div>

            <button onClick={openSecondPlayerTab} className="btn btn-secondary btn-sm" title="Open 2nd player tab">
              <ExternalLink size={14} />
              Open Player 2 Window
            </button>
          </div>

          {/* Counters Banner: Players Online | Available | Active Battles */}
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PLAYERS ONLINE</div>
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVAILABLE TO DUEL</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-easy)' }}>
                  {lobbyStats.playersAvailable}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-hard)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Swords size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE BATTLES</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {lobbyStats.activeBattles}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Notification Toast if challenge was declined/expired */}
        {statusMessage && (
          <div style={{
            background: statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
            border: `1px solid ${statusMessage.type === 'error' ? 'var(--color-hard)' : 'var(--border-color)'}`,
            color: statusMessage.type === 'error' ? 'var(--color-hard)' : 'var(--text-primary)',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem'
          }}>
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} style={{ color: 'inherit' }}><X size={16} /></button>
          </div>
        )}

        {/* Pending Sent Challenge Banner */}
        {pendingChallenge && (
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
                  Challenge Sent to <span style={{ color: 'var(--accent-primary)' }}>{pendingChallenge.toUser?.username}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Waiting for response... Auto-cancels in {pendingChallenge.timeLeft}s
                </div>
              </div>
            </div>

            <button onClick={handleCancelSentChallenge} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-hard)' }}>
              <X size={14} /> Cancel Challenge
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            minWidth: '260px'
          }}>
            <Search size={15} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search live player..."
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

          {/* Status Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {['All', 'Available', 'In Competition'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  fontWeight: statusFilter === st ? 600 : 500,
                  background: statusFilter === st ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid ' + (statusFilter === st ? 'var(--accent-primary)' : 'var(--border-color)')
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Live Players Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: '1rem'
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Detecting online competitors...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No live players found matching filter.
            </div>
          ) : (
            filteredUsers.map(user => {
              const isMe = user.id === currentUser.id;
              const isAvailable = user.status === 'available';
              const isInBattle = user.status === 'in_competition';
              const isChallengingThisUser = pendingChallenge?.toUser?.id === user.id;

              return (
                <div
                  key={user.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: `1px solid ${isMe ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <div>
                    {/* Top Status & Avatar Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ position: 'relative' }}>
                          <img
                            src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                            alt={user.username}
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
                            {user.username}
                            {isMe && <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', marginLeft: '0.4rem' }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {user.displayName || 'Programmer'}
                          </div>
                        </div>
                      </div>

                      {/* Availability Badge */}
                      {isAvailable ? (
                        <span className="badge badge-easy" style={{ gap: '0.25rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-easy)' }} />
                          Available
                        </span>
                      ) : isInBattle ? (
                        <span className="badge badge-medium" style={{ gap: '0.25rem' }}>
                          <Swords size={12} />
                          In Battle
                        </span>
                      ) : (
                        <span className="badge badge-category">
                          Away
                        </span>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      background: 'var(--bg-tertiary)',
                      padding: '0.65rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      textAlign: 'center',
                      marginBottom: '1rem',
                      fontSize: '0.75rem'
                    }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Rating</div>
                        <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                          {user.rating || 1500}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Duels</div>
                        <div style={{ fontWeight: 600 }}>{user.competitions || 0}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Wins</div>
                        <div style={{ fontWeight: 600, color: 'var(--color-easy)' }}>{user.wins || 0}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Win %</div>
                        <div style={{ fontWeight: 600 }}>{user.winRate || 0}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Challenge Action Button */}
                  <div>
                    {isMe ? (
                      <button className="btn btn-secondary" disabled style={{ width: '100%', fontSize: '0.8rem' }}>
                        Your Profile
                      </button>
                    ) : isChallengingThisUser ? (
                      <button className="btn btn-secondary" disabled style={{ width: '100%', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                        <Clock size={14} className="spin" /> Invitation Sent ({pendingChallenge.timeLeft}s)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendChallenge(user)}
                        disabled={!isAvailable || pendingChallenge !== null}
                        className="btn btn-primary"
                        style={{ width: '100%', fontWeight: 600, fontSize: '0.85rem' }}
                      >
                        <Swords size={15} />
                        {isAvailable ? 'Challenge to Duel' : 'Currently in Duel'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
