import { supabaseAdmin, supabase } from '../config/supabase.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];

  // Use anon client for getUser() — works without service role key
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.user = user;
  req.token = token; // store for user-scoped DB calls

  // Try to attach subscription — fail silently if DB not ready yet
  try {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    req.subscription = sub || null;
  } catch {
    req.subscription = null;
  }
  next();
};

export const requireSubscription = (req, res, next) => {
  if (!req.subscription) {
    return res.status(403).json({ error: 'Active subscription required' });
  }
  next();
};

export const requireAdmin = async (req, res, next) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();
    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch {
    return res.status(403).json({ error: 'Admin access required' });
  }
};
