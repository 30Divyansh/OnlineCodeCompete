import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Swords, Clock, Check, X, Trophy } from 'lucide-react';

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
      navigate(`/matchmaking/${roomCode}`);
    };

    const handleChallengeCancelled = () => {
      setIncomingInvite(null);
    };

    socket.on('challenge_received', handleChallengeReceived);
    socket.on('challenge_accepted', handleChallengeAccepted);
    socket.on('challenge_cancelled', handleChallengeCancelled);

    return () => {
      socket.off('challenge_received', handleChallengeReceived);
      socket.off('challenge_accepted', handleChallengeAccepted);
      socket.off('challenge_cancelled', handleChallengeCancelled);
    };
  }, [socket, navigate]);

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

  const { challenger, inviteId } = incomingInvite;

  const handleAccept = () => {
    if (!socket) return;
    socket.emit('respond_challenge', {
      inviteId,
      accept: true
    });
  };

  const handleDecline = () => {
    if (!socket) return;
    socket.emit('respond_challenge', {
      inviteId,
      accept: false
    });
    setIncomingInvite(null);
  };

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
      zIndex: 9999,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '2px solid var(--accent-primary)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '440px',
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

        {/* Header */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
          Incoming Duel Challenge!
        </h3>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          You have been challenged to a live head-to-head coding competition.
        </p>

        {/* Challenger Card */}
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          marginBottom: '1.25rem',
          textAlign: 'left'
        }}>
          <img
            src={challenger?.avatar}
            alt={challenger?.username}
            style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid var(--accent-primary)' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {challenger?.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Rating: <strong style={{ color: 'var(--accent-primary)' }}>{challenger?.rating || 1500}</strong> • Win Rate: <strong>{challenger?.winRate || 0}%</strong>
            </div>
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
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="btn btn-success"
            style={{ fontWeight: 700 }}
          >
            <Check size={16} />
            Accept Challenge
          </button>
        </div>
      </div>
    </div>
  );
}
