const SANDBOX = (Deno.env.get('SANDBOX_TIKTOK') ?? 'true').toLowerCase() === 'true';

// Always use v2 auth endpoint (sandbox mode affects behavior, not URL)
const AUTH_BASE = 'https://www.tiktok.com/v2/auth/authorize/';

const TOKEN_BASE = SANDBOX
  ? 'https://open-sandbox.tiktok.com/oauth/access_token/'
  : 'https://open.tiktokapis.com/v2/oauth/token/';

const USER_INFO_BASE = SANDBOX
  ? 'https://open-sandbox.tiktok.com/api/user/info/'
  : 'https://open.tiktokapis.com/v2/user/info/';

const USER_STATS_BASE = SANDBOX
  ? 'https://open-sandbox.tiktok.com/api/user/stats/'
  : 'https://open.tiktokapis.com/v2/user/stats/';

export function buildAuthUrl(state: string) {
  // Prefer TIKTOK_CLIENT_KEY, fallback to TIKTOK_CLIENT_ID for backward compatibility
  const CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY') || Deno.env.get('TIKTOK_CLIENT_ID') || '';
  const scopes = Deno.env.get('TIKTOK_SCOPES') || 'user.info.basic,user.info.stats';
  const qs = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope: scopes,
    response_type: 'code',
    redirect_uri: Deno.env.get('TIKTOK_REDIRECT_URI')!,
    state,
  });
  console.log('[TikTok] buildAuthUrl: using client_key parameter');
  return `${AUTH_BASE}?${qs.toString()}`;
}

export function getSandboxMode() {
  return SANDBOX;
}

/** Token exchange (production or sandbox) */
export async function exchangeCode(code: string) {
  // Prefer TIKTOK_CLIENT_KEY, fallback to TIKTOK_CLIENT_ID for backward compatibility
  const CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY') || Deno.env.get('TIKTOK_CLIENT_ID') || '';
  const CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET') || '';
  
  console.log(`[TikTok] Exchanging code for tokens (sandbox=${SANDBOX}, using client_key)`);
  
  const res = await fetch(TOKEN_BASE, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: Deno.env.get('TIKTOK_REDIRECT_URI')!,
      code,
    }),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('[TikTok] Token exchange failed:', res.status, errorText);
    throw new Error(`Token exchange failed: ${res.status} - ${errorText}`);
  }
  
  return res.json() as Promise<{ data: {
    open_id: string; access_token: string; refresh_token: string; expires_in: number;
  }}>;
}

export async function refreshToken(refresh_token: string) {
  // Prefer TIKTOK_CLIENT_KEY, fallback to TIKTOK_CLIENT_ID for backward compatibility
  const CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY') || Deno.env.get('TIKTOK_CLIENT_ID') || '';
  const CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET') || '';
  
  const res = await fetch(TOKEN_BASE, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
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

/** Sandbox helper: deterministic user info */
export async function getUserInfoSandbox(userId: string) {
  const s = seedFrom(userId);
  const names = ['Sarah Chen', 'Mike Johnson', 'Alex Rivera', 'Jordan Taylor', 'Casey Morgan'];
  const displayName = names[s % names.length];
  
  return {
    display_name: displayName,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
  };
}

/** Sandbox helper: deterministic user stats */
export async function getUserStatsSandbox(userId: string) {
  const s = seedFrom(userId);
  return {
    follower_count: 1200 + (s % 8800), // 1200-10000
    following_count: 300 + (s % 700), // 300-1000
    likes_count: 30000 + (s % 70000), // 30k-100k
    video_count: 58 + (s % 142), // 58-200
  };
}

export async function getUserInfo(accessToken: string, openId: string, userIdForSandbox?: string) {
  console.log(`[TikTok] Fetching user info (sandbox=${SANDBOX})`);
  
  const res = await fetch(`${USER_INFO_BASE}?fields=display_name,avatar_url`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('[TikTok] getUserInfo failed:', res.status, errorText);
    throw new Error(`getUserInfo failed: ${res.status} - ${errorText}`);
  }
  
  const json = await res.json() as { data: { user: { display_name: string; avatar_url: string } } };
  return json.data.user;
}

export async function getUserStats(accessToken: string, openId: string, userIdForSandbox?: string) {
  console.log(`[TikTok] Fetching user stats (sandbox=${SANDBOX})`);
  
  const res = await fetch(`${USER_STATS_BASE}?fields=follower_count,following_count,likes_count,video_count`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('[TikTok] getUserStats failed:', res.status, errorText);
    throw new Error(`getUserStats failed: ${res.status} - ${errorText}`);
  }
  
  const json = await res.json() as { data: { user: { follower_count: number; following_count: number; likes_count: number; video_count: number } } };
  return json.data.user;
}
