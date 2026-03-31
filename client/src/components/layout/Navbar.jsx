import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, HeartHandshake, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <Trophy size={20} color="#a78bfa" />
          Digital<span className="gradient-text">Heroes</span>
        </Link>
        <ul className="navbar-links">
          <li><Link to="/how-it-works">How It Works</Link></li>
          <li><Link to="/charities">Charities</Link></li>
        </ul>
        <div className="navbar-actions">
          {user ? (
            <>
              {profile?.role === 'admin' && (
                <Link to="/admin" className="btn btn-ghost btn-sm" style={{ gap:'0.4rem', display:'flex', alignItems:'center' }}>
                  <ShieldCheck size={14} /> Admin
                </Link>
              )}
              <Link to="/dashboard" className="btn btn-ghost btn-sm">
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Subscribe Now</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
