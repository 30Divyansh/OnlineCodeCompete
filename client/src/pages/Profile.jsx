import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  User, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Award, 
  Code2, 
  Swords, 
  History 
} from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const { currentUser } = useUser();
  const userId = id || currentUser.id;

  const [profileUser, setProfileUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setProfileUser(data.user);
          setHistory(data.history || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  }, [userId]);

  if (loading || !profileUser) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading Profile...</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '2.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* User Profile Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src={profileUser.avatar}
              alt={profileUser.username}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                border: '2px solid var(--accent-primary)',
                background: 'var(--bg-tertiary)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profileUser.username}</h1>
                <span className="badge badge-easy">Active Competitor</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                {profileUser.displayName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Rating: <strong style={{ color: 'var(--accent-primary)' }}>{profileUser.rating}</strong></span>
                <span>Points: <strong style={{ color: 'var(--text-primary)' }}>{profileUser.totalPoints}</strong></span>
              </div>
            </div>
          </div>

          <Link to={`/matchmaking/DUEL-${Math.floor(1000 + Math.random() * 9000)}`} className="btn btn-primary">
            <Swords size={16} />
            Challenge to Duel
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>TOTAL DUELS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{profileUser.competitions || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {profileUser.wins || 0} Wins • {profileUser.losses || 0} Losses
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>WIN RATE</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-easy)' }}>
              {profileUser.winRate || 0}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Competitive victory ratio
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>AVG SCORE</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {profileUser.avgScore || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Average points per competition
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>SOLVED PROBLEMS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {profileUser.solvedProblems?.length || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Verified standard library solutions
            </div>
          </div>
        </div>

        {/* Competition History */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700,
            fontSize: '0.95rem'
          }}>
            <History size={16} color="var(--accent-primary)" />
            Recent Competition History
          </div>

          {history.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No completed duels recorded yet. Enter a competition to record history!
            </div>
          ) : (
            <div>
              {history.map((duel, idx) => {
                const isWinner = duel.winnerUserId === profileUser.id;
                const opp = duel.player1?.userId === profileUser.id ? duel.player2 : duel.player1;
                return (
                  <div
                    key={duel.id || idx}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: idx < history.length - 1 ? '1px solid var(--border-color)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          Duel #{duel.roomCode}
                        </span>
                        {isWinner ? (
                          <span className="badge badge-easy">Victory</span>
                        ) : duel.tie ? (
                          <span className="badge badge-category">Draw</span>
                        ) : (
                          <span className="badge badge-hard">Defeat</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        vs <strong>{opp?.username || 'Opponent'}</strong> • Problem: <em>{duel.problemId || 'Standard Problem'}</em>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                          {duel.player1?.userId === profileUser.id ? duel.player1?.score : duel.player2?.score} pts
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {new Date(duel.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <Link to={`/results/${duel.roomCode}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem' }}>
                        View Results
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
