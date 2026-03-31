import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { HeartHandshake, Search, ExternalLink } from 'lucide-react';

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/charities').then(res => { setCharities(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const COLORS = ['#a78bfa', '#34d399', '#f59e0b', '#38bdf8', '#fb7185'];

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '5rem 1.5rem 3rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="label-tag"><HeartHandshake size={12} style={{ display:'inline',marginRight:'0.4rem' }} />Charity Directory</div>
        <h1 style={{ marginBottom: '1rem' }}>Our <span className="gradient-text">Charity Partners</span></h1>
        <p style={{ maxWidth: 520, margin: '0 auto 2rem', fontSize: '1.05rem' }}>
          Every subscriber automatically contributes to a charity of their choice. Explore our verified partners below.
        </p>
        <div style={{ position: 'relative', maxWidth: 400, margin: '0 auto' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search charities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 12 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No charities found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
            {filtered.map((c, i) => {
              const color = COLORS[i % COLORS.length];
              return (
                <div key={c.id} className="glass-pane interactive" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `3px solid ${color}` }}>
                  {c.is_featured && <span className="badge badge-active" style={{ width: 'fit-content' }}>⭐ Featured</span>}
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <HeartHandshake size={22} color={color} />
                  </div>
                  <h3 style={{ color: 'white' }}>{c.name}</h3>
                  <p style={{ fontSize: '0.9rem', flexGrow: 1 }}>{c.description || 'Dedicated to creating lasting positive change through sustainable community programmes.'}</p>
                  <Link to={`/charities/${c.id}`} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
                    View Profile <ExternalLink size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
