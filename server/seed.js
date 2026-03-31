/**
 * Seed Script — Golf Charity Subscription Platform
 * Run: node seed.js (from /server directory, with .env configured)
 * 
 * Creates:
 *  - 3 charities (if not already seeded via schema.sql)
 *  - 1 admin user  (admin@golf.dev / Admin1234!)
 *  - 1 test subscriber  (testuser@golf.dev / Test1234!)
 *  - 5 scores for the test subscriber
 *  - 1 published draw with results
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('🌱 Starting seed...\n');

  // ── Charities ──────────────────────────────────────────────
  console.log('🏥 Seeding charities...');
  const { data: charities, error: charErr } = await supabase
    .from('charities')
    .upsert([
      { name: 'Global Clean Water Initiative', description: 'Providing safe drinking water to communities in Sub-Saharan Africa.', is_featured: true, is_active: true },
      { name: 'Youth Sports Foundation', description: 'Funding grassroots sports for young people across the UK.', is_featured: false, is_active: true },
      { name: 'Wildlife Conservation Trust', description: 'Protecting endangered species and natural habitats worldwide.', is_featured: false, is_active: true },
    ], { onConflict: 'name', ignoreDuplicates: true })
    .select();
  if (charErr) console.error('Charity error:', charErr.message);
  else console.log(`  ✓ ${charities?.length || 0} charity/charities seeded`);

  // Refetch charities to get IDs
  const { data: allCharities } = await supabase.from('charities').select('id, name').limit(3);
  const charity1 = allCharities?.[0];

  // ── Admin User ─────────────────────────────────────────────
  console.log('\n👑 Creating admin user (admin@golf.dev)...');
  const { data: adminAuth } = await supabase.auth.admin.createUser({
    email: 'admin@golf.dev',
    password: 'Admin1234!',
    email_confirm: true,
  }).catch(() => ({ data: null }));

  if (adminAuth?.user) {
    await supabase.from('users').upsert({
      id: adminAuth.user.id,
      email: 'admin@golf.dev',
      full_name: 'Admin User',
      role: 'admin',
    }, { onConflict: 'id' });
    console.log('  ✓ Admin created');
  } else {
    console.log('  ↩ Admin already exists or creation skipped');
  }

  // ── Test Subscriber ────────────────────────────────────────
  console.log('\n👤 Creating test subscriber (testuser@golf.dev)...');
  const { data: userAuth } = await supabase.auth.admin.createUser({
    email: 'testuser@golf.dev',
    password: 'Test1234!',
    email_confirm: true,
  }).catch(() => ({ data: null }));

  let userId = userAuth?.user?.id;

  if (!userId) {
    // User might already exist - look them up
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === 'testuser@golf.dev');
    userId = existing?.id;
    console.log('  ↩ Test user already exists');
  } else {
    console.log('  ✓ Test user created');
  }

  if (userId) {
    // Upsert public profile
    await supabase.from('users').upsert({
      id: userId,
      email: 'testuser@golf.dev',
      full_name: 'James Harrington',
      role: 'subscriber',
    }, { onConflict: 'id' });

    // Add subscription
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan: 'monthly',
      status: 'active',
      stripe_subscription_id: 'sub_test_demo_12345',
      current_period_end: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      charity_id: charity1?.id || null,
      charity_percentage: 15,
    }, { onConflict: 'user_id' });
    console.log('  ✓ Subscription added (monthly, active)');

    // Add 5 golf scores
    const scores = [
      { user_id: userId, score: 34, played_on: '2026-03-28' },
      { user_id: userId, score: 29, played_on: '2026-03-21' },
      { user_id: userId, score: 38, played_on: '2026-03-14' },
      { user_id: userId, score: 31, played_on: '2026-03-07' },
      { user_id: userId, score: 36, played_on: '2026-02-28' },
    ];
    // Delete any existing scores first
    await supabase.from('scores').delete().eq('user_id', userId);
    const { error: scErr } = await supabase.from('scores').insert(scores);
    if (scErr) console.error('Score error:', scErr.message);
    else console.log('  ✓ 5 Stableford scores added');
  }

  // ── Demo Published Draw ────────────────────────────────────
  console.log('\n🎲 Creating demo published draw (Feb 2026)...');
  const { data: draw } = await supabase.from('draws').upsert({
    month: 2,
    year: 2026,
    status: 'published',
    draw_type: 'random',
    drawn_numbers: [29, 31, 34, 36, 40],
    jackpot_rollover: false,
    total_pool: 1600,
  }, { onConflict: 'month, year' }).select().single();

  if (draw && userId) {
    // testuser matched 4 numbers (29, 31, 34, 36 ✓ — 40 not in scores)
    await supabase.from('draw_results').upsert({
      draw_id: draw.id,
      user_id: userId,
      match_type: 4,
      prize_amount: (1600 * 0.35).toFixed(2),
      payment_status: 'pending',
    }, { onConflict: 'draw_id, user_id' });
    console.log('  ✓ Draw published with testuser as 4-match winner');
  }

  console.log('\n✅ Seed complete!\n');
  console.log('Test credentials:');
  console.log('  Subscriber: testuser@golf.dev / Test1234!');
  console.log('  Admin:      admin@golf.dev / Admin1234!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
