import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Trophy, Info } from 'lucide-react';

export default function ScoresPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ score: '', played_on: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchScores = () => {
    api.get('/scores').then(r => { setScores(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchScores(); }, []);

  const addScore = async (e) => {
    e.preventDefault();
    if (!form.score || !form.played_on) return toast.error('Score and date required');
    setSubmitting(true);
    try {
      await api.post('/scores', { score: parseInt(form.score), played_on: form.played_on });
      toast.success('Score added!');
      setForm({ score: '', played_on: '' });
      fetchScores();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add score');
    } finally { setSubmitting(false); }
  };

  const deleteScore = async (id) => {
    try {
      await api.delete(`/scores/${id}`);
      toast.success('Score removed');
      fetchScores();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Golf Scores</h1>
        <p>Track your last 5 Stableford scores. A new score replaces the oldest automatically.</p>
      </div>

      {/* Info banner */}
      <div className="glass-pane mb-4" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.06)' }}>
        <Info size={16} color="#a78bfa" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', margin: 0 }}>Scores must be in <strong style={{ color: 'white' }}>Stableford format (1–45)</strong>. You need at least 5 scores to qualify for monthly draws.</p>
      </div>

      {/* Current Scores */}
      <div className="glass-pane mb-4" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Current Scores ({scores.length}/5)</h3>
          {scores.length >= 5 && <span className="badge badge-active">✅ Draw Qualified</span>}
        </div>
        {loading ? (
          <div style={{ display: 'flex', gap: '0.75rem' }}>{[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ width: 56, height: 56, borderRadius: '50%' }} />)}</div>
        ) : scores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <Trophy size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
            <p>No scores logged yet. Add your first score below.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Score</th><th>Date Played</th><th>Logged</th><th>Action</th></tr></thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <div className="score-bubble" style={{ width: 40, height: 40, fontSize: '1rem', display: 'inline-flex' }}>{s.score}</div>
                    </td>
                    <td style={{ color: 'white', fontWeight: 500 }}>{new Date(s.played_on).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => deleteScore(s.id)} className="btn btn-danger btn-sm">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Score Form */}
      <div className="glass-pane" style={{ padding: '1.75rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>
          <Plus size={18} style={{ display: 'inline', position: 'relative', top: -1, marginRight: 6 }} />
          Add New Score
        </h3>
        <form onSubmit={addScore} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Stableford Score (1–45)</label>
            <input className="form-input" type="number" min={1} max={45} value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} placeholder="e.g. 34" required />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Date Played</label>
            <input className="form-input" type="date" value={form.played_on} max={new Date().toISOString().split('T')[0]} onChange={e => setForm(f => ({ ...f, played_on: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ height: 46 }}>
            {submitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><Plus size={16} /> Add Score</>}
          </button>
        </form>
        {scores.length >= 5 && (
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>⚠️ Adding a new score will automatically remove your oldest score ({new Date(scores[scores.length - 1]?.played_on).toLocaleDateString()}).</p>
        )}
      </div>
    </div>
  );
}
