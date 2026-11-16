import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function AdminProblemModal({ isOpen, onClose, problemToEdit, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Arrays and Searching',
    difficulty: 'Medium',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    functionName: '',
    starterCode: '',
    sampleTestCases: [{ input: '', expected: '', explanation: '' }],
    hiddenTestCases: [{ input: '', expected: '' }]
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (problemToEdit) {
      setFormData({
        title: problemToEdit.title || '',
        category: problemToEdit.category || 'Arrays and Searching',
        difficulty: problemToEdit.difficulty || 'Medium',
        description: problemToEdit.description || '',
        inputFormat: problemToEdit.inputFormat || '',
        outputFormat: problemToEdit.outputFormat || '',
        constraints: (problemToEdit.constraints || []).join('\n'),
        functionName: problemToEdit.functionName || '',
        starterCode: problemToEdit.starterCode || '',
        sampleTestCases: problemToEdit.sampleTestCases?.map(tc => ({
          input: JSON.stringify(tc.input),
          expected: JSON.stringify(tc.expected),
          explanation: tc.explanation || ''
        })) || [{ input: '', expected: '', explanation: '' }],
        hiddenTestCases: problemToEdit.hiddenTestCases?.map(tc => ({
          input: JSON.stringify(tc.input),
          expected: JSON.stringify(tc.expected)
        })) || [{ input: '', expected: '' }]
      });
    } else {
      setFormData({
        title: '',
        category: 'Arrays and Searching',
        difficulty: 'Medium',
        description: '',
        inputFormat: '',
        outputFormat: '',
        constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
        functionName: 'solve',
        starterCode: 'def solve(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n',
        sampleTestCases: [{ input: '[[1, 2, 3]]', expected: '6', explanation: 'Sample explanation' }],
        hiddenTestCases: [{ input: '[[4, 5, 6]]', expected: '15' }]
      });
    }
  }, [problemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSampleCase = () => {
    setFormData(prev => ({
      ...prev,
      sampleTestCases: [...prev.sampleTestCases, { input: '', expected: '', explanation: '' }]
    }));
  };

  const handleRemoveSampleCase = (index) => {
    setFormData(prev => ({
      ...prev,
      sampleTestCases: prev.sampleTestCases.filter((_, i) => i !== index)
    }));
  };

  const handleAddHiddenCase = () => {
    setFormData(prev => ({
      ...prev,
      hiddenTestCases: [...prev.hiddenTestCases, { input: '', expected: '' }]
    }));
  };

  const handleRemoveHiddenCase = (index) => {
    setFormData(prev => ({
      ...prev,
      hiddenTestCases: prev.hiddenTestCases.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Parse constraints
      const constraintsArr = formData.constraints
        .split('\n')
        .map(c => c.trim())
        .filter(Boolean);

      // Parse testcases
      const parsedSample = formData.sampleTestCases.map(tc => ({
        input: JSON.parse(tc.input || '[]'),
        expected: JSON.parse(tc.expected || 'null'),
        explanation: tc.explanation || ''
      }));

      const parsedHidden = formData.hiddenTestCases.map(tc => ({
        input: JSON.parse(tc.input || '[]'),
        expected: JSON.parse(tc.expected || 'null')
      }));

      const payload = {
        title: formData.title,
        category: formData.category,
        difficulty: formData.difficulty,
        description: formData.description,
        inputFormat: formData.inputFormat,
        outputFormat: formData.outputFormat,
        constraints: constraintsArr,
        functionName: formData.functionName,
        starterCode: formData.starterCode,
        sampleTestCases: parsedSample,
        hiddenTestCases: parsedHidden
      };

      const url = problemToEdit ? `/api/problems/${problemToEdit.id}` : '/api/problems';
      const method = problemToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        onSaved();
        onClose();
      } else {
        setError(data.message || 'Failed to save problem');
      }
    } catch (err) {
      setError(`Validation / JSON parsing error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
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
        maxWidth: '720px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {problemToEdit ? 'Edit Problem' : 'Add New Algorithmic Problem'}
          </h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.25rem', flex: 1 }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-hard)',
              color: 'var(--color-hard)',
              padding: '0.6rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.45rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.45rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem'
                }}
              >
                <option value="Arrays and Searching">Arrays and Searching</option>
                <option value="Sorting and Searching">Sorting and Searching</option>
                <option value="Dynamic Programming">Dynamic Programming</option>
                <option value="Trees and Graphs">Trees and Graphs</option>
                <option value="Greedy and Other Algorithms">Greedy and Other Algorithms</option>
                <option value="Stacks, Queues and Strings">Stacks, Queues and Strings</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.45rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem'
                }}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>Description</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.5rem',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>Function Name (Python)</label>
              <input
                type="text"
                required
                value={formData.functionName}
                onChange={e => setFormData({ ...formData, functionName: e.target.value })}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.45rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>Constraints (1 per line)</label>
              <textarea
                rows={2}
                value={formData.constraints}
                onChange={e => setFormData({ ...formData, constraints: e.target.value })}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.45rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>Starter Code (Python 3)</label>
            <textarea
              rows={4}
              required
              value={formData.starterCode}
              onChange={e => setFormData({ ...formData, starterCode: e.target.value })}
              style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.5rem',
                borderRadius: '4px',
                fontSize: '0.825rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          {/* Sample Testcases */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Sample Test Cases (Visible)</label>
              <button type="button" onClick={handleAddSampleCase} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                <Plus size={12} /> Add Sample Case
              </button>
            </div>
            {formData.sampleTestCases.map((tc, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <input
                  type="text"
                  placeholder='Input args e.g. [[1, 2]]'
                  value={tc.input}
                  onChange={e => {
                    const list = [...formData.sampleTestCases];
                    list[i].input = e.target.value;
                    setFormData({ ...formData, sampleTestCases: list });
                  }}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.35rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                />
                <input
                  type="text"
                  placeholder='Expected output'
                  value={tc.expected}
                  onChange={e => {
                    const list = [...formData.sampleTestCases];
                    list[i].expected = e.target.value;
                    setFormData({ ...formData, sampleTestCases: list });
                  }}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.35rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                />
                <input
                  type="text"
                  placeholder='Explanation (optional)'
                  value={tc.explanation}
                  onChange={e => {
                    const list = [...formData.sampleTestCases];
                    list[i].explanation = e.target.value;
                    setFormData({ ...formData, sampleTestCases: list });
                  }}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.35rem', borderRadius: '4px', fontSize: '0.75rem' }}
                />
                {formData.sampleTestCases.length > 1 && (
                  <button type="button" onClick={() => handleRemoveSampleCase(i)} style={{ color: 'var(--color-hard)' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Hidden Testcases */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Hidden Test Cases (For Evaluation)</label>
              <button type="button" onClick={handleAddHiddenCase} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                <Plus size={12} /> Add Hidden Case
              </button>
            </div>
            {formData.hiddenTestCases.map((tc, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <input
                  type="text"
                  placeholder='Input args e.g. [[-5, -2, -1]]'
                  value={tc.input}
                  onChange={e => {
                    const list = [...formData.hiddenTestCases];
                    list[i].input = e.target.value;
                    setFormData({ ...formData, hiddenTestCases: list });
                  }}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.35rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                />
                <input
                  type="text"
                  placeholder='Expected output'
                  value={tc.expected}
                  onChange={e => {
                    const list = [...formData.hiddenTestCases];
                    list[i].expected = e.target.value;
                    setFormData({ ...formData, hiddenTestCases: list });
                  }}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.35rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                />
                {formData.hiddenTestCases.length > 1 && (
                  <button type="button" onClick={() => handleRemoveHiddenCase(i)} style={{ color: 'var(--color-hard)' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
              {saving ? 'Saving...' : 'Save Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
