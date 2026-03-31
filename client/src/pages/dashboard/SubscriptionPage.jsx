import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { CreditCard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function SubscriptionPage() {
  const { subscription, profile } = useAuth();
  const [canceling, setCanceling] = useState(false);

  const cancelSub = async () => {
    if (!window.confirm('Are you sure you want to cancel? You will lose access at the end of your billing period.')) return;
    setCanceling(true);
    try {
      await api.patch('/subscriptions/cancel');
      toast.success('Subscription cancelled.');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to cancel'); }
    finally { setCanceling(false); }
  };

  if (!subscription) return (
    <div>
      <div className="page-header"><h1>Subscription</h1></div>
      <div className="glass-pane" style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertTriangle size={48} color="var(--accent-gold)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>No Active Subscription</h3>
        <p style={{ marginBottom: '2rem' }}>Subscribe to enter monthly draws and track your scores.</p>
        <Link to="/register" className="btn btn-primary">Subscribe Now</Link>
      </div>
    </div>
  );

  const isActive = subscription.status === 'active';
  const renewDate = new Date(subscription.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="page-header"><h1>Subscription</h1><p>Manage your plan and billing details.</p></div>

      <div className="grid-2 mb-4">
        <div className="glass-pane stat-card" style={{ borderTop: `3px solid ${isActive ? 'var(--accent)' : 'var(--danger)'}` }}>
          <div className="stat-label">Status</div>
          <div className="stat-value" style={{ fontSize: '1.5rem', color: isActive ? 'var(--accent)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isActive ? <><CheckCircle size={22} />Active</> : <><XCircle size={22} />Inactive</>}
          </div>
          <div className="stat-sub">{isActive ? `Renews ${renewDate}` : 'No active plan'}</div>
        </div>
        <div className="glass-pane stat-card" style={{ borderTop: '3px solid var(--primary)' }}>
          <div className="stat-label">Plan</div>
          <div className="stat-value" style={{ fontSize: '1.5rem', textTransform: 'capitalize' }}>{subscription.plan}</div>
          <div className="stat-sub">{subscription.plan === 'monthly' ? '£20 / month' : '£200 / year (best value)'}</div>
        </div>
      </div>

      <div className="glass-pane mb-4" style={{ padding: '1.75rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Plan Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            ['Account', profile?.email],
            ['Plan', `${subscription.plan === 'monthly' ? 'Monthly (£20/mo)' : 'Yearly (£200/yr)'}`],
            ['Status', <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>{subscription.status}</span>],
            ['Next Renewal', renewDate],
            ['Charity', subscription.charities?.name || '—'],
            ['Contribution', `${subscription.charity_percentage}% per billing cycle`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ color: 'white', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {isActive && (
        <div className="glass-pane" style={{ padding: '1.75rem', borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--danger)' }}>Cancel Subscription</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>You will retain access until the end of your current billing period. This cannot be undone.</p>
          <button className="btn btn-danger" onClick={cancelSub} disabled={canceling}>
            {canceling ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <>Cancel Subscription</>}
          </button>
        </div>
      )}
    </div>
  );
}
