import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BarChart3, Users, DollarSign, Trophy, HeartHandshake, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  const CARDS = [
    { label: 'Total Users', value: data?.totalUsers || 0, sub: 'All registered accounts', color: '#a78bfa', icon: <Users size={20} color="#a78bfa" /> },
    { label: 'Active Subscribers', value: data?.activeSubscribers || 0, sub: 'Currently paying members', color: 'var(--accent)', icon: <TrendingUp size={20} color="var(--accent)" /> },
    { label: 'Total Prize Pool', value: `£${(data?.totalPrizePool || 0).toFixed(0)}`, sub: 'Across all draws', color: 'var(--accent-gold)', icon: <Trophy size={20} color="var(--accent-gold)" /> },
    { label: 'Total Paid Out', value: `£${(data?.totalPaid || 0).toFixed(0)}`, sub: 'To verified winners', color: '#38bdf8', icon: <DollarSign size={20} color="#38bdf8" /> },
    { label: 'Charity Donations', value: `£${(data?.totalDonations || 0).toFixed(0)}`, sub: 'Independent donations', color: '#fb7185', icon: <HeartHandshake size={20} color="#fb7185" /> },
    { label: 'Total Draws Run', value: data?.drawCount || 0, sub: 'Published draws', color: 'var(--primary)', icon: <BarChart3 size={20} color="var(--primary)" /> },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Platform-wide statistics and performance metrics.</p>
      </div>

      <div className="stats-grid mb-4">
        {CARDS.map(c => (
          <div key={c.label} className="glass-pane stat-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div className="stat-label">{c.label}</div>
              {c.icon}
            </div>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Draws Table */}
      <div className="glass-pane" style={{ padding: '1.75rem' }}>
        <h3 style={{ marginBottom: '1.25rem' }}>Recent Published Draws</h3>
        {data?.recentDraws?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No draws published yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Draw</th><th>Prize Pool</th><th>Status</th></tr></thead>
              <tbody>
                {data?.recentDraws?.map(d => (
                  <tr key={d.id}>
                    <td style={{ color: 'white', fontWeight: 500 }}>
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.month - 1]} {d.year}
                    </td>
                    <td style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>£{(d.total_pool || 0).toFixed(2)}</td>
                    <td><span className="badge badge-active">{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
