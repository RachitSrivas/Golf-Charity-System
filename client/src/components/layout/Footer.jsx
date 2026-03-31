import { Link } from 'react-router-dom';
import { HeartHandshake, Trophy } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ padding: '3rem 1.5rem', borderTop: '1px solid var(--border-color)', marginTop: '4rem', background: 'rgba(255,255,255,0.01)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ maxWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
              <Trophy size={20} color="#a78bfa" />
              Digital<span className="gradient-text">Heroes</span>
            </div>
            <p style={{ fontSize: '0.875rem' }}>A subscription-driven golf platform combining performance tracking, charity fundraising, and a monthly draw-based reward engine.</p>
          </div>
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Platform</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/how-it-works" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>How It Works</Link>
                <Link to="/charities" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Charities</Link>
                <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Subscribe</Link>
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Account</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Log In</Link>
                <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.8rem' }}>© {new Date().getFullYear()} Digital Heroes · digitalheroes.co.in · All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <HeartHandshake size={14} color="var(--accent)" /> Built for charity, powered by community.
          </div>
        </div>
      </div>
    </footer>
  );
}
