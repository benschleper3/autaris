'use client';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function DebugSeed() {
  const [msg, setMsg] = useState('');
  
  const seed = async () => {
    setMsg('Seeding…');
    const { data: user } = await supabase.auth.getUser();
    const user_id = user?.user?.id;
    if (!user_id) { 
      setMsg('You must be logged in.'); 
      return; 
    }

    try {
      // Only seed basic profile for now - other tables need SQL migration first
      await supabase.from('profiles').upsert({ 
        id: user_id, 
        full_name: 'Ben Schleper', 
        timezone: 'America/Chicago' 
      });

      setMsg('Basic seeding done! Run the SQL migration first, then try again for full seed data.');
    } catch (error: any) {
      setMsg('Error: ' + error.message);
    }
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Seed Demo Data</h1>
      <p className="text-sm text-muted-foreground">
        You must be logged in. Run the SQL migration first for full functionality.
      </p>
      <Button onClick={seed}>
        Seed
      </Button>
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </main>
  );
}