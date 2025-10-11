import { SUPABASE_URL } from '@/integrations/supabase/config';

/**
 * Navigate to TikTok OAuth start endpoint
 * Must be top-level navigation (no fetch, no iframe)
 */
export function connectTikTok() {
  const startUrl = `${SUPABASE_URL}/functions/v1/tiktok-start`;
  window.location.href = startUrl;
}
