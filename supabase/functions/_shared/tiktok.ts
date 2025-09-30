const BASE = 'https://www.tiktok.com/v2';
const SANDBOX = (Deno.env.get('SANDBOX_TIKTOK') ?? 'true').toLowerCase() === 'true';

export function buildAuthUrl(state: string) {
  const qs = new URLSearchParams({
    client_key: Deno.env.get('TIKTOK_CLIENT_ID')!,
    scope: 'user.info.basic,user.info.stats',
    response_type: 'code',
    redirect_uri: Deno.env.get('TIKTOK_REDIRECT_URI')!,
    state,
  });
  return `${BASE}/auth/authorize/?${qs.toString()}`;
}

/** Real token exchange (unused while SANDBOX=true) */
export async function exchangeCode(code: string) {
  const res = await fetch(`${BASE}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: Deno.env.get('TIKTOK_CLIENT_ID')!,
      client_secret: Deno.env.get('TIKTOK_CLIENT_SECRET')!,
      grant_type: 'authorization_code',
      redirect_uri: Deno.env.get('TIKTOK_REDIRECT_URI')!,
      code,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json() as Promise<{ data: {
    open_id: string; access_token: string; refresh_token: string; expires_in: number;
  }}>;
}

export async function refreshToken(refresh_token: string) {
  const res = await fetch(`${BASE}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: Deno.env.get('TIKTOK_CLIENT_ID')!,
      client_secret: Deno.env.get('TIKTOK_CLIENT_SECRET')!,
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
  return res.json() as Promise<{ data: { access_token: string; refresh_token: string; expires_in: number; } }>;
}

/** SANDBOX helpers: deterministic pseudo data per user */
function seedFrom(str: string) { let h=0; for (const c of str) h = (h*31 + c.charCodeAt(0))|0; return Math.abs(h); }
function rnd(n: number, s: number) { s ^= s<<13; s ^= s>>>17; s ^= s<<5; return Math.abs(s) % n; }

export async function listVideosSandbox(userId: string, sinceISO: string) {
  const since = new Date(sinceISO).getTime();
  let s = seedFrom(userId);
  const now = Date.now();
  const out: Array<{ id:string; title?:string; desc?:string; url?:string; create_time:string }> = [];
  for (let i=0;i<24;i++) {
    s = rnd(100000+s, s);
    const t = now - (i * 36 * 60 * 60 * 1000) - (s % (12*60*60*1000));
    if (t < since) break;
    out.push({
      id: `${userId.slice(0,6)}_${t}`,
      title: `UGC Post #${i+1}`,
      desc: 'Sandbox creative',
      url: `https://www.tiktok.com/@creator/video/${userId.slice(0,6)}_${t}`,
      create_time: new Date(t).toISOString(),
    });
  }
  return out;
}

export async function statsSandbox(_videoId: string, s: number) {
  const views = 800 + (s % 25000);
  const likes = Math.floor(views * (0.03 + (s%7)/1000));
  const comments = Math.floor(views * (0.004 + (s%5)/2000));
  const shares = Math.floor(views * (0.002 + (s%3)/3000));
  const saves = Math.floor(views * (0.001 + (s%2)/4000));
  return { views, likes, comments, shares, saves };
}

export async function listVideos(accessToken: string, openId: string, sinceISO: string, userIdForSandbox?: string) {
  if (SANDBOX) return listVideosSandbox(userIdForSandbox!, sinceISO);
  // TODO: replace with real TikTok API call (list user videos)
  console.log('[TikTok] listVideos real API - implement after app approval');
  return [];
}

export async function getVideoStats(accessToken: string, videoId: string, userIdForSandbox?: string) {
  if (SANDBOX) return statsSandbox(videoId, seedFrom(userIdForSandbox! + videoId));
  // TODO: replace with real TikTok API call (per-video stats)
  console.log('[TikTok] getVideoStats real API - implement after app approval');
  return { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 };
}
