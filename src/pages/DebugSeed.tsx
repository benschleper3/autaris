import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function DebugSeed() {
  const [msg, setMsg] = useState<string>('');

  const seed = async () => {
    setMsg('Seeding…');

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr) { setMsg('Auth error: ' + authErr.message); return; }
    const userId = authData?.user?.id;
    if (!userId) { setMsg('You must be logged in to seed.'); return; }

    try {
      // Upsert profile (use id as primary key for existing schema)
      const { error: pErr } = await supabase
        .from('profiles')
        .upsert({ id: userId, full_name: 'Ben Schleper', timezone: 'America/Chicago' });
      if (pErr) { setMsg('Profile error: ' + pErr.message); return; }

      setMsg('Basic profile seeded! Run SQL migration first, then full seed will work.');
    } catch (error: any) {
      setMsg('Error: ' + error.message);
    }
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Seed Demo Data</h1>
      <p className="text-sm text-muted-foreground">You must be logged in.</p>
      <Button onClick={seed}>Seed</Button>
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </main>
  );
}