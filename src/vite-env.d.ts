/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_TIKTOK_CLIENT_KEY: string;
  readonly VITE_TIKTOK_REDIRECT_URI: string;
  readonly VITE_TIKTOK_SCOPES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
