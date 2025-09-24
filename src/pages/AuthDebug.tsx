import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function AuthDebug() {
  const [state, setState] = useState<any>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let profile = null;
      if (user) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        profile = data ?? null;
      }
      setState({ user, profile });
    })();
  }, []);

  return (
    <pre className="text-xs p-4 bg-muted rounded-md overflow-auto">
      {JSON.stringify(state, null, 2)}
    </pre>
  );
}