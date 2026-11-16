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
            Select a problem from the standard 30-problem library. Once both competitors independently choose the same problem and confirm, race simultaneously to write, test, and submit your Python solution.
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
            <button
              onClick={handleCreateDuel}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '180px' }}
            >
              <Swords size={20} />
              Create Duel Room
            </button>

            <button
              onClick={handlePlayBot}
              className="btn btn-secondary btn-lg"
              style={{ minWidth: '180px' }}
            >
              <Bot size={20} />
              Play vs CodeDuel Bot
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
            Dynamic problem selection guarantees fair, simultaneous, and head-to-head competition.
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
              Independent Selection
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Both players browse all 30 algorithmic questions and independently pick a preferred challenge. No hardcoded order.
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
              Match Alignment Check
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              If selections differ, players are notified to align. When both choose the same problem, both confirm to start simultaneously.
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
              Write your own custom Python 3 solution. Test with sample inputs. Real-time updates show opponent progress while keeping code hidden.
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
              Backend sandbox tests edge & hidden cases. Scores compare correctness, execution time (ms), and memory (KB) to declare the winner.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Features / Specs Grid */}
      <div className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          padding: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                <Code2 size={20} />
                <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)' }}>30</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Standard Problems</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Arrays, DP, Graphs, Trees, Greedy, Stacks</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-easy)', marginBottom: '0.5rem' }}>
                <Clock size={20} />
                <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)' }}>&lt; 50ms</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Precision Timing</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>High-resolution time.perf_counter() metrics</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                <Cpu size={20} />
                <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Sandbox</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Safe Execution</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Isolated Python 3 process runner with TLE safety</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-medium)', marginBottom: '0.5rem' }}>
                <Trophy size={20} />
                <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)' }}>100+</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Dynamic Scoring</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Base correctness + speed and memory bonuses</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
