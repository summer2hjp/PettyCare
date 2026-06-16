-- supabase/migrations/004_fix_rls_recursion.sql
-- Fix: Add SECURITY DEFINER to user_households() to break RLS recursion
-- The function queries household_members, but the RLS policy on household_members
-- calls user_households(), creating infinite recursion.
-- SECURITY DEFINER makes the function bypass RLS internally.

CREATE OR REPLACE FUNCTION public.user_households()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
$$;
