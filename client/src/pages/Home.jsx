import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  Swords, 
  Play, 
  Users, 
  ArrowRight, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Code2, 
  Clock, 
  Cpu,
  Bot
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [roomInput, setRoomInput] = useState('');
  const [recentDuels, setRecentDuels] = useState([]);

  useEffect(() => {
    fetch('/api/competitions')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.competitions) {
          setRecentDuels(data.competitions.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateDuel = () => {
    const code = 'DUEL-' + Math.floor(1000 + Math.random() * 9000);
    navigate(`/matchmaking/${code}`);
  };

  const handleJoinDuel = (e) => {
    e.preventDefault();
    if (roomInput.trim()) {
      const formatted = roomInput.trim().toUpperCase();
      navigate(`/matchmaking/${formatted}`);
    }
  };

  const handlePlayBot = () => {
    const code = 'BOT-' + Math.floor(1000 + Math.random() * 9000);
    navigate(`/matchmaking/${code}?bot=true`);
  };

  return (
    <div style={{ flex: 1, paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '3.5rem 0'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '860px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            padding: '0.3rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}>
            <Zap size={14} />
            Real-Time 1v1 Competitive Programming Platform
          </div>

          <h1 style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            marginBottom: '1.25rem',
            color: 'var(--text-primary)'
          }}>
            Outcode Your Opponent in <span style={{ color: 'var(--accent-primary)' }}>Real-Time 1v1 Duels</span>
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            lineHeight: 1.6
          }}>
            Browse live online programmers in the multiplayer lobby, challenge any available player, align on a problem from the 30 standard algorithmic library, and battle simultaneously in Python 3, C++, JavaScript, or Java.
          </p>

          {/* Action Box */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <Link
              to="/live"
              className="btn btn-primary btn-lg"
              style={{ minWidth: '200px' }}
            >
              <Users size={20} />
              Find Live Opponents
            </Link>

            <button
              onClick={handleCreateDuel}
              className="btn btn-secondary btn-lg"
              style={{ minWidth: '180px' }}
            >
              <Swords size={20} />
              Create Duel Room
            </button>
          </div>

          {/* Join with Room Code */}
          <form 
            onSubmit={handleJoinDuel} 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: 'var(--bg-tertiary)', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              padding: '0.35rem 0.5rem',
              maxWidth: '360px',
              width: '100%'
            }}
          >
            <input
              type="text"
              placeholder="Enter Room Code (e.g. DUEL-4821)"
              value={roomInput}
              onChange={e => setRoomInput(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '0.4rem 0.6rem',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <button type="submit" className="btn btn-secondary btn-sm" disabled={!roomInput.trim()}>
              Join Room
            </button>
          </form>
        </div>
      </div>

      {/* 4-Step Match Workflow Section */}
      <div className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            How CodeDuel Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Live player discovery and dynamic question matching guarantee fair head-to-head competition.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Step 1 */}
          <div className="card">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '1rem'
            }}>
              1
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Find Live Opponent
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Browse the real-time online lobby. Select any available programmer and send a 30-second duel challenge.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '1rem'
            }}>
              2
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Select Same Problem
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Both competitors independently pick a challenge from 30 standard algorithmic questions until matching.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '1rem'
            }}>
              3
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Live Coding Battle
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Write solutions in Python 3, C++, JavaScript, or Java. See live opponent test progress while keeping code hidden.
            </p>
          </div>

          {/* Step 4 */}
          <div className="card">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '1rem'
            }}>
              4
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Evaluation & Winner
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Backend sandbox tests all hidden test cases. Scores compare correctness, execution time (ms), and memory (KB) to declare the winner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
