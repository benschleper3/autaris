import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
export const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
export const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

/** Admin client (bypasses RLS) – use ONLY for server writes, always filter by user_id */
export const supaAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Get the authenticated user_id from the incoming request (Authorization header or cookies) */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  // Try Authorization header first
  const auth = req.headers.get('Authorization') ?? '';
  if (auth.startsWith('Bearer ')) {
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await userClient.auth.getUser();
    if (data.user?.id) return data.user.id;
  }
  
  // Try cookie-based session
  const cookieHeader = req.headers.get('Cookie') ?? '';
  if (cookieHeader) {
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Cookie: cookieHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await userClient.auth.getUser();
    return data.user?.id ?? null;
  }
  
  return null;
}
