-- ==============================================================================
-- seed_admin.sql
-- Helper snippet to promote a signed-up user to 'admin'
-- ==============================================================================

-- Option A: If you created your admin user via Supabase Auth (e.g. admin@civicconnect.org)
-- Run this query in Supabase SQL Editor to make them the seeded administrator:
UPDATE public.profiles
SET role = 'admin', full_name = 'City Administrator'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'admin@civicconnect.org'
);

-- Option B: Verify that your user is now an admin:
SELECT id, full_name, role, created_at FROM public.profiles WHERE role = 'admin';
