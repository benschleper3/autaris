-- Drop the timestamp version of get_ugc_kpis to resolve function overloading
DROP FUNCTION IF EXISTS public.get_ugc_kpis(p_from timestamp without time zone, p_to timestamp without time zone, p_platform text);

-- Keep only the date version which will handle both date and timestamp inputs
-- The date version already exists and works with date inputs