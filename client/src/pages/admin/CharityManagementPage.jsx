import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';

const EMPTY = { name: '', description: '', image_url: '', is_featured: false };

export default function CharityManagementPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | charity obj
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    api.get('/admin/charities').then(r => { setCharities(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description || '', image_url: c.image_url || '', is_featured: c.is_featured }); setModal(c); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/admin/charities', form);
        toast.success('Charity created!');
      } else {
        await api.patch(`/admin/charities/${modal.id}`, form);
        toast.success('Charity updated!');
      }
      setModal(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteCharity = async (id) => {
    if (!window.confirm('Delete this charity?')) return;
    try {
      await api.delete(`/admin/charities/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const toggleFeatured = async (c) => {
    try {
      await api.patch(`/admin/charities/${c.id}`, { is_featured: !c.is_featured });
      toast.success(c.is_featured ? 'Removed from featured' : 'Set as featured');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1>Charity Management</h1><p>Add, edit, and manage all charity partners.</p></div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> Add Charity</button>
      </div>

      {loading ? <div className="skeleton" style={{ height: 300, borderRadius: 12 }} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
          {charities.map(c => (
            <div key={c.id} className="glass-pane" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {c.is_featured && <span className="badge badge-active" style={{ width: 'fit-content', fontSize: '0.7rem' }}><Star size={10} /> Featured</span>}
              {c.image_url && <img src={c.image_url} alt={c.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />}
              <h4 style={{ color: 'white' }}>{c.name}</h4>
              <p style={{ fontSize: '0.85rem', flexGrow: 1 }}>{c.description || 'No description provided.'}</p>
              <span className={`badge ${c.is_active ? 'badge-active' : 'badge-inactive'}`} style={{ width: 'fit-content', fontSize: '0.7rem' }}>{c.is_active ? 'Active' : 'Inactive'}</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                <button onClick={() => openEdit(c)} className="btn btn-ghost btn-sm"><Edit2 size={13} /> Edit</button>
                <button onClick={() => toggleFeatured(c)} className="btn btn-ghost btn-sm" style={{ color: c.is_featured ? 'var(--accent-gold)' : undefined }}>
                  <Star size={13} /> {c.is_featured ? 'Unfeature' : 'Feature'}
                </button>
                <button onClick={() => deleteCharity(c.id)} className="btn btn-danger btn-sm"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>{modal === 'create' ? 'Add Charity' : 'Edit Charity'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." /></div>
              <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                Set as featured charity
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
