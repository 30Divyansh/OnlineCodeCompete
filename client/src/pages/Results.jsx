import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useUser } from '../context/UserContext';
import { 
  Trophy, 
  Swords, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  RotateCcw, 
  Award, 
  BarChart3, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function Results() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/competitions/${roomCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.competition) {
          setCompetition(data.competition);
          // If current user is winner, trigger confetti!
          if (data.competition.winnerUserId === currentUser.id) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load results:', err);
        setLoading(false);
      });
  }, [roomCode, currentUser]);

  if (loading || !competition) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Competition Results...
        </div>
      </div>
    );
  }

  const p1 = competition.player1 || {};
  const p2 = competition.player2 || {};
  const isWinnerP1 = competition.winnerUserId === p1.userId;
  const isWinnerP2 = competition.winnerUserId === p2.userId;
  const isTie = competition.tie;

  const handleRematch = () => {
    const newCode = 'DUEL-' + Math.floor(1000 + Math.random() * 9000);
    navigate(`/matchmaking/${newCode}`);
  };

  return (
    <div style={{ flex: 1, padding: '2.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Winner Announcement Banner */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isTie ? 'var(--bg-tertiary)' : 'var(--accent-light)',
            color: 'var(--accent-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Trophy size={32} />
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}>
            {isTie ? (
              'Match Result: Even Draw!'
            ) : (
              <span>Winner: <span style={{ color: 'var(--accent-primary)' }}>{competition.winnerUsername}</span></span>
            )}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
            {competition.tieBreakerReason || 'Competition finished.'}
          </p>
        </div>

        {/* Side-by-Side Performance Comparison */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr',
            background: 'var(--bg-tertiary)',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            fontWeight: 700,
            fontSize: '0.875rem'
          }}>
            <div>Performance Metric</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: isWinnerP1 ? 'var(--accent-primary)' : 'var(--text-primary)'
            }}>
              <img src={p1.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=P1'} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
              {p1.username || 'Player 1'}
              {isWinnerP1 && <Award size={15} color="var(--accent-primary)" />}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: isWinnerP2 ? 'var(--accent-primary)' : 'var(--text-primary)'
            }}>
              <img src={p2.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=P2'} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
              {p2.username || 'Player 2'}
              {isWinnerP2 && <Award size={15} color="var(--accent-primary)" />}
            </div>
          </div>

          {/* Metric Rows */}
          {[
            {
              name: 'Final Score',
              v1: `${p1.score || 0} pts`,
              v2: `${p2.score || 0} pts`,
              p1Better: (p1.score || 0) > (p2.score || 0),
              p2Better: (p2.score || 0) > (p1.score || 0),
              bold: true
            },
            {
              name: 'Final Verdict',
              v1: p1.verdict || 'Incomplete',
              v2: p2.verdict || 'Incomplete',
              p1Better: p1.verdict === 'Accepted' && p2.verdict !== 'Accepted',
              p2Better: p2.verdict === 'Accepted' && p1.verdict !== 'Accepted'
            },
            {
              name: 'Test Cases Passed',
              v1: `${p1.passedTestCases || 0} / ${p1.totalTestCases || 0}`,
              v2: `${p2.passedTestCases || 0} / ${p2.totalTestCases || 0}`,
              p1Better: (p1.passedTestCases || 0) > (p2.passedTestCases || 0),
              p2Better: (p2.passedTestCases || 0) > (p1.passedTestCases || 0)
            },
            {
              name: 'Execution Speed (ms)',
              v1: `${p1.executionTimeMs || 0} ms`,
              v2: `${p2.executionTimeMs || 0} ms`,
              p1Better: (p1.executionTimeMs || 0) < (p2.executionTimeMs || 0) && p1.verdict === 'Accepted',
              p2Better: (p2.executionTimeMs || 0) < (p1.executionTimeMs || 0) && p2.verdict === 'Accepted'
            },
            {
              name: 'Memory Usage (KB)',
              v1: `${p1.memoryKb || 0} KB`,
              v2: `${p2.memoryKb || 0} KB`,
              p1Better: (p1.memoryKb || 0) < (p2.memoryKb || 0) && p1.verdict === 'Accepted',
              p2Better: (p2.memoryKb || 0) < (p1.memoryKb || 0) && p2.verdict === 'Accepted'
            },
            {
              name: 'Total Submissions',
              v1: p1.submissionCount || 0,
              v2: p2.submissionCount || 0,
              p1Better: (p1.submissionCount || 0) < (p2.submissionCount || 0) && p1.verdict === 'Accepted',
              p2Better: (p2.submissionCount || 0) < (p1.submissionCount || 0) && p2.verdict === 'Accepted'
            }
          ].map((row, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr',
                padding: '0.85rem 1.25rem',
                borderBottom: idx < 5 ? '1px solid var(--border-color)' : 'none',
                background: idx % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ color: 'var(--text-secondary)', fontWeight: row.bold ? 700 : 500 }}>
                {row.name}
              </div>
              <div style={{
                color: row.p1Better ? 'var(--color-easy)' : 'var(--text-primary)',
                fontWeight: row.bold || row.p1Better ? 700 : 500
              }}>
                {row.v1} {row.p1Better && '★'}
              </div>
              <div style={{
                color: row.p2Better ? 'var(--color-easy)' : 'var(--text-primary)',
                fontWeight: row.bold || row.p2Better ? 700 : 500
              }}>
                {row.v2} {row.p2Better && '★'}
              </div>
            </div>
          ))}
        </div>

        {/* Tie Breaker Rules Info Card */}
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <ShieldCheck size={20} color="var(--accent-primary)" />
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <strong>Tie-breaker Rule:</strong> If both competitors earn identical points, the competitor with the faster Python execution time on their correct solution is declared the winner.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={handleRematch} className="btn btn-primary btn-lg">
            <RotateCcw size={18} />
            Start New Duel
          </button>
          <Link to="/leaderboard" className="btn btn-secondary btn-lg">
            <BarChart3 size={18} />
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
