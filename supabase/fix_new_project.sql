-- Fix missing columns on the new Supabase project
-- Run this in the Supabase SQL Editor

-- Add missing columns to charities
ALTER TABLE public.charities ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.charities ADD COLUMN IF NOT EXISTS is_active   boolean NOT NULL DEFAULT true;
ALTER TABLE public.charities ADD COLUMN IF NOT EXISTS image_url   text;
ALTER TABLE public.charities ADD COLUMN IF NOT EXISTS description text;

-- Ensure charities RLS is correct
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "charities: public read" ON public.charities;
CREATE POLICY "charities: public read" ON public.charities FOR SELECT USING (true);
DROP POLICY IF EXISTS "charities: admin write" ON public.charities;
CREATE POLICY "charities: admin write" ON public.charities
  FOR ALL USING (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Seed the 3 charities
INSERT INTO public.charities (name, description, image_url, is_featured, is_active) VALUES
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
ON CONFLICT DO NOTHING;

-- Verify
SELECT id, name, is_featured, is_active FROM public.charities;
