import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function TestSupabase() {
  const [status, setStatus] = useState<'idle'|'ok'|'err'>('idle');
  const [message, setMessage] = useState<string>('Initializing…');

  useEffect(() => {
    (async () => {
      try {
        // Try a safe read against profiles; ok if empty
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw error;
        setStatus('ok');
        setMessage(`Connected. Rows visible: ${data?.length ?? 0}`);
      } catch (e:any) {
        setStatus('err');
        setMessage(e?.message ?? 'Unknown error');
      }
    })();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 rounded-lg border bg-card px-3 py-2 shadow-sm">
      <div className="text-sm font-medium text-card-foreground">Supabase Test</div>
      <div className={`text-xs ${
        status === 'ok' 
          ? 'text-green-600 dark:text-green-400' 
          : status === 'err' 
          ? 'text-destructive' 
          : 'text-muted-foreground'
      }`}>
        {message}
      </div>
    </div>
  );
}