import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { protect, requireSubscription } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { randomDraw, algorithmicDraw, countMatches, classifyMatch } from '../services/drawEngine.js';
import { calculateTotalPool, calculatePools, distributePrizes } from '../services/prizeCalculator.js';
import { sendWinnerEmail, sendDrawPublishedEmail } from '../services/emailService.js';

const router = express.Router();

// GET /api/draws — list all published draws (public/subscriber)
router.get('/', protect, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('year', { ascending: false })
    .order('month', { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// GET /api/draws/upcoming — next draw info
router.get('/upcoming', async (req, res) => {
  const now = new Date();
  const { data } = await supabaseAdmin.from('draws').select('*').eq('status', 'draft').order('year').order('month').limit(1).single();
  res.json(data || { month: now.getMonth() + 1, year: now.getFullYear(), status: 'upcoming' });
});

// GET /api/draws/:id/my-result — get current user's result for a draw
router.get('/:id/my-result', protect, async (req, res) => {
  const { data } = await supabaseAdmin.from('draw_results').select('*').eq('draw_id', req.params.id).eq('user_id', req.user.id).single();
  res.json(data || null);
});

// POST /api/draws — admin: create a draw
router.post('/', protect, requireAdmin, async (req, res) => {
  const { month, year, draw_type } = req.body;
  const { data, error } = await supabaseAdmin.from('draws').insert({ month, year, draw_type, status: 'draft' }).select().single();
  if (error) return res.status(500).json({ error });
  res.status(201).json(data);
});

// POST /api/draws/:id/simulate — admin: run simulation
router.post('/:id/simulate', protect, requireAdmin, async (req, res) => {
  const drawId = req.params.id;
  const { data: draw } = await supabaseAdmin.from('draws').select('*').eq('id', drawId).single();
  if (!draw) return res.status(404).json({ error: 'Draw not found' });

  // Get all user scores for algorithmic mode
  let drawn_numbers;
  if (draw.draw_type === 'algorithmic') {
    const { data: allScores } = await supabaseAdmin.from('scores').select('score');
    drawn_numbers = algorithmicDraw(allScores.map(s => s.score));
  } else {
    drawn_numbers = randomDraw();
  }

  // Count active subscribers for total pool
  const { count: subCount } = await supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const totalPool = calculateTotalPool(subCount || 0);

  // Fetch previous rollover
  const { data: prevDraw } = await supabaseAdmin.from('draws').select('jackpot_rollover, total_pool').eq('status', 'published').order('year', { ascending: false }).order('month', { ascending: false }).limit(1).single();
  const rolledOver = prevDraw?.jackpot_rollover ? prevDraw.total_pool * 0.4 : 0;
  const pools = calculatePools(totalPool, rolledOver);

  // Match each subscriber
  const { data: subscribers } = await supabaseAdmin.from('subscriptions').select('user_id').eq('status', 'active');
  const winners5 = [], winners4 = [], winners3 = [];

  for (const sub of subscribers) {
    const { data: scores } = await supabaseAdmin.from('scores').select('score').eq('user_id', sub.user_id);
    const userScores = scores.map(s => s.score);
    const matchCount = countMatches(userScores, drawn_numbers);
    const tier = classifyMatch(matchCount);
    if (tier === 5) winners5.push(sub.user_id);
    else if (tier === 4) winners4.push(sub.user_id);
    else if (tier === 3) winners3.push(sub.user_id);
  }

  const jackpotWon = winners5.length > 0;
  const { prizes, rollover } = distributePrizes(pools, { 5: winners5.length, 4: winners4.length, 3: winners3.length }, jackpotWon);

  // Update draw with simulation results
  await supabaseAdmin.from('draws').update({
    drawn_numbers,
    status: 'simulated',
    total_pool: totalPool,
    jackpot_rollover: !jackpotWon,
  }).eq('id', drawId);

  res.json({
    drawn_numbers, totalPool, pools, prizes,
    winners: { 5: winners5.length, 4: winners4.length, 3: winners3.length },
    jackpotWon, rollover
  });
});

// POST /api/draws/:id/publish — admin: publish and record results
router.post('/:id/publish', protect, requireAdmin, async (req, res) => {
  const drawId = req.params.id;
  const { data: draw } = await supabaseAdmin.from('draws').select('*').eq('id', drawId).single();
  if (!draw || draw.status !== 'simulated') return res.status(400).json({ error: 'Run simulation first' });

  const drawnNums = draw.drawn_numbers;
  const pools = calculatePools(draw.total_pool || 0, 0);
  const { data: subs } = await supabaseAdmin.from('subscriptions').select('user_id').eq('status', 'active');
  const winners5 = [], winners4 = [], winners3 = [];

  for (const sub of subs) {
    const { data: scores } = await supabaseAdmin.from('scores').select('score').eq('user_id', sub.user_id);
    const userScores = scores.map(s => s.score);
    const matchCount = countMatches(userScores, drawnNums);
    const tier = classifyMatch(matchCount);
    if (tier === 5) winners5.push(sub.user_id);
    else if (tier === 4) winners4.push(sub.user_id);
    else if (tier === 3) winners3.push(sub.user_id);
  }

  const jackpotWon = winners5.length > 0;
  const { prizes } = distributePrizes(pools, { 5: winners5.length, 4: winners4.length, 3: winners3.length }, jackpotWon);

  // Insert draw_results
  const resultRows = [
    ...winners5.map(uid => ({ draw_id: drawId, user_id: uid, match_type: 5, prize_amount: prizes[5], payment_status: 'pending' })),
    ...winners4.map(uid => ({ draw_id: drawId, user_id: uid, match_type: 4, prize_amount: prizes[4], payment_status: 'pending' })),
    ...winners3.map(uid => ({ draw_id: drawId, user_id: uid, match_type: 3, prize_amount: prizes[3], payment_status: 'pending' })),
  ];
  if (resultRows.length > 0) await supabaseAdmin.from('draw_results').insert(resultRows);

  await supabaseAdmin.from('draws').update({ status: 'published' }).eq('id', drawId);

  // Email all subscribers
  const { data: allUsers } = await supabaseAdmin.from('users').select('email, full_name');
  for (const u of allUsers) {
    try { await sendDrawPublishedEmail(u.email, u.full_name); } catch {}
  }

  res.json({ message: 'Draw published', winners: resultRows.length });
});

export default router;
