-- Create the set_user_role function
CREATE OR REPLACE FUNCTION public.set_user_role(p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN 
    RAISE EXCEPTION 'Not authenticated'; 
  END IF;
  
  IF p_role NOT IN ('creator','ugc_creator') THEN 
    RAISE EXCEPTION 'Invalid role'; 
  END IF;
  
  INSERT INTO public.user_meta(user_id, role)
  VALUES (auth.uid(), p_role)
  ON CONFLICT (user_id) DO UPDATE SET role = excluded.role;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_user_role(text) TO anon, authenticated;