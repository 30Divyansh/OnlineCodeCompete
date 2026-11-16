import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Swords, ArrowRight, Code2, Users, Trophy } from 'lucide-react';

export default function WelcomeScreen() {
  const { joinCompetition } = useUser();
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('Please enter your name to start competing.');
      return;
    }
    if (nameInput.trim().length > 20) {
      setError('Name must be 20 characters or less.');
      return;
    }
    joinCompetition(nameInput.trim());
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '2.5rem 2rem',
        maxWidth: '460px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center'
      }}>
        {/* Brand Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: '#ffffff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Swords size={28} strokeWidth={2.5} />
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '1.85rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBottom: '0.4rem',
          color: 'var(--text-primary)'
        }}>
          Welcome to CodeDuel
        </h1>

        {/* Subtitle */}
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          marginBottom: '2rem'
        }}>
          Enter your name and start competing with developers online.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-hard)',
              color: 'var(--color-hard)',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.4rem'
            }}>
              Enter Your Name
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Alex, Rahul, Sarah..."
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (error) setError('');
              }}
              style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border 0.15s ease'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', fontWeight: 700, gap: '0.5rem' }}
          >
            Join Competition
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Info badges */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <span>✓ No password required</span>
          <span>✓ Instant real-time duels</span>
        </div>
      </div>
    </div>
  );
}
