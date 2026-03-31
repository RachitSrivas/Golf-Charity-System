-- ============================================================
-- Golf Charity Subscription Platform — Full Supabase Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Users (mirrors Supabase Auth) ────────────────────────────
create table if not exists public.users (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null,
  full_name   text,
  role        text not null default 'subscriber'
                check (role in ('subscriber', 'admin')),
  created_at  timestamptz not null default now()
);

-- Auto-create row in public.users on Supabase Auth sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Charities ─────────────────────────────────────────────────
create table if not exists public.charities (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  description text,
  image_url   text,
  is_featured boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Charity Events ────────────────────────────────────────────
create table if not exists public.charity_events (
  id          uuid default uuid_generate_v4() primary key,
  charity_id  uuid references public.charities on delete cascade not null,
  title       text not null,
  description text,
  event_date  date,
  created_at  timestamptz not null default now()
);

-- ── Subscriptions ─────────────────────────────────────────────
create table if not exists public.subscriptions (
  id                     uuid default uuid_generate_v4() primary key,
  user_id                uuid references public.users on delete cascade not null unique,
  plan                   text check (plan in ('monthly', 'yearly')),
  status                 text not null default 'inactive'
                           check (status in ('active', 'inactive', 'past_due', 'canceled')),
  stripe_subscription_id text,
  current_period_end     timestamptz,
  charity_id             uuid references public.charities on delete set null,
  charity_percentage     integer not null default 10
                           check (charity_percentage >= 10 and charity_percentage <= 100),
  created_at             timestamptz not null default now()
);

-- ── Scores ────────────────────────────────────────────────────
create table if not exists public.scores (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.users on delete cascade not null,
  score      integer not null check (score >= 1 and score <= 45),
  played_on  date not null,
  created_at timestamptz not null default now()
);

-- Index for quick lookup of user's latest 5
create index if not exists idx_scores_user_date on public.scores (user_id, played_on desc);

-- ── Draws ─────────────────────────────────────────────────────
create table if not exists public.draws (
  id               uuid default uuid_generate_v4() primary key,
  month            integer not null check (month >= 1 and month <= 12),
  year             integer not null,
  status           text not null default 'draft'
                     check (status in ('draft', 'simulated', 'published')),
  draw_type        text not null default 'random'
                     check (draw_type in ('random', 'algorithmic')),
  drawn_numbers    integer[] not null default '{}',
  jackpot_rollover boolean not null default false,
  total_pool       numeric(12, 2) not null default 0,
  created_at       timestamptz not null default now(),
  unique (month, year)
);

-- ── Draw Results (Winners) ────────────────────────────────────
create table if not exists public.draw_results (
  id             uuid default uuid_generate_v4() primary key,
  draw_id        uuid references public.draws on delete cascade not null,
  user_id        uuid references public.users on delete cascade not null,
  match_type     integer not null check (match_type in (3, 4, 5)),
  prize_amount   numeric(12, 2) not null default 0,
  payment_status text not null default 'pending'
                   check (payment_status in ('pending', 'paid')),
  created_at     timestamptz not null default now(),
  unique (draw_id, user_id)
);

-- ── Winner Verification ───────────────────────────────────────
create table if not exists public.winner_verifications (
  id             uuid default uuid_generate_v4() primary key,
  draw_result_id uuid references public.draw_results on delete cascade not null,
  user_id        uuid references public.users on delete cascade not null,
  proof_url      text not null,
  status         text not null default 'pending'
                   check (status in ('pending', 'approved', 'rejected')),
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now()
);

-- ── Independent Donations ─────────────────────────────────────
create table if not exists public.independent_donations (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.users on delete cascade not null,
  charity_id uuid references public.charities on delete set null,
  amount     numeric(12, 2) not null check (amount > 0),
  donated_at timestamptz not null default now()
);

-- ── Row Level Security Policies ───────────────────────────────

-- Users: users can see and edit their own row
alter table public.users enable row level security;
create policy "users: own row" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "users: admin all" on public.users
  for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Subscriptions: own row only
alter table public.subscriptions enable row level security;
create policy "subscriptions: own" on public.subscriptions
  for all using (auth.uid() = user_id);
create policy "subscriptions: admin" on public.subscriptions
  for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Scores: own only
alter table public.scores enable row level security;
create policy "scores: own" on public.scores
  for all using (auth.uid() = user_id);
create policy "scores: admin" on public.scores
  for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Charities: public read, admin write
alter table public.charities enable row level security;
create policy "charities: public read" on public.charities for select using (true);
create policy "charities: admin write" on public.charities
  for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Draws: published = public read, admin all
alter table public.draws enable row level security;
create policy "draws: public read" on public.draws for select using (status = 'published');
create policy "draws: admin all" on public.draws
  for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Draw Results: own only
alter table public.draw_results enable row level security;
create policy "draw_results: own" on public.draw_results for select using (auth.uid() = user_id);
create policy "draw_results: admin" on public.draw_results
  for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Winner Verifications: own + admin
alter table public.winner_verifications enable row level security;
create policy "verifications: own" on public.winner_verifications for all using (auth.uid() = user_id);
create policy "verifications: admin" on public.winner_verifications
  for all using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- ── Seed Data ─────────────────────────────────────────────────
insert into public.charities (name, description, image_url, is_featured, is_active) values
  ('Global Clean Water Initiative',
   'Providing safe, clean drinking water to communities in Sub-Saharan Africa through sustainable borehole and filtration projects.',
   'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600',
   true, true),
  ('Youth Sports Foundation',
   'Funding grassroots sports programmes for young people aged 8-18 in underserved communities across the UK.',
   'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600',
   false, true),
  ('Wildlife Conservation Trust',
   'Protecting endangered species and natural habitats through research, advocacy, and community conservation projects worldwide.',
   'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600',
   false, true)
on conflict do nothing;
