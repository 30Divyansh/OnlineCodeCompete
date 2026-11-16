import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Medal, TrendingUp, Search, User } from 'lucide-react';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.users) {
          setUsers(data.users);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load leaderboard:', err);
        setLoading(false);
      });
  }, []);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ flex: 1, padding: '2.5rem 0 4rem 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Header */}
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
              <Trophy size={24} color="var(--accent-primary)" />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Global Leaderboard</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Top competitive programmers ranked by duels won, rating, and algorithmic performance.
            </p>
          </div>

          {/* Search bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            minWidth: '220px'
          }}>
            <Search size={15} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search user..."
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
        </div>

        {/* Leaderboard Table */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '70px 2.2fr 100px 90px 90px 90px 110px 110px',
            background: 'var(--bg-tertiary)',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-muted)'
          }}>
            <div>Rank</div>
            <div>Competitor</div>
            <div>Rating</div>
            <div>Duels</div>
            <div>Wins</div>
            <div>Losses</div>
            <div>Win Rate</div>
            <div style={{ textAlign: 'right' }}>Total Points</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading leaderboard rankings...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No competitors found.
            </div>
          ) : (
            filteredUsers.map((user, idx) => {
              const rank = user.globalRank || idx + 1;
              let rankBadge = null;
              if (rank === 1) rankBadge = <Medal size={16} color="#fbbf24" />;
              else if (rank === 2) rankBadge = <Medal size={16} color="#94a3b8" />;
              else if (rank === 3) rankBadge = <Medal size={16} color="#b45309" />;

              return (
                <div
                  key={user.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 2.2fr 100px 90px 90px 90px 110px 110px',
                    padding: '0.85rem 1.25rem',
                    borderBottom: idx < filteredUsers.length - 1 ? '1px solid var(--border-color)' : 'none',
                    fontSize: '0.85rem',
                    alignItems: 'center',
                    background: idx % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {rankBadge}
                    <span>#{rank}</span>
                  </div>

                  <Link to={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                      alt={user.username}
                      style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.username}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{user.displayName}</div>
                    </div>
                  </Link>

                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                    {user.rating || 1500}
                  </div>

                  <div style={{ color: 'var(--text-secondary)' }}>
                    {user.competitions || 0}
                  </div>

                  <div style={{ color: 'var(--color-easy)', fontWeight: 600 }}>
                    {user.wins || 0}
                  </div>

                  <div style={{ color: 'var(--color-hard)' }}>
                    {user.losses || 0}
                  </div>

                  <div>
                    <span className="badge badge-category">
                      {user.winRate || 0}%
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {user.totalPoints || 0}
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
