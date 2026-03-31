import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/charities — list active charities
router.get('/', async (req, res) => {
  const { search, featured } = req.query;
  let query = supabaseAdmin.from('charities').select('*').eq('is_active', true);
  if (search) query = query.ilike('name', `%${search}%`);
  if (featured === 'true') query = query.eq('is_featured', true);
  const { data, error } = await query.order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/charities/:id — individual charity profile
router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('charities')
    .select('*, charity_events(*)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Charity not found' });
  res.json(data);
});

// PATCH /api/charities/select — user selects/changes charity
router.patch('/select', protect, async (req, res) => {
  const { charityId, charityPercent = 10 } = req.body;
  if (charityPercent < 10 || charityPercent > 100) {
    return res.status(400).json({ error: 'Contribution must be between 10% and 100%' });
  }
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ charity_id: charityId, charity_percentage: charityPercent })
    .eq('user_id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Charity preference updated' });
});

// POST /api/charities/donate — independent donation (not tied to subscription)
router.post('/donate', protect, async (req, res) => {
  const { charityId, amount } = req.body;
  if (!charityId || !amount || amount <= 0) return res.status(400).json({ error: 'Invalid donation data' });
  const { data, error } = await supabaseAdmin.from('independent_donations').insert({
    user_id: req.user.id, charity_id: charityId, amount,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
