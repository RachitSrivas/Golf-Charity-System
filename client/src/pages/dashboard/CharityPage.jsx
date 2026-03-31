import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HeartHandshake, Save } from 'lucide-react';

export default function CharityPage() {
  const { subscription } = useAuth();
  const [charities, setCharities] = useState([]);
  const [selected, setSelected] = useState(subscription?.charity_id || '');
  const [pct, setPct] = useState(subscription?.charity_percentage || 10);
  const [donateAmount, setDonateAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [donating, setDonating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch real charities from DB
  useEffect(() => {
    api.get('/charities').then(r => {
      setCharities(r.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/charities/select', { charityId: selected, charityPercent: pct });
      toast.success('Charity preference updated!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const donate = async (e) => {
    e.preventDefault();
    if (!selected || !donateAmount) return toast.error('Select a charity and amount');
    setDonating(true);
    try {
      await api.post('/charities/donate', { charityId: selected, amount: parseFloat(donateAmount) });
      toast.success('Donation recorded! Thank you 💚');
      setDonateAmount('');
    } catch { toast.error('Donation failed'); }
    finally { setDonating(false); }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const monthlyAmt = subscription ? (subscription.plan === 'monthly' ? 20 : 200 / 12) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>My Charity</h1>
        <p>Choose where your subscription contribution goes. Minimum 10% guaranteed.</p>
      </div>

      {/* Impact summary */}
      {subscription && (
        <div className="stats-grid mb-4">
          <div className="glass-pane stat-card" style={{ borderTop: '3px solid var(--accent)' }}>
            <div className="stat-label">Monthly Contribution</div>
            <div className="stat-value">£{(monthlyAmt * pct / 100).toFixed(2)}</div>
            <div className="stat-sub">{pct}% of your {subscription.plan} plan</div>
          </div>
          <div className="glass-pane stat-card" style={{ borderTop: '3px solid #a78bfa' }}>
            <div className="stat-label">Yearly Impact</div>
            <div className="stat-value">£{(monthlyAmt * pct / 100 * 12).toFixed(0)}</div>
            <div className="stat-sub">Projected annual contribution</div>
          </div>
        </div>
      )}

      {/* Charity selector */}
      <div className="glass-pane mb-4" style={{ padding: '1.75rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Select Your Charity</h3>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />)}
          </div>
        ) : charities.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No charities available yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {charities.map((c, idx) => {
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={c.id} onClick={() => setSelected(c.id)} className="glass-pane" style={{
                  padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderColor: selected === c.id ? color : 'var(--border-color)',
                  background: selected === c.id ? `${color}10` : 'var(--bg-card)',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <HeartHandshake size={20} color={color} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>{c.name}</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{c.description || ''}</p>
                    </div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected === c.id ? color : 'var(--border-color)'}`, background: selected === c.id ? color : 'transparent', transition: 'all 0.2s', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        )}

        <div className="form-group mt-4">
          <label className="form-label">Contribution Percentage: <strong style={{ color: 'var(--accent)' }}>{pct}%</strong> = £{(monthlyAmt * pct / 100).toFixed(2)}/mo</label>
          <input type="range" min={10} max={100} step={5} value={pct} onChange={e => setPct(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>10% (minimum)</span><span>100%</span>
          </div>
        </div>

        <button onClick={save} disabled={saving} className="btn btn-primary mt-4">
          {saving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><Save size={16} /> Save Preference</>}
        </button>
      </div>

      {/* Independent donation */}
      <div className="glass-pane" style={{ padding: '1.75rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Make an Independent Donation</h3>
        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Donate any extra amount directly — not tied to your subscription or draw entry.</p>
        <form onSubmit={donate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Amount (£)</label>
            <input className="form-input" type="number" min={1} step={0.01} value={donateAmount} onChange={e => setDonateAmount(e.target.value)} placeholder="e.g. 25.00" />
          </div>
          <button type="submit" disabled={donating} className="btn btn-accent" style={{ height: 46 }}>
            {donating ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><HeartHandshake size={16} /> Donate Now</>}
          </button>
        </form>
      </div>
    </div>
  );
}
