-- Fix function search_path warnings
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.generate_token_number() SET search_path = public;