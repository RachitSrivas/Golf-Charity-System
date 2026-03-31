import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Trophy, Dices, HeartHandshake, CreditCard, ArrowRight, AlertTriangle } from 'lucide-react';

export default function DashboardHome() {
  const { profile, subscription } = useAuth();
  const [scores, setScores] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [upcomingDraw, setUpcomingDraw] = useState(null);

  useEffect(() => {
    if (!subscription) return;
    api.get('/scores').then(r => setScores(r.data)).catch(() => {});
    api.get('/winners/me').then(r => setWinnings(r.data)).catch(() => {});
    api.get('/draws/upcoming').then(r => setUpcomingDraw(r.data)).catch(() => {});
  }, [subscription]);

  const totalWon = winnings.reduce((s, w) => s + (w.prize_amount || 0), 0);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'Golfer'}</span> 👋</h1>
        <p>Here's your performance overview for this month.</p>
      </div>

      {!subscription && (
        <div className="glass-pane" style={{ padding: '1.5rem', marginBottom: '2rem', borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.06)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <AlertTriangle size={22} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>No active subscription</div>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Subscribe to enter draws and track scores.</p>
          </div>
          <Link to="/register" className="btn btn-accent btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>Subscribe</Link>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid mb-4">
        <div className="glass-pane stat-card" style={{ borderTop: '3px solid var(--primary)' }}>
          <div className="stat-label">Subscription</div>
          <div className="stat-value" style={{ fontSize: '1.4rem', color: subscription ? 'var(--accent)' : 'var(--text-muted)' }}>{subscription ? 'Active' : 'Inactive'}</div>
          <div className="stat-sub">{subscription ? `${subscription.plan} plan · renews ${new Date(subscription.current_period_end).toLocaleDateString()}` : 'No active plan'}</div>
        </div>
        <div className="glass-pane stat-card" style={{ borderTop: '3px solid var(--accent)' }}>
          <div className="stat-label">Scores Logged</div>
          <div className="stat-value">{scores.length}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/5</span></div>
          <div className="stat-sub">{scores.length >= 5 ? '✅ Draw qualified' : `⚠️ Need ${5 - scores.length} more to qualify`}</div>
        </div>
        <div className="glass-pane stat-card" style={{ borderTop: '3px solid var(--accent-gold)' }}>
          <div className="stat-label">Total Winnings</div>
          <div className="stat-value">£{totalWon.toFixed(0)}</div>
          <div className="stat-sub">{winnings.length} prize{winnings.length !== 1 ? 's' : ''} won total</div>
        </div>
        <div className="glass-pane stat-card" style={{ borderTop: '3px solid #38bdf8' }}>
          <div className="stat-label">Charity Contribution</div>
          <div className="stat-value">{subscription?.charity_percentage || 10}%</div>
          <div className="stat-sub">{subscription?.charities?.name || 'Not selected'}</div>
        </div>
      </div>

      {/* Current Scores */}
      <div className="grid-2 mb-4">
        <div className="glass-pane" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>My Latest Scores</h3>
            <Link to="/dashboard/scores" className="btn btn-ghost btn-sm">Manage <ArrowRight size={13} /></Link>
          </div>
          {scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Trophy size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>No scores logged yet.</p>
            </div>
          ) : (
            <div className="scores-row">
              {scores.map((s) => (
                <div key={s.id} className="score-bubble">
                  {s.score}
                  <span style={{ position: 'absolute', bottom: -18, fontSize: '0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(s.played_on).toLocaleDateString('en-GB', { month:'short', day:'numeric' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-pane" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Upcoming Draw</h3>
            <Link to="/dashboard/draws" className="btn btn-ghost btn-sm">View <ArrowRight size={13} /></Link>
          </div>
          {upcomingDraw ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>
                {monthNames[(upcomingDraw.month || new Date().getMonth() + 1) - 1]} {upcomingDraw.year || new Date().getFullYear()}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-pending">Draw Upcoming</span>
                {scores.length >= 5 ? <span className="badge badge-active">✅ You're entered</span> : <span className="badge badge-inactive">⚠️ Enter 5 scores</span>}
              </div>
              <p style={{ fontSize: '0.875rem' }}>Match 3, 4, or 5 of your scores to win from the monthly prize pool!</p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming draw scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
