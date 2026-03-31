import express from 'express';
import { supabaseAdmin, supabase } from '../config/supabase.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password || !full_name)
    return res.status(400).json({ error: 'All fields required' });

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (error) return res.status(400).json({ error: error.message });

    // Insert into public.users (also done by DB trigger, but belt-and-suspenders)
    await supabaseAdmin.from('users').upsert({
      id: data.user.id,
      email,
      full_name,
      role: 'subscriber',
    }, { onConflict: 'id', ignoreDuplicates: true });

    res.status(201).json({ message: 'User registered.', userId: data.user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — returns profile + active subscription
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  // Verify token using anon client (no service role key needed)
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    // These fail gracefully if schema not run yet — returns empty profile
    const { data: profile } = await supabaseAdmin
      .from('users').select('*').eq('id', user.id).single();

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('*, charities(id, name, image_url)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    // Always return 200 — even if DB tables don't exist yet
    res.json({
      user: profile || { id: user.id, email: user.email, full_name: user.user_metadata?.full_name, role: 'subscriber' },
      subscription: sub || null,
    });
  } catch {
    // Schema not set up yet — return basic user info from Supabase Auth
    res.json({
      user: { id: user.id, email: user.email, full_name: user.user_metadata?.full_name, role: 'subscriber' },
      subscription: null,
    });
  }
});

export default router;
