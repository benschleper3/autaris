-- Grant execute permission on set_user_role to authenticated users
GRANT EXECUTE ON FUNCTION public.set_user_role(text) TO authenticated;