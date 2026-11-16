import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Swords, Clock, Check, X, Award } from 'lucide-react';

export default function ChallengeModal() {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!socket) return;

    const handleChallengeReceived = (data) => {
      setIncomingInvite(data);
      setTimeLeft(data.expiresInSeconds || 30);
    };

    const handleChallengeAccepted = ({ roomCode }) => {
      setIncomingInvite(null);
      navigate(`/workspace/${roomCode}`);
    };

    const handleChallengeExpired = ({ inviteId }) => {
      if (incomingInvite && incomingInvite.inviteId === inviteId) {
        setIncomingInvite(null);
      }
    };

    socket.on('challenge:received', handleChallengeReceived);
    socket.on('challenge:accepted', handleChallengeAccepted);
    socket.on('challenge:expired', handleChallengeExpired);

    return () => {
      socket.off('challenge:received', handleChallengeReceived);
      socket.off('challenge:accepted', handleChallengeAccepted);
      socket.off('challenge:expired', handleChallengeExpired);
    };
  }, [socket, incomingInvite, navigate]);

  // 30s Countdown timer for invitation
  useEffect(() => {
    if (!incomingInvite) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIncomingInvite(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingInvite]);

  if (!incomingInvite) return null;

  const { challenger, inviteId, problemTitle, difficulty, category } = incomingInvite;

  const handleAccept = () => {
    if (!socket) return;
    socket.emit('challenge:accept', { inviteId });
  };

  const handleDecline = () => {
    if (!socket) return;
    socket.emit('challenge:decline', { inviteId });
    setIncomingInvite(null);
  };

  let diffBadge = 'badge-easy';
  if (difficulty === 'Medium') diffBadge = 'badge-medium';
  if (difficulty === 'Hard') diffBadge = 'badge-hard';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '2px solid var(--accent-primary)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '460px',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Animated Badge */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--accent-light)',
          color: 'var(--accent-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <Swords size={28} />
        </div>

        {/* Heading */}
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
          NEW CODING CHALLENGE!
        </h3>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          <strong>{challenger?.username}</strong> wants to compete with you.
        </p>

        {/* Challenge Problem Details Card */}
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.25rem',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>
            SELECTED PROBLEM
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {problemTitle}
            </div>
            <span className={`badge ${diffBadge}`}>{difficulty}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Category: {category}
          </div>
        </div>

        {/* Challenger Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          marginBottom: '1.25rem',
          background: 'var(--bg-primary)',
          padding: '0.6rem 0.85rem',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          textAlign: 'left'
        }}>
          <img
            src={challenger?.avatar}
            alt={challenger?.username}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Challenger: {challenger?.username}</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Rating: {challenger?.rating || 1500}</div>
          </div>
        </div>

        {/* Countdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: timeLeft <= 10 ? 'var(--color-hard)' : 'var(--text-muted)',
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-mono)'
        }}>
          <Clock size={16} />
          Auto-declines in {timeLeft}s
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button
            onClick={handleDecline}
            className="btn btn-secondary"
            style={{ fontWeight: 600 }}
          >
            <X size={16} />
            DECLINE
          </button>
          <button
            onClick={handleAccept}
            className="btn btn-success"
            style={{ fontWeight: 700 }}
          >
            <Check size={16} />
            ACCEPT CHALLENGE
          </button>
        </div>
      </div>
    </div>
  );
}
