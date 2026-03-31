import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <div className="glass-pane animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="label-tag"><LogIn size={12} style={{ display:'inline',marginRight:'0.4rem' }} />Welcome Back</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Sign In</h2>
          <p style={{ fontSize: '0.9rem' }}>Enter your credentials to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Sign In'}
          </button>
        </form>

        <div className="divider" />
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>Subscribe Now</Link>
        </div>

        {/* Demo creds hint */}
        <div className="glass-pane mt-4" style={{ padding: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-sub)' }}>Test Credentials:</strong><br />
          User: testuser@golf.dev / Test1234!<br />
          Admin: admin@golf.dev / Admin1234!
        </div>
      </div>
    </div>
  );
}
