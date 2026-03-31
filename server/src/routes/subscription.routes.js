import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import stripeClient from '../config/stripe.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Demo mode when Stripe not configured (stripe.js exports null)
const STRIPE_CONFIGURED = stripeClient !== null;
const stripe = stripeClient;

const PLANS = {
  monthly: { price: 2000, interval: 'month', label: '£20/month', stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID },
  yearly:  { price: 20000, interval: 'year', label: '£200/year',  stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID },
};

// POST /api/subscriptions/checkout — Stripe or Demo checkout
router.post('/checkout', protect, async (req, res) => {
  const { plan, charityId, charityPercent = 10 } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

  // ═══════════════════════════════════════════════════════
  // DEMO MODE — if Stripe not configured, use built-in gateway
  // ═══════════════════════════════════════════════════════
  if (!STRIPE_CONFIGURED) {
    const CLIENT = process.env.CLIENT_URL || 'http://localhost:5173';
    // Return a URL to our demo payment page with all params encoded
    const params = new URLSearchParams({
      plan, charityId: charityId || '', charityPercent, userId: req.user.id,
      email: req.user.email, label: PLANS[plan].label,
    });
    return res.json({ url: `${CLIENT}/demo-checkout?${params.toString()}`, demo: true });
  }

  // ═══════════════════════════════════════════════════════
  // LIVE MODE — real Stripe Checkout
  // ═══════════════════════════════════════════════════════
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PLANS[plan].stripePriceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.CLIENT_URL}/register`,
      metadata: { userId: req.user.id, plan, charityId, charityPercent },
      customer_email: req.user.email,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions/demo-activate — demo gateway: instant activation
router.post('/demo-activate', protect, async (req, res) => {
  const { plan, charityId, charityPercent = 10 } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

  try {
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + (plan === 'yearly' ? 365 : 30));

    const { data, error } = await supabaseAdmin.from('subscriptions').upsert({
      user_id: req.user.id,
      plan,
      status: 'active',
      stripe_subscription_id: `demo_${Date.now()}`,
      charity_id: charityId || null,
      charity_percentage: parseInt(charityPercent) || 10,
      current_period_end: periodEnd.toISOString(),
    }, { onConflict: 'user_id' }).select().single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Subscription activated (demo mode)', subscription: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions/webhook — Stripe webhook (only if Stripe configured)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!STRIPE_CONFIGURED) return res.json({ received: true, demo: true });

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, plan, charityId, charityPercent } = session.metadata;
    await supabaseAdmin.from('subscriptions').upsert({
      user_id: userId,
      plan,
      status: 'active',
      stripe_subscription_id: session.subscription,
      charity_id: charityId || null,
      charity_percentage: parseInt(charityPercent) || 10,
      current_period_end: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 3600 * 1000),
    }, { onConflict: 'user_id' });
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    await supabaseAdmin.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', sub.id);
  }

  res.json({ received: true });
});

// GET /api/subscriptions/status
router.get('/status', protect, async (req, res) => {
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('*, charities(name)')
    .eq('user_id', req.user.id)
    .single();
  res.json(sub);
});

// PATCH /api/subscriptions/cancel
router.patch('/cancel', protect, async (req, res) => {
  const { data: sub } = await supabaseAdmin.from('subscriptions').select('stripe_subscription_id').eq('user_id', req.user.id).single();
  if (sub?.stripe_subscription_id && STRIPE_CONFIGURED && !sub.stripe_subscription_id.startsWith('demo_')) {
    await stripe.subscriptions.cancel(sub.stripe_subscription_id);
  }
  await supabaseAdmin.from('subscriptions').update({ status: 'canceled' }).eq('user_id', req.user.id);
  res.json({ message: 'Subscription canceled' });
});

export default router;
