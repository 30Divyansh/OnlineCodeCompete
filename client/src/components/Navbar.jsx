import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  Swords, 
  Sun, 
  Moon, 
  Flame, 
  Users,
  LogOut,
  Edit2
} from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, changeName } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Live Players', path: '/live', badge: true },
    { name: 'Competitions', path: '/competitions' },
    { name: 'Problem Library', path: '/problems' },
    { name: 'Leaderboard', path: '/leaderboard' }
  ];

  if (currentUser) {
    navLinks.push({ name: 'My Profile', path: `/profile/${currentUser.id}` });
  }

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
          <Link to="/live" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path.startsWith('/profile') && location.pathname.startsWith('/profile'));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.badge && (
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: 'var(--color-easy)',
                      display: 'inline-block'
                    }} />
                  )}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Actions: Dark/Light Mode, Player Session Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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

          {/* Player Identity Badge */}
          {currentUser ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)'
            }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10b981'
                }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {currentUser.username}
              </span>
              <button
                onClick={changeName}
                title="Change username"
                style={{
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '0.2rem'
                }}
              >
                <Edit2 size={13} />
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Entering name...
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
