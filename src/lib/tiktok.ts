import { supabase } from '@/integrations/supabase/client';

type SessionUser = { id: string | null };

export function buildTikTokAuthUrl(userId?: string | null) {
  const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
  const redirectUri = import.meta.env.VITE_TIKTOK_REDIRECT_URI;
  const scopes = import.meta.env.VITE_TIKTOK_SCOPES || 'user.info.basic,user.info.stats';

  // We pass state as a JSON string containing userId + a nonce
  const state = btoa(
    JSON.stringify({
      userId: userId ?? null,
      ts: Date.now(),
      nonce: crypto.getRandomValues(new Uint32Array(1))[0].toString(16),
    })
  );

  const q = new URLSearchParams({
    client_key: clientKey,
    scope: scopes,
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  });

  return `https://www.tiktok.com/v2/auth/authorize/?${q.toString()}`;
}

export async function getCurrentUser(): Promise<SessionUser> {
  const { data } = await supabase.auth.getUser();
  return { id: data.user?.id ?? null };
}

/**
 * Checks if the current user has a saved TikTok connection in Supabase.
 * Requires RLS policy: user can SELECT where user_id = auth.uid().
 */
export async function isTikTokConnected(): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return false;

  const { data, error } = await supabase
    .from('social_accounts')
    .select('id')
    .eq('platform', 'tiktok')
    .eq('user_id', uid)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('isTikTokConnected error:', error);
    return false;
  }
  return Boolean(data?.id);
}

/**
 * Legacy function for backward compatibility
 */
export async function connectTikTok() {
  const { id } = await getCurrentUser();
  const url = buildTikTokAuthUrl(id);
  window.location.href = url;
}
