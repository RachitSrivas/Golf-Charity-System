import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { BarChart3, Users, Dices, HeartHandshake, Award, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', label: 'Analytics', icon: <BarChart3 size={18} />, end: true },
  { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
  { to: '/admin/draws', label: 'Draw Management', icon: <Dices size={18} /> },
  { to: '/admin/charities', label: 'Charities', icon: <HeartHandshake size={18} /> },
  { to: '/admin/winners', label: 'Winners', icon: <Award size={18} /> },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="glass-pane" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'white' }}>Admin Panel</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Digital Heroes Golf</div>
            </div>
          </div>
          <div className="sidebar-section-label">Management</div>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              {l.icon}{l.label}
            </NavLink>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </aside>
        <main className="dashboard-content"><Outlet /></main>
      </div>
    </>
  );
}
