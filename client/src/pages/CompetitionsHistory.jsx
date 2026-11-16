import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Swords, Trophy, Clock, Users, ArrowRight, Play } from 'lucide-react';

export default function CompetitionsHistory() {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/competitions')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.competitions) {
          setCompetitions(data.competitions);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load competitions:', err);
        setLoading(false);
      });
  }, []);

  const handleCreateNew = () => {
    const code = 'DUEL-' + Math.floor(1000 + Math.random() * 9000);
    navigate(`/matchmaking/${code}`);
  };

  return (
    <div style={{ flex: 1, padding: '2.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Swords size={22} color="var(--accent-primary)" />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Competitions</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Live and recent 1v1 duels across the CodeDuel platform.
            </p>
          </div>

          <button onClick={handleCreateNew} className="btn btn-primary">
            <Swords size={16} />
            Create Duel Room
          </button>
        </div>

        {/* Competitions List */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 1.5fr 1.5fr 120px 120px',
            background: 'var(--bg-tertiary)',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-muted)'
          }}>
            <div>Room Code</div>
            <div>Competitors</div>
            <div>Problem</div>
            <div>Status</div>
            <div style={{ textAlign: 'right' }}>Action</div>
          </div>

          {loading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading competitions...
            </div>
          ) : competitions.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No competitions found. Click "Create Duel Room" to start the first battle!
            </div>
          ) : (
            competitions.map((duel, idx) => {
              const isCompleted = duel.status === 'completed';
              const isInProgress = duel.status === 'in_progress';
              const isSelection = duel.status === 'selection' || duel.status === 'matched';

              return (
                <div
                  key={duel.id || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1.5fr 1.5fr 120px 120px',
                    padding: '0.85rem 1.25rem',
                    borderBottom: idx < competitions.length - 1 ? '1px solid var(--border-color)' : 'none',
                    fontSize: '0.85rem',
                    alignItems: 'center',
                    background: idx % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {duel.roomCode}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{duel.player1?.username || 'Player 1'}</span>
                    <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700 }}>vs</span>
                    <span style={{ fontWeight: 600 }}>{duel.player2?.username || 'Player 2'}</span>
                  </div>

                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {duel.problemId || 'Selecting problem...'}
                  </div>

                  <div>
                    {isCompleted && <span className="badge badge-easy">Completed</span>}
                    {isInProgress && <span className="badge badge-medium">In Progress</span>}
                    {isSelection && <span className="badge badge-category">Lobby</span>}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {isCompleted ? (
                      <Link to={`/results/${duel.roomCode}`} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
                        Results
                      </Link>
                    ) : (
                      <Link to={`/matchmaking/${duel.roomCode}`} className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
                        Join Lobby
                      </Link>
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
