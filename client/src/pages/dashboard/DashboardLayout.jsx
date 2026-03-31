import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import { LayoutDashboard, Trophy, HeartHandshake, Dices, Award, CreditCard, LogOut } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/dashboard/scores', label: 'My Scores', icon: <Trophy size={18} /> },
  { to: '/dashboard/draws', label: 'Monthly Draws', icon: <Dices size={18} /> },
  { to: '/dashboard/winnings', label: 'My Winnings', icon: <Award size={18} /> },
  { to: '/dashboard/charity', label: 'My Charity', icon: <HeartHandshake size={18} /> },
  { to: '/dashboard/subscription', label: 'Subscription', icon: <CreditCard size={18} /> },
];

export default function DashboardLayout() {
  const { profile, subscription, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          {/* User info */}
          <div className="glass-pane" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                {profile?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name || 'Golfer'}</div>
                <span className={`badge ${subscription ? 'badge-active' : 'badge-inactive'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                  {subscription ? 'Active' : 'No Plan'}
                </span>
              </div>
            </div>
          </div>

          <div className="sidebar-section-label">Dashboard</div>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              {l.icon} {l.label}
            </NavLink>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </aside>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
