/**
 * Navigate to TikTok OAuth start endpoint
 * Must be top-level navigation (no fetch, no iframe)
 */
export function connectTikTok(startUrl = '/functions/v1/tiktok-start') {
  window.location.href = startUrl;
}
