import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Play, Send, Dices } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function DrawManagementPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), draw_type: 'random' });
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState('');
  const [publishing, setPublishing] = useState('');

  const fetch = () => api.get('/admin/draws').then(r => {
    setDraws(r.data); setLoading(false);
  }).catch(() => setLoading(false));

  useEffect(() => {
    // Use admin endpoint
    api.get('/draws').then(r => { setDraws(r.data); setLoading(false); }).catch(() => {
      api.get('/admin/analytics').then(() => setLoading(false)).catch(() => setLoading(false));
    });
  }, []);

  const createDraw = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/draws', form);
      toast.success('Draw created!');
      fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setCreating(false); }
  };

  const simulate = async (drawId) => {
    setSimulating(drawId);
    try {
      const { data } = await api.post(`/draws/${drawId}/simulate`);
      setSimResult({ drawId, ...data });
      toast.success('Simulation complete!');
      fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Simulation failed'); }
    finally { setSimulating(''); }
  };

  const publish = async (drawId) => {
    if (!window.confirm('Publish this draw? Results will be visible to all subscribers and winners will be emailed.')) return;
    setPublishing(drawId);
    try {
      const { data } = await api.post(`/draws/${drawId}/publish`);
      toast.success(`Draw published! ${data.winners} winner(s) found.`);
      fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Publish failed'); }
    finally { setPublishing(''); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Draw Management</h1>
        <p>Create, simulate, and publish monthly draws. Configure algorithm modes.</p>
      </div>

      {/* Create draw */}
      <div className="glass-pane mb-4" style={{ padding: '1.75rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Create New Draw</h3>
        <form onSubmit={createDraw} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Month</label>
            <select className="form-select" value={form.month} onChange={e => setForm(f => ({ ...f, month: parseInt(e.target.value) }))}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ width: 100 }}>
            <label className="form-label">Year</label>
            <input className="form-input" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))} min={2024} max={2030} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Algorithm</label>
            <select className="form-select" value={form.draw_type} onChange={e => setForm(f => ({ ...f, draw_type: e.target.value }))}>
              <option value="random">🎲 Random</option>
              <option value="algorithmic">⚡ Algorithmic (score-weighted)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating} style={{ height: 46 }}>
            {creating ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><Plus size={16} /> Create Draw</>}
          </button>
        </form>
      </div>

      {/* Simulation result */}
      {simResult && (
        <div className="glass-pane mb-4" style={{ padding: '1.75rem', borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3>Simulation Result</h3>
            <button onClick={() => setSimResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Drawn numbers:</span>
            {simResult.drawn_numbers?.map(n => (
              <span key={n} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,158,11,0.2)', border: '1px solid var(--accent-gold)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight: 700, color: 'var(--accent-gold)' }}>{n}</span>
            ))}
          </div>
          <div className="grid-3">
            {[{ t: '5-Match (Jackpot)', count: simResult.winners?.[5], prize: simResult.prizes?.[5], color: 'var(--accent-gold)' },
              { t: '4-Match', count: simResult.winners?.[4], prize: simResult.prizes?.[4], color: '#a78bfa' },
              { t: '3-Match', count: simResult.winners?.[3], prize: simResult.prizes?.[3], color: 'var(--accent)' }].map(t => (
              <div key={t.t} className="glass-pane" style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: t.color, fontWeight: 600 }}>{t.t}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>{t.count || 0}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>winners · £{((t.prize || 0)).toFixed(2)} ea</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draws list */}
      <h3 style={{ marginBottom: '1.25rem' }}>All Draws</h3>
      {loading ? <div className="skeleton" style={{ height: 200, borderRadius: 12 }} /> : draws.length === 0 ? (
        <div className="glass-pane" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Dices size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
          <p>No draws yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Draw</th><th>Type</th><th>Numbers</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {draws.map(d => (
                <tr key={d.id}>
                  <td style={{ color: 'white', fontWeight: 500 }}>{MONTHS[d.month - 1]} {d.year}</td>
                  <td><span className="badge badge-inactive" style={{ fontSize: '0.72rem' }}>{d.draw_type}</span></td>
                  <td>
                    {d.drawn_numbers?.length ? (
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {d.drawn_numbers.map(n => <span key={n} style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', border: '1px solid var(--primary)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa' }}>{n}</span>)}
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not drawn</span>}
                  </td>
                  <td>
                    <span className={`badge ${d.status === 'published' ? 'badge-active' : d.status === 'simulated' ? 'badge-pending' : 'badge-inactive'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {d.status === 'draft' && (
                        <button onClick={() => simulate(d.id)} className="btn btn-ghost btn-sm" disabled={simulating === d.id}>
                          {simulating === d.id ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><Play size={13} /> Simulate</>}
                        </button>
                      )}
                      {d.status === 'simulated' && (
                        <button onClick={() => publish(d.id)} className="btn btn-accent btn-sm" disabled={publishing === d.id}>
                          {publishing === d.id ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><Send size={13} /> Publish</>}
                        </button>
                      )}
                      {d.status === 'published' && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Published ✓</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
