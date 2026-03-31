import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Trophy, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function WinningsPage() {
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState(null); // draw_result_id
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetch = () => api.get('/winners/me').then(r => { setWinnings(r.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const submitProof = async () => {
    if (!proofUrl) return toast.error('Please provide a screenshot URL');
    setUploading(true);
    try {
      await api.post(`/winners/${proofModal}/verify`, { proof_url: proofUrl });
      toast.success('Proof submitted for review!');
      setProofModal(null); setProofUrl('');
      fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Submission failed'); }
    finally { setUploading(false); }
  };

  const total = winnings.reduce((s, w) => s + (w.prize_amount || 0), 0);
  const paid = winnings.filter(w => w.payment_status === 'paid').reduce((s, w) => s + (w.prize_amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1>My Winnings</h1>
        <p>View your prize history, upload verification, and track payouts.</p>
      </div>

      <div className="stats-grid mb-4">
        <div className="glass-pane stat-card" style={{ borderTop: '3px solid var(--accent-gold)' }}>
          <div className="stat-label">Total Won</div>
          <div className="stat-value">£{total.toFixed(2)}</div>
          <div className="stat-sub">Across {winnings.length} prize{winnings.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="glass-pane stat-card" style={{ borderTop: '3px solid var(--accent)' }}>
          <div className="stat-label">Total Paid Out</div>
          <div className="stat-value">£{paid.toFixed(2)}</div>
          <div className="stat-sub">{winnings.filter(w => w.payment_status === 'paid').length} paid prizes</div>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
      ) : winnings.length === 0 ? (
        <div className="glass-pane" style={{ padding: '4rem', textAlign: 'center' }}>
          <Trophy size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Winnings Yet</h3>
          <p>Keep logging your scores and entering draws to win!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Draw</th><th>Match Tier</th><th>Prize</th><th>Payment</th><th>Verification</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {winnings.map(w => {
                const veri = w.winner_verifications?.[0];
                return (
                  <tr key={w.id}>
                    <td style={{ color: 'white', fontWeight: 500 }}>{MONTHS[(w.draws?.month || 1) - 1]} {w.draws?.year}</td>
                    <td>
                      <span className="badge badge-pending" style={{ fontWeight: 700 }}>
                        <Trophy size={11} /> {w.match_type}-Number Match
                      </span>
                    </td>
                    <td style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '1.05rem' }}>£{parseFloat(w.prize_amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${w.payment_status === 'paid' ? 'badge-paid' : 'badge-pending'}`}>
                        {w.payment_status === 'paid' ? <><CheckCircle size={11} /> Paid</> : <><Clock size={11} /> Pending</>}
                      </span>
                    </td>
                    <td>
                      {!veri && <span className="badge badge-inactive">Not Submitted</span>}
                      {veri?.status === 'pending' && <span className="badge badge-pending"><Clock size={11} /> Under Review</span>}
                      {veri?.status === 'approved' && <span className="badge badge-approved"><CheckCircle size={11} /> Approved</span>}
                      {veri?.status === 'rejected' && <span className="badge badge-rejected"><XCircle size={11} /> Rejected</span>}
                    </td>
                    <td>
                      {(!veri || veri.status === 'rejected') && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setProofModal(w.id)}>
                          <Upload size={13} /> Upload Proof
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Proof modal */}
      {proofModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setProofModal(null); }}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>Upload Verification Proof</h3>
              <button className="modal-close" onClick={() => setProofModal(null)}>✕</button>
            </div>
            <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Submit a screenshot URL of your scores from the golf platform as proof of your win.
            </p>
            <div className="form-group mb-4">
              <label className="form-label">Screenshot URL</label>
              <input className="form-input" type="url" value={proofUrl} onChange={e => setProofUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setProofModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-primary" onClick={submitProof} disabled={uploading} style={{ flex: 1, justifyContent: 'center' }}>
                {uploading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><Upload size={14} /> Submit Proof</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
