import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Dices, Trophy, Clock } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DrawsPage() {
  const [draws, setDraws] = useState([]);
  const [upcoming, setUpcoming] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/draws').then(r => r.data).catch(() => []),
      api.get('/draws/upcoming').then(r => r.data).catch(() => null),
    ]).then(([d, u]) => {
      setDraws(d); setUpcoming(u); setLoading(false);
      // Fetch my result for each draw
      d.forEach(draw => {
        api.get(`/draws/${draw.id}/my-result`).then(r => {
          if (r.data) setResults(prev => ({ ...prev, [draw.id]: r.data }));
        }).catch(() => {});
      });
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Monthly Draws</h1>
        <p>Track upcoming and past draw results. Match your scores to win.</p>
      </div>

      {/* Upcoming draw */}
      {upcoming && (
        <div className="glass-pane mb-4" style={{ padding: '2rem', borderTop: '3px solid var(--primary)', background: 'rgba(124,58,237,0.05)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div className="label-tag" style={{ marginBottom: '0.75rem' }}>
                <Clock size={12} style={{ display:'inline',marginRight:'0.3rem' }} /> Upcoming Draw
              </div>
              <h2 style={{ marginBottom: '0.5rem' }}>
                {MONTHS[(upcoming.month || new Date().getMonth() + 1) - 1]} {upcoming.year || new Date().getFullYear()} Draw
              </h2>
              <p style={{ marginBottom: '1rem' }}>All active subscribers with 5 logged scores are automatically entered. Match 3, 4, or 5 numbers to win!</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-pending">⏳ Pending</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 200 }}>
              {[{ tier:'5-Number Match', pct:'40%', label:'Jackpot' }, { tier:'4-Number Match', pct:'35%', label:'Big Win' }, { tier:'3-Number Match', pct:'25%', label:'Win' }].map(t => (
                <div key={t.tier} className="glass-pane" style={{ padding: '0.6rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{t.tier}</span>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{t.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Past draws */}
      <h3 style={{ marginBottom: '1.25rem' }}>Past Draw Results</h3>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : draws.length === 0 ? (
        <div className="glass-pane" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Dices size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
          <p>No published draws yet. Check back after the first monthly draw!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {draws.map(d => {
            const myResult = results[d.id];
            return (
              <div key={d.id} className="glass-pane" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.4rem' }}>{MONTHS[d.month - 1]} {d.year} Draw</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {d.drawn_numbers?.map(n => (
                      <span key={n} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', border: '1px solid var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#a78bfa' }}>{n}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {myResult ? (
                    <div>
                      <span className="badge badge-active" style={{ fontSize: '0.8rem' }}>
                        <Trophy size={12} /> {myResult.match_type}-Match Winner! £{parseFloat(myResult.prize_amount).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="badge badge-inactive">No match this draw</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
