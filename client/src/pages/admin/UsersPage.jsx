import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Edit2, CheckCircle, XCircle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    api.get('/admin/users').then(r => { setUsers(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/users/${editUser.id}`, { full_name: editUser.full_name, role: editUser.role });
      toast.success('User updated');
      setEditUser(null);
      fetch();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const toggleSub = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/admin/users/${userId}/subscription`, { status: newStatus });
      toast.success(`Subscription ${newStatus}`);
      fetch();
    } catch { toast.error('Failed'); }
  };

  const filtered = users.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <h1>User Management</h1>
        <p>View and manage all registered users and their subscriptions.</p>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: 360 }}>
        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
      </div>

      {loading ? <div className="skeleton" style={{ height: 300, borderRadius: 12 }} /> : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Plan</th><th>Sub Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => {
                const sub = u.subscriptions?.[0];
                return (
                  <tr key={u.id}>
                    <td style={{ color: 'white', fontWeight: 500 }}>{u.full_name || '—'}</td>
                    <td style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-rejected' : 'badge-inactive'}`}>{u.role}</span></td>
                    <td style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{sub?.plan || '—'}</td>
                    <td>
                      {sub ? (
                        <span className={`badge ${sub.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                          {sub.status === 'active' ? <CheckCircle size={11} /> : <XCircle size={11} />} {sub.status}
                        </span>
                      ) : <span className="badge badge-inactive">No Sub</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setEditUser({ ...u })} className="btn btn-ghost btn-sm"><Edit2 size={13} /></button>
                        {sub && (
                          <button onClick={() => toggleSub(u.id, sub.status)} className={`btn btn-sm ${sub.status === 'active' ? 'btn-danger' : 'btn-accent'}`}>
                            {sub.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
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

      {editUser && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setEditUser(null); }}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={() => setEditUser(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={editUser.full_name || ''} onChange={e => setEditUser(u => ({ ...u, full_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={editUser.role} onChange={e => setEditUser(u => ({ ...u, role: e.target.value }))}>
                  <option value="subscriber">subscriber</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-ghost" onClick={() => setEditUser(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEdit} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
