import express from 'express';
import { getUserClient, supabaseAdmin } from '../config/supabase.js';
import { protect, requireSubscription } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/scores — get user's latest 5 scores
router.get('/', protect, async (req, res) => {
  try {
    // Use user-scoped client (respects RLS, works without service role key)
    const db = req.token ? getUserClient(req.token) : supabaseAdmin;
    const { data, error } = await db
      .from('scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('played_on', { ascending: false })
      .limit(5);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scores — add a new score (rolling 5-score window)
router.post('/', protect, async (req, res) => {
  const { score, played_on } = req.body;

  if (!score || parseInt(score) < 1 || parseInt(score) > 45) {
    return res.status(400).json({ error: 'Score must be between 1 and 45 (Stableford format)' });
  }
  if (!played_on) return res.status(400).json({ error: 'played_on date is required' });

  try {
    const db = req.token ? getUserClient(req.token) : supabaseAdmin;

    // Count existing scores
    const { count } = await db
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    // If already 5 scores, delete the oldest before inserting
    if (count >= 5) {
      const { data: oldest } = await db
        .from('scores')
        .select('id')
        .eq('user_id', req.user.id)
        .order('played_on', { ascending: true })
        .limit(1)
        .single();
      if (oldest) await db.from('scores').delete().eq('id', oldest.id);
    }

    const { data, error } = await db.from('scores').insert({
      user_id: req.user.id,
      score: parseInt(score),
      played_on,
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/scores/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const db = req.token ? getUserClient(req.token) : supabaseAdmin;
    const { error } = await db.from('scores').delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id); // RLS also enforces this
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Score deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
