export default function TikTokHelp() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-xl font-bold">TikTok OAuth Wiring</h1>
      <ul className="list-disc space-y-2 pl-6 text-sm">
        <li>
          Redirect URI in TikTok Dev Portal must be: 
          <code className="ml-2 rounded bg-muted px-2 py-0.5">
            https://www.autaris.company/functions/v1/tiktok-callback
          </code>
        </li>
        <li>
          Client key used in app: <code className="rounded bg-muted px-2 py-0.5">VITE_TIKTOK_CLIENT_KEY</code>
        </li>
        <li>
          Scopes: <code className="rounded bg-muted px-2 py-0.5">user.info.basic,user.info.stats</code>
        </li>
        <li>
          After consent, Supabase Edge Function should redirect to 
          <code className="ml-2 rounded bg-muted px-2 py-0.5">/dashboard?connected=tiktok</code>
        </li>
      </ul>

      <div className="mt-6 rounded-lg border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Environment Variables Required:</h2>
        <pre className="text-xs text-muted-foreground">
          VITE_SUPABASE_URL=your_supabase_url{'\n'}
          VITE_SUPABASE_ANON_KEY=your_anon_key{'\n'}
          VITE_TIKTOK_CLIENT_KEY=your_client_key{'\n'}
          VITE_TIKTOK_REDIRECT_URI=https://www.autaris.company/functions/v1/tiktok-callback{'\n'}
          VITE_TIKTOK_SCOPES=user.info.basic,user.info.stats
        </pre>
      </div>

      <div className="mt-6 rounded-lg border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Current Configuration:</h2>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>Client Key: {import.meta.env.VITE_TIKTOK_CLIENT_KEY || '❌ Not set'}</li>
          <li>Redirect URI: {import.meta.env.VITE_TIKTOK_REDIRECT_URI || '❌ Not set'}</li>
          <li>Scopes: {import.meta.env.VITE_TIKTOK_SCOPES || '❌ Not set'}</li>
        </ul>
      </div>
    </div>
  );
}
