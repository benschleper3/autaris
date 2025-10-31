import { supabase } from '@/integrations/supabase/client';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

async function callFunction(name: string, body?: any, method: 'GET' | 'POST' = 'POST') {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${FUNCTIONS_URL}/${name}`, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  profile: {
    me: () => callFunction('profile-me', undefined, 'GET'),
    update: (data: any) => callFunction('profile-update', data),
    social: () => callFunction('profile-social', undefined, 'GET'),
  },

  analytics: {
    kpis: (params: { from?: string; to?: string; platforms?: string[] }) =>
      callFunction('analytics-kpis', params),
    trend: (params: { from?: string; to?: string; platforms?: string[] }) =>
      callFunction('analytics-trend', params),
    platformBreakdown: (params: { from?: string; to?: string }) =>
      callFunction('analytics-platform-breakdown', params),
    heatmap: (params: { from?: string; to?: string; platform?: string }) =>
      callFunction('analytics-heatmap', params),
    topPosts: (params: {
      from?: string;
      to?: string;
      platforms?: string[];
      sort?: string;
      dir?: string;
      page?: number;
      pageSize?: number;
    }) => callFunction('analytics-top-posts', params),
  },

  videos: {
    tiktok: (params: { from?: string; to?: string; page?: number; pageSize?: number }) =>
      callFunction('videos-tiktok', params),
  },

  tiktok: {
    start: () => callFunction('tiktok-start', {}),
    disconnect: () => callFunction('tiktok-disconnect', {}),
    sync: () => callFunction('tiktok-sync', {}),
  },

  portfolio: {
    add: (data: { post_id?: string; title: string; image_url: string; description?: string; featured?: boolean }) =>
      callFunction('portfolio-add', data),
  },

  waitlist: {
    insert: (data: { email: string; referral_source?: string; notes?: string }) =>
      callFunction('waitlist-insert', data),
  },

  foundation: {
    get: () => callFunction('foundation-get', undefined, 'GET'),
  },
};
