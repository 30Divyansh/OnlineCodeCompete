import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  Swords, 
  Sun, 
  Moon, 
  Code2, 
  Trophy, 
  User, 
  Flame, 
  Layers, 
  ChevronDown,
  UserCheck
} from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, switchUser, DEFAULT_USERS } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Competitions', path: '/competitions' },
    { name: 'Problem Library', path: '/problems' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Profile', path: `/profile/${currentUser.id}` }
  ];

  const handleStartDuel = () => {
    // Generate fresh room code and navigate to matchmaking
    const randomCode = 'DUEL-' + Math.floor(1000 + Math.random() * 9000);
    navigate(`/matchmaking/${randomCode}`);
  };

  return (
    <nav style={{
      height: '56px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      padding: '0 1.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto'
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#ffffff',
              padding: '0.4rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Swords size={20} strokeWidth={2.5} />
            </div>
            <span style={{
              fontWeight: 700,
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}>
              Code<span style={{ color: 'var(--accent-primary)' }}>Duel</span>
            </span>
          </Link>

          {/* Navigation Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path.startsWith('/profile') && location.pathname.startsWith('/profile'));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Actions: Quick Duel Button, Theme Toggle, Active Player Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Quick Duel Button */}
          <button
            onClick={handleStartDuel}
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 600 }}
          >
            <Flame size={16} />
            New Duel
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              padding: '0.45rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              background: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Active User Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '0.825rem'
              }}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                style={{ width: '22px', height: '22px', borderRadius: '50%' }}
              />
              <span style={{ fontWeight: 600 }}>{currentUser.username}</span>
              <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600 }}>
                {currentUser.rating}
              </span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {userDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: '240px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 100
                }}
              >
                <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  SWITCH ACTIVE PLAYER
                </div>
                {DEFAULT_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u);
                      setUserDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '5px',
                      background: currentUser.id === u.id ? 'var(--bg-tertiary)' : 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={u.avatar} alt={u.username} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600 }}>{u.username}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.displayName}</div>
                      </div>
                    </div>
                    {currentUser.id === u.id && <UserCheck size={16} color="var(--accent-primary)" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
