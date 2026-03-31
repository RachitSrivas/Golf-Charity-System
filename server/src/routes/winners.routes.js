import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// GET /api/winners/me — current user's winnings
router.get('/me', protect, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('draw_results')
    .select('*, draws(month, year, drawn_numbers), winner_verifications(*)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// POST /api/winners/:resultId/verify — user uploads proof
router.post('/:resultId/verify', protect, async (req, res) => {
  const { proof_url } = req.body;
  if (!proof_url) return res.status(400).json({ error: 'Proof URL required' });

  // Confirm this result belongs to user
  const { data: result } = await supabaseAdmin.from('draw_results').select('*').eq('id', req.params.resultId).eq('user_id', req.user.id).single();
  if (!result) return res.status(404).json({ error: 'Result not found' });

  const { data, error } = await supabaseAdmin.from('winner_verifications').insert({
    draw_result_id: req.params.resultId,
    user_id: req.user.id,
    proof_url,
    status: 'pending',
  }).select().single();
  if (error) return res.status(500).json({ error });
  res.status(201).json(data);
});

// GET /api/winners — admin: all winners
router.get('/', protect, requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('draw_results')
    .select('*, users(full_name, email), draws(month, year), winner_verifications(*)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// PATCH /api/winners/verification/:id — admin: approve or reject
router.patch('/verification/:id', protect, requireAdmin, async (req, res) => {
  const { status } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const { data, error } = await supabaseAdmin.from('winner_verifications').update({ status, reviewed_at: new Date() }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// PATCH /api/winners/:resultId/payout — admin: mark as paid
router.patch('/:resultId/payout', protect, requireAdmin, async (req, res) => {
  const { error } = await supabaseAdmin.from('draw_results').update({ payment_status: 'paid' }).eq('id', req.params.resultId);
  if (error) return res.status(500).json({ error });
  res.json({ message: 'Marked as paid' });
});

export default router;
