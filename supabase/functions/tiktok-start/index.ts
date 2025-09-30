import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { buildAuthUrl } from '../_shared/tiktok.ts';

serve(async (_req) => {
  try {
    const state = crypto.randomUUID();
    const url = buildAuthUrl(state);
    
    console.log('[tiktok-start] Redirecting to TikTok auth with state:', state);
    
    // State storage omitted in sandbox; production uses a KV/session
    return new Response(null, { 
      status: 302, 
      headers: { Location: url }
    });
  } catch (error) {
    console.error('[tiktok-start] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
