import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminProblemModal from '../components/AdminProblemModal';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Swords, 
  Eye, 
  X, 
  Code2, 
  Check, 
  Layers 
} from 'lucide-react';

export default function ProblemLibrary() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [previewProblem, setPreviewProblem] = useState(null);

  const categories = [
    'All',
    'Arrays and Searching',
    'Sorting and Searching',
    'Dynamic Programming',
    'Trees and Graphs',
    'Greedy and Other Algorithms',
    'Stacks, Queues and Strings'
  ];

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const fetchProblems = () => {
    setLoading(true);
    fetch('/api/problems')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.problems) {
          setProblems(data.problems);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load problems:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDeleteProblem = async (problemId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this problem from the library?')) return;
    try {
      const res = await fetch(`/api/problems/${problemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchProblems();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleStartDuelWithProblem = (problemId, e) => {
    e.stopPropagation();
    const code = 'DUEL-' + Math.floor(1000 + Math.random() * 9000);
    navigate(`/matchmaking/${code}`);
  };

  const filteredProblems = problems.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ flex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container">
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
              <BookOpen size={22} color="var(--accent-primary)" />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Standard Problem Library</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              30 Standard Algorithmic Problems available for head-to-head duels. Data-driven and fully customizable.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingProblem(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add Problem (Admin)
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            minWidth: '260px'
          }}>
            <Search size={15} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search problem title or topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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

          {/* Categories */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  borderRadius: '999px',
                  fontWeight: selectedCategory === cat ? 600 : 500,
                  background: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid ' + (selectedCategory === cat ? 'var(--accent-primary)' : 'var(--border-color)'),
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {difficulties.map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  borderRadius: '999px',
                  fontWeight: selectedDifficulty === diff ? 600 : 500,
                  background: selectedDifficulty === diff ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                  color: selectedDifficulty === diff ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: '1px solid ' + (selectedDifficulty === diff ? 'var(--accent-primary)' : 'var(--border-color)')
                }}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Problems List Table */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 2.5fr 1.5fr 100px 180px',
            background: 'var(--bg-tertiary)',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-muted)'
          }}>
            <div>#</div>
            <div>Title</div>
            <div>Category</div>
            <div>Difficulty</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading standard problem library...
            </div>
          ) : filteredProblems.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No problems found matching filters.
            </div>
          ) : (
            filteredProblems.map((p, idx) => {
              let diffBadge = 'badge-easy';
              if (p.difficulty === 'Medium') diffBadge = 'badge-medium';
              if (p.difficulty === 'Hard') diffBadge = 'badge-hard';

              return (
                <div
                  key={p.id}
                  onClick={() => setPreviewProblem(p)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 2.5fr 1.5fr 100px 180px',
                    padding: '0.85rem 1.25rem',
                    borderBottom: idx < filteredProblems.length - 1 ? '1px solid var(--border-color)' : 'none',
                    fontSize: '0.875rem',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease',
                    background: idx % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)'}
                >
                  <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    #{idx + 1}
                  </div>

                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.title}
                  </div>

                  <div>
                    <span className="badge badge-category" style={{ fontSize: '0.725rem' }}>
                      {p.category}
                    </span>
                  </div>

                  <div>
                    <span className={`badge ${diffBadge}`}>
                      {p.difficulty}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <button
                      onClick={(e) => handleStartDuelWithProblem(p.id, e)}
                      className="btn btn-secondary btn-sm"
                      title="Duel on this problem"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: 'var(--accent-primary)' }}
                    >
                      <Swords size={13} /> Duel
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProblem(p);
                        setIsModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      title="Edit Problem (Admin)"
                      style={{ padding: '0.2rem 0.45rem' }}
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      onClick={(e) => handleDeleteProblem(p.id, e)}
                      className="btn btn-secondary btn-sm"
                      title="Delete Problem (Admin)"
                      style={{ padding: '0.2rem 0.45rem', color: 'var(--color-hard)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Admin Add/Edit Modal */}
      <AdminProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        problemToEdit={editingProblem}
        onSaved={fetchProblems}
      />

      {/* Problem Quick View Modal */}
      {previewProblem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{previewProblem.title}</h3>
                <span className={`badge ${previewProblem.difficulty === 'Easy' ? 'badge-easy' : (previewProblem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard')}`}>
                  {previewProblem.difficulty}
                </span>
              </div>
              <button onClick={() => setPreviewProblem(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', padding: '1.25rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
              <div style={{ color: 'var(--text-primary)', marginBottom: '1.25rem', whiteSpace: 'pre-wrap' }}>
                {previewProblem.description}
              </div>

              {previewProblem.inputFormat && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    INPUT FORMAT
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{previewProblem.inputFormat}</div>
                </div>
              )}

              {previewProblem.constraints?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    CONSTRAINTS
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    {previewProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  STARTER CODE TEMPLATE
                </div>
                <pre style={{
                  background: 'var(--bg-tertiary)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                  border: '1px solid var(--border-color)'
                }}>
                  {previewProblem.starterCode}
                </pre>
              </div>
            </div>

            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setPreviewProblem(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
              <button
                onClick={() => {
                  const prob = previewProblem;
                  setPreviewProblem(null);
                  handleStartDuelWithProblem(prob.id, { stopPropagation: () => {} });
                }}
                className="btn btn-primary btn-sm"
              >
                <Swords size={14} /> Start Duel on this Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
