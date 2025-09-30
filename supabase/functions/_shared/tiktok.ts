const BASE = 'https://www.tiktok.com/v2';

export function buildAuthUrl(state: string): string {
  const appBaseUrl = Deno.env.get('APP_BASE_URL')!;
  const qs = new URLSearchParams({
    client_key: Deno.env.get('TIKTOK_CLIENT_ID')!,
    scope: 'user.info.basic,user.info.stats',
    response_type: 'code',
    redirect_uri: `${appBaseUrl}/api/tiktok/callback`,
    state,
  });
  return `${BASE}/auth/authorize/?${qs.toString()}`;
}

export async function exchangeCode(code: string) {
  const appBaseUrl = Deno.env.get('APP_BASE_URL')!;
  const res = await fetch(`${BASE}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: Deno.env.get('TIKTOK_CLIENT_ID')!,
      client_secret: Deno.env.get('TIKTOK_CLIENT_SECRET')!,
      grant_type: 'authorization_code',
      redirect_uri: `${appBaseUrl}/api/tiktok/callback`,
      code,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json() as Promise<{ data: {
    open_id: string; 
    access_token: string; 
    refresh_token: string; 
    expires_in: number;
  }}>;
}

export async function refreshToken(refresh_token: string) {
  const res = await fetch(`${BASE}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: Deno.env.get('TIKTOK_CLIENT_ID')!,
      client_secret: Deno.env.get('TIKTOK_CLIENT_SECRET')!,
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
  return res.json() as Promise<{ data: {
    access_token: string; 
    refresh_token: string; 
    expires_in: number;
  }}>;
}

/** Placeholder - fill with real endpoints after TikTok app approval */
export async function listVideos(
  _accessToken: string, 
  _openId: string, 
  _sinceISO: string
): Promise<Array<{
  id: string;
  title?: string;
  desc?: string;
  url?: string;
  create_time: string;
}>> {
  // TODO: Implement real TikTok API call
  console.log('[TikTok] listVideos placeholder - implement after app approval');
  return [];
}

export async function getVideoStats(
  _accessToken: string, 
  _videoId: string
): Promise<{
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}> {
  // TODO: Implement real TikTok API call
  console.log('[TikTok] getVideoStats placeholder - implement after app approval');
  return { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 };
}
