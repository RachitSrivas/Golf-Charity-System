import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

// Export null-safe stripe — subscription.routes.js handles the missing key gracefully
const key = process.env.STRIPE_SECRET_KEY;
const stripe = (key && !key.includes('placeholder') && !key.includes('sk_test_placeholder'))
  ? new Stripe(key)
  : null;

export default stripe;
