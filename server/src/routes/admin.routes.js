import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, requireAdmin);

// --- USERS ---
// GET /api/admin/users
router.get('/users', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('users').select('*, subscriptions(plan, status, current_period_end, charity_percentage, charities(name))').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req, res) => {
  const { full_name, role } = req.body;
  const { data, error } = await supabaseAdmin.from('users').update({ full_name, role }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// GET /api/admin/users/:id/scores
router.get('/users/:id/scores', async (req, res) => {
  const { data } = await supabaseAdmin.from('scores').select('*').eq('user_id', req.params.id).order('played_on', { ascending: false });
  res.json(data);
});

// PATCH /api/admin/users/:id/subscription
router.patch('/users/:id/subscription', async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabaseAdmin.from('subscriptions').update({ status }).eq('user_id', req.params.id).select().single();
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// --- CHARITIES (Admin CRUD) ---
// GET /api/admin/charities
router.get('/charities', async (req, res) => {
  const { data } = await supabaseAdmin.from('charities').select('*').order('name');
  res.json(data);
});

// POST /api/admin/charities
router.post('/charities', async (req, res) => {
  const { name, description, image_url, is_featured } = req.body;
  const { data, error } = await supabaseAdmin.from('charities').insert({ name, description, image_url, is_featured }).select().single();
  if (error) return res.status(500).json({ error });
  res.status(201).json(data);
});

// PATCH /api/admin/charities/:id
router.patch('/charities/:id', async (req, res) => {
  const { name, description, image_url, is_featured, is_active } = req.body;
  const { data, error } = await supabaseAdmin.from('charities').update({ name, description, image_url, is_featured, is_active }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// DELETE /api/admin/charities/:id
router.delete('/charities/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('charities').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error });
  res.json({ message: 'Charity deleted' });
});

// --- ANALYTICS ---
// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: draws },
    { data: pools },
    { data: donations },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('draws').select('id, month, year, total_pool, status').eq('status', 'published'),
    supabaseAdmin.from('draw_results').select('prize_amount, payment_status'),
    supabaseAdmin.from('independent_donations').select('amount'),
  ]);

  const totalPrizePool = draws?.reduce((sum, d) => sum + (d.total_pool || 0), 0) || 0;
  const totalPaid = pools?.filter(p => p.payment_status === 'paid').reduce((s, p) => s + (p.prize_amount || 0), 0) || 0;
  const totalDonations = donations?.reduce((s, d) => s + (d.amount || 0), 0) || 0;

  res.json({
    totalUsers,
    activeSubscribers,
    totalPrizePool,
    totalPaid,
    totalDonations,
    drawCount: draws?.length || 0,
    recentDraws: draws?.slice(-5) || [],
  });
});

export default router;
