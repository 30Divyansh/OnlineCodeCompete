import React, { useState, useEffect } from 'react';
import { X, Search, Swords, CheckCircle2, BookOpen } from 'lucide-react';

export default function SendChallengeModal({ isOpen, onClose, opponent, onSendChallenge }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  const categories = [
    'All',
    'Arrays and Searching',
    'Sorting and Searching',
    'Dynamic Programming',
    'Trees and Graphs',
    'Greedy and Other Algorithms',
    'Stacks, Queues and Strings'
  ];

  useEffect(() => {
    if (isOpen) {
      fetch('/api/problems')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.problems) {
            setProblems(data.problems);
            if (!selectedProblemId && data.problems.length > 0) {
              setSelectedProblemId(data.problems[0].id);
            }
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load problems:', err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen || !opponent) return null;

  const filteredProblems = problems.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedProblem = problems.find(p => p.id === selectedProblemId);

  const handleSend = () => {
    if (!selectedProblemId) return;
    onSendChallenge(opponent.id, selectedProblemId);
    onClose();
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
      zIndex: 10000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Swords size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Challenge {opponent.username}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Select a problem from the standard library to include in your challenge.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {/* Filters */}
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem'
            }}>
              <Search size={14} color="var(--text-muted)" style={{ marginRight: '0.4rem' }} />
              <input
                type="text"
                placeholder="Search by problem title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.725rem',
                  borderRadius: '999px',
                  fontWeight: selectedCategory === cat ? 600 : 500,
                  background: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid ' + (selectedCategory === cat ? 'var(--accent-primary)' : 'var(--border-color)'),
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Problems List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading standard problem library...
            </div>
          ) : filteredProblems.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matching problems found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredProblems.map(p => {
                const isSelected = selectedProblemId === p.id;
                let diffBadge = 'badge-easy';
                if (p.difficulty === 'Medium') diffBadge = 'badge-medium';
                if (p.difficulty === 'Hard') diffBadge = 'badge-hard';

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProblemId(p.id)}
                    style={{
                      background: isSelected ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                      border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {p.title}
                        </span>
                        <span className={`badge ${diffBadge}`} style={{ fontSize: '0.7rem' }}>
                          {p.difficulty}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.category}
                      </div>
                    </div>

                    {isSelected && (
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.8rem' }}>
                        ✓ Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Selected Problem & Send Challenge Button */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Selected: </span>
            <strong style={{ color: 'var(--accent-primary)' }}>
              {selectedProblem?.title || 'None'}
            </strong>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!selectedProblemId}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, padding: '0.45rem 1.1rem' }}
            >
              <Swords size={15} />
              SEND CHALLENGE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
