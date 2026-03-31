import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: '£20', period: '/month', desc: 'Rolling monthly subscription. Cancel anytime.' },
  { id: 'yearly', label: 'Yearly', price: '£200', period: '/year', desc: 'Save 15% — equivalent to £16.67/month.' },
];

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', plan: 'monthly', charityId: '', charityPercent: 10 });

  // Fetch real charities from DB
  useEffect(() => {
    api.get('/charities').then(r => setCharities(r.data || [])).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      // Try Stripe checkout — if Stripe isn't configured, just log the user in
      try {
        const { data } = await api.post('/subscriptions/checkout', { plan: form.plan, charityId: form.charityId, charityPercent: form.charityPercent });
        if (data.url) {
          toast.success('Account created! Redirecting to payment...');
          window.location.href = data.url;
          return;
        }
      } catch {
        // Stripe not configured — that's OK, continue to dashboard
      }
      // Auto-login after registration
      await login(form.email, form.password);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ['Account', 'Plan', 'Charity', 'Review'];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: '2rem' }}>
      <div className="glass-pane animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: 520 }}>
        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: 4, borderRadius: 4, marginBottom: '0.4rem',
                background: i + 1 <= step ? 'var(--primary)' : 'var(--border-color)',
                transition: 'background 0.3s'
              }} />
              <span style={{ fontSize: '0.7rem', color: i + 1 === step ? '#a78bfa' : 'var(--text-muted)', fontWeight: i + 1 === step ? 700 : 400 }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Account */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ marginBottom: '0' }}>Create your account</h2>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="James Harrington" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="james@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters" required />
            </div>
            <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => { if (!form.name || !form.email || !form.password) { toast.error('All fields required'); return; } setStep(2); }}>
              Next: Choose Plan <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Plan */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2>Choose your plan</h2>
            {PLANS.map(p => (
              <div key={p.id} onClick={() => set('plan', p.id)} className="glass-pane" style={{
                padding: '1.5rem', cursor: 'pointer',
                borderColor: form.plan === p.id ? 'var(--primary)' : 'var(--border-color)',
                boxShadow: form.plan === p.id ? '0 0 0 1px var(--primary)' : 'none',
                background: form.plan === p.id ? 'rgba(124,58,237,0.08)' : 'var(--bg-card)',
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>{p.label}</h4>
                    <p style={{ fontSize: '0.85rem' }}>{p.desc}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{p.price}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.period}</div>
                  </div>
                </div>
                {p.id === 'yearly' && <div className="badge badge-active mt-1">💸 Save 15%</div>}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)} style={{ flex: 1, justifyContent: 'center' }}>Next: Charity <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 3: Charity */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2>Choose your charity</h2>
            <p style={{ fontSize: '0.9rem' }}>Minimum 10% of your subscription funds them automatically every month.</p>
            {charities.map(c => (
              <div key={c.id} onClick={() => set('charityId', c.id)} className="glass-pane" style={{
                padding: '1.25rem 1.5rem', cursor: 'pointer',
                borderColor: form.charityId === c.id ? 'var(--accent)' : 'var(--border-color)',
                background: form.charityId === c.id ? 'rgba(16,185,129,0.06)' : 'var(--bg-card)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s'
              }}>
                <div>
                  <h4 style={{ color: 'white', marginBottom: '0.2rem' }}>{c.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{c.description || ''}</p>
                </div>
                {form.charityId === c.id && <Check size={20} color="var(--accent)" />}
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Contribution: {form.charityPercent}%</label>
              <input type="range" min={10} max={100} step={5} value={form.charityPercent} onChange={e => set('charityPercent', parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>10% (min)</span><span>100%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center' }}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => { if (!form.charityId) { toast.error('Please select a charity'); return; } setStep(4); }} style={{ flex: 1, justifyContent: 'center' }}>Review <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2>Confirm & Pay</h2>
            <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                ['Name', form.name],
                ['Email', form.email],
                ['Plan', form.plan === 'monthly' ? 'Monthly — £20/mo' : 'Yearly — £200/yr'],
                ['Charity', charities.find(c => c.id === form.charityId)?.name || '—'],
                ['Contribution', `${form.charityPercent}% of subscription`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: 'white', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You'll be redirected to Stripe's secure checkout to complete payment.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setStep(3)} style={{ flex: 1, justifyContent: 'center' }}><ArrowLeft size={16} /> Back</button>
              <button className="btn btn-accent" onClick={handleRegister} disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <>Subscribe & Pay <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already subscribed? <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
