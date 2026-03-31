import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CreditCard, Lock, CheckCircle, Zap } from 'lucide-react';

export default function DemoCheckout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', expiry: '12/28', cvc: '123', name: '' });

  const plan = params.get('plan');
  const label = params.get('label');
  const charityId = params.get('charityId');
  const charityPercent = params.get('charityPercent');
  const email = params.get('email');

  const handlePay = async (e) => {
    e.preventDefault();
    if (!card.name) return toast.error('Enter cardholder name');
    setProcessing(true);

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2000));

    try {
      await api.post('/subscriptions/demo-activate', {
        plan,
        charityId: charityId || null,
        charityPercent: parseInt(charityPercent) || 10,
      });
      setPaid(true);
      toast.success('Payment successful! 🎉');
      setTimeout(() => navigate('/dashboard?subscribed=true'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Activation failed');
      setProcessing(false);
    }
  };

  if (paid) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="glass-pane animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: 440 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={36} color="var(--accent)" />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Payment Successful!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Your subscription is now active. Redirecting to dashboard...</p>
          <div className="spinner" style={{ margin: '1.5rem auto 0' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Demo badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 20, padding: '0.35rem 1rem', fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={13} /> DEMO PAYMENT GATEWAY — No real charges
          </div>
        </div>

        <div className="glass-pane animate-fade-in" style={{ padding: '2.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Secure Checkout</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Golf Charity Subscription Platform</p>
            </div>
          </div>

          {/* Order summary */}
          <div className="glass-pane" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem', background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.2rem', textTransform: 'capitalize' }}>{plan} Plan</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Billed to: {email}</div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{label}</div>
            </div>
          </div>

          {/* Card form */}
          <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Cardholder Name</label>
              <input className="form-input" placeholder="James Harrington" value={card.name}
                onChange={e => setCard(c => ({ ...c, name: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label className="form-label">Card Number</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" value={card.number} readOnly
                  style={{ fontFamily: 'monospace', letterSpacing: '2px', paddingRight: '3rem', color: '#a78bfa' }} />
                <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: 4 }}>TEST</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Expiry</label>
                <input className="form-input" value={card.expiry} readOnly
                  style={{ fontFamily: 'monospace', color: '#a78bfa' }} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">CVC</label>
                <input className="form-input" value={card.cvc} readOnly
                  style={{ fontFamily: 'monospace', color: '#a78bfa' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
              <Lock size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
              This is a demo gateway. Use any name with the pre-filled test card. No real payment is processed.
            </div>

            <button type="submit" className="btn btn-primary" disabled={processing}
              style={{ justifyContent: 'center', height: 50, fontSize: '1rem', marginTop: '0.25rem' }}>
              {processing ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing payment...</>
              ) : (
                <><CreditCard size={18} /> Pay {label} — Activate Subscription</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
