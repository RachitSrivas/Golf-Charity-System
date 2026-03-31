import { supabaseAdmin } from '../config/supabase.js';

export const requireAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', req.user.id)
    .single();
  if (!profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
