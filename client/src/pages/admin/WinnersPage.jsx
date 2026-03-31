import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, DollarSign, Clock } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function WinnersPage() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    api.get('/winners').then(r => { setWinners(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const reviewVerification = async (veriId, status) => {
    try {
      await api.patch(`/winners/verification/${veriId}`, { status });
      toast.success(`Verification ${status}`);
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const markPaid = async (resultId) => {
    try {
      await api.patch(`/winners/${resultId}/payout`);
      toast.success('Marked as paid!');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Winners Management</h1>
        <p>Review verification submissions and manage prize payouts.</p>
      </div>

      <div className="stats-grid mb-4">
        <div className="glass-pane stat-card" style={{ borderTop: '3px solid var(--accent-gold)' }}>
          <div className="stat-label">Total Winners</div>
          <div className="stat-value">{winners.length}</div>
        </div>
        <div className="glass-pane stat-card" style={{ borderTop: '3px solid var(--accent)' }}>
          <div className="stat-label">Paid Out</div>
          <div className="stat-value">{winners.filter(w => w.payment_status === 'paid').length}</div>
        </div>
        <div className="glass-pane stat-card" style={{ borderTop: '3px solid var(--primary)' }}>
          <div className="stat-label">Pending Verification</div>
          <div className="stat-value">{winners.filter(w => w.winner_verifications?.[0]?.status === 'pending').length}</div>
        </div>
        <div className="glass-pane stat-card" style={{ borderTop: '3px solid var(--danger)' }}>
          <div className="stat-label">Awaiting Upload</div>
          <div className="stat-value">{winners.filter(w => !w.winner_verifications?.length).length}</div>
        </div>
      </div>

      {loading ? <div className="skeleton" style={{ height: 300, borderRadius: 12 }} /> : winners.length === 0 ? (
        <div className="glass-pane" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No winners yet.</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Winner</th><th>Draw</th><th>Tier</th><th>Prize</th><th>Payment</th><th>Verification</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {winners.map(w => {
                const veri = w.winner_verifications?.[0];
                return (
                  <tr key={w.id}>
                    <td>
                      <div style={{ color: 'white', fontWeight: 500 }}>{w.users?.full_name || '—'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{w.users?.email}</div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{w.draws ? `${MONTHS[w.draws.month - 1]} ${w.draws.year}` : '—'}</td>
                    <td><span className="badge badge-pending">{w.match_type}-Match</span></td>
                    <td style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>£{parseFloat(w.prize_amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${w.payment_status === 'paid' ? 'badge-paid' : 'badge-pending'}`}>
                        {w.payment_status === 'paid' ? <><CheckCircle size={11} />Paid</> : <><Clock size={11} />Pending</>}
                      </span>
                    </td>
                    <td>
                      {!veri && <span className="badge badge-inactive">Not Submitted</span>}
                      {veri?.status === 'pending' && (
                        <a href={veri.proof_url} target="_blank" rel="noopener noreferrer" className="badge badge-pending" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                          <Clock size={11} /> View Proof
                        </a>
                      )}
                      {veri?.status === 'approved' && <span className="badge badge-approved"><CheckCircle size={11} /> Approved</span>}
                      {veri?.status === 'rejected' && <span className="badge badge-rejected"><XCircle size={11} /> Rejected</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {veri?.status === 'pending' && (
                          <>
                            <button onClick={() => reviewVerification(veri.id, 'approved')} className="btn btn-accent btn-sm"><CheckCircle size={13} /> Approve</button>
                            <button onClick={() => reviewVerification(veri.id, 'rejected')} className="btn btn-danger btn-sm"><XCircle size={13} /></button>
                          </>
                        )}
                        {veri?.status === 'approved' && w.payment_status !== 'paid' && (
                          <button onClick={() => markPaid(w.id)} className="btn btn-primary btn-sm"><DollarSign size={13} /> Mark Paid</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
