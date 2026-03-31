import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, HeartHandshake, Zap, Users } from 'lucide-react';

const CHARITIES = [
  { name: 'Global Clean Water Initiative', cause: 'Clean Water', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { name: 'Youth Sports Foundation', cause: 'Youth Sport', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { name: 'Wildlife Conservation Trust', cause: 'Conservation', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
];

export default function Home() {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* ── Hero ── */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '4rem 0' }}>
        {/* Background orbs */}
        <div className="hero-orb" style={{ width: 600, height: 600, background: 'var(--primary)', top: '-10%', left: '-15%' }} />
        <div className="hero-orb" style={{ width: 500, height: 500, background: 'var(--accent)', bottom: '-15%', right: '-10%' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 760 }}>
            <div className="label-tag animate-fade-in">🏌️ Golf × Charity × Prizes</div>
            <h1 className="animate-fade-in" style={{ animationDelay: '0.1s', marginBottom: '1.5rem', lineHeight: 1.1 }}>
              Play with Purpose.<br />
              <span className="gradient-text">Win with Impact.</span>
            </h1>
            <p className="animate-fade-in" style={{ fontSize: '1.2rem', maxWidth: 600, marginBottom: '2.5rem', animationDelay: '0.2s', lineHeight: 1.7 }}>
              Join the UK's most exciting golf subscription. Track your Stableford scores, enter monthly prize draws, and automatically support a charity of your choice — every single month.
            </p>
            <div className="animate-fade-in flex gap-2" style={{ animationDelay: '0.3s', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ animation: 'pulse-glow 2.5s ease-in-out infinite' }}>
                Start from £20/month <ArrowRight size={18} />
              </Link>
              <Link to="/how-it-works" className="btn btn-ghost btn-lg">See how it works</Link>
            </div>
            <div className="animate-fade-in flex gap-3 mt-4" style={{ animationDelay: '0.4s', flexWrap: 'wrap' }}>
              <div className="flex items-center gap-1" style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                Min. 10% to charity
              </div>
              <div className="flex items-center gap-1" style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                Monthly jackpot draw
              </div>
              <div className="flex items-center gap-1" style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-gold)' }} />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section style={{ padding: '2rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'center' }}>
            {[
              { value: '£40k+', label: 'Total Prize Pool to Date', icon: <Trophy size={20} color="#f59e0b" /> },
              { value: '3 Charities', label: 'Partner Organisations', icon: <HeartHandshake size={20} color="#10b981" /> },
              { value: '5-Score', label: 'Rolling Draw Qualification', icon: <Zap size={20} color="#a78bfa" /> },
              { value: '2 Plans', label: 'Monthly & Yearly Options', icon: <Users size={20} color="#38bdf8" /> },
            ].map((s, i) => (
              <div key={i} style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="label-tag">The Process</div>
            <h2>How <span className="gradient-text">Every Month</span> Works</h2>
          </div>
          <div className="grid-3">
            {[
              { n: '01', icon: '🎯', title: 'Subscribe & Give', desc: 'Pick your plan (monthly or yearly) and select a charity. Min 10% of your fee goes directly to them. Increase it anytime.', color: 'var(--primary)' },
              { n: '02', icon: '⛳', title: 'Log Your Scores', desc: 'Enter your last 5 Stableford golf scores (1-45). Every new score added automatically drops the oldest one.', color: 'var(--accent)' },
              { n: '03', icon: '🏆', title: 'Enter the Draw', desc: 'Every active subscriber with scores on file is automatically entered into the monthly prize draw. Match 3, 4 or 5 to win.', color: 'var(--accent-gold)' },
            ].map((s) => (
              <div key={s.n} className="glass-pane interactive" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>{s.icon}</div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: s.color, letterSpacing: '0.1em' }}>STEP {s.n}</span>
                <h3 style={{ color: 'white' }}>{s.title}</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prize Pool ── */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="label-tag">💰 Prize Structure</div>
            <h2>The <span className="gradient-text">Three Prize Tiers</span></h2>
            <p style={{ maxWidth: 520, margin: '0.75rem auto 0' }}>5% of every subscription funds the prize pool. Jackpot rolls over every month until someone wins!</p>
          </div>
          <div className="grid-3">
            {[
              { tier: '5-Number Match', share: '40%', label: 'JACKPOT', rollover: true, color: '#f59e0b', glow: 'rgba(245,158,11,0.3)', desc: 'Rolls over monthly if unclaimed — grows each month!' },
              { tier: '4-Number Match', share: '35%', label: 'BIG WIN', rollover: false, color: '#a78bfa', glow: 'rgba(167,139,250,0.3)', desc: 'Split equally among all 4-match winners that month.' },
              { tier: '3-Number Match', share: '25%', label: 'WIN', rollover: false, color: '#34d399', glow: 'rgba(52,211,153,0.3)', desc: 'Split equally among all 3-match winners that month.' },
            ].map((t) => (
              <div key={t.tier} className="glass-pane" style={{ padding: '2rem', borderTop: `3px solid ${t.color}`, boxShadow: `0 0 30px ${t.glow}`, textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: t.color, letterSpacing: '0.12em' }}>{t.label}</span>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: t.color, margin: '0.5rem 0' }}>{t.share}</div>
                <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>{t.tier}</div>
                <p style={{ fontSize: '0.875rem' }}>{t.desc}</p>
                {t.rollover && <div className="badge badge-pending mt-2" style={{ display: 'inline-flex' }}>🔄 Jackpot Rollover</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Charities ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="label-tag"><HeartHandshake size={12} style={{ display:'inline', marginRight:'0.3rem' }} />Charity Partners</div>
            <h2>Your Game. <span className="gradient-text">Their Impact.</span></h2>
            <p style={{ maxWidth: 480, margin: '0.75rem auto 0' }}>Choose where your contribution goes at signup. Every subscription month delivers guaranteed support.</p>
          </div>
          <div className="grid-3">
            {CHARITIES.map((c) => (
              <div key={c.name} className="glass-pane interactive" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${c.color}40` }}>
                  <HeartHandshake size={24} color={c.color} />
                </div>
                <div>
                  <h4 style={{ color: 'white', marginBottom: '0.3rem' }}>{c.name}</h4>
                  <span className="badge" style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}40`, fontSize: '0.7rem' }}>{c.cause}</span>
                </div>
                <p style={{ fontSize: '0.875rem' }}>Dedicated to creating lasting positive change through sustainable programmes and community partnerships.</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/charities" className="btn btn-ghost">View All Charities <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '6rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-orb" style={{ width: 400, height: 400, background: 'var(--primary)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to <span className="gradient-text">Play for a Cause?</span></h2>
          <p style={{ maxWidth: 440, margin: '0 auto 2rem', fontSize: '1.05rem' }}>Join today for as little as £20 a month. Every round counts — for you, and for the world.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Subscribe Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
