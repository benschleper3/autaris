import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function DebugSeedFull() {
  const [msg, setMsg] = useState<string>('');

  const seed = async () => {
    setMsg('Seeding…');

    const { data: authData, error: authErr } = await (supabase as any).auth.getUser();
    if (authErr) { setMsg('Auth error: ' + authErr.message); return; }
    const userId = authData?.user?.id;
    if (!userId) { setMsg('You must be logged in to seed.'); return; }

    try {
      // Upsert profile (works with SQL migration schema)
      const { error: pErr } = await (supabase as any)
        .from('profiles')
        .upsert({ user_id: userId, full_name: 'Ben Schleper', timezone: 'America/Chicago' });
      if (pErr) { setMsg('Profile error: ' + pErr.message); return; }

      // Insert two social accounts
      const { data: accs, error: aErr } = await (supabase as any)
        .from('social_accounts')
        .insert([
          { user_id: userId, platform: 'tiktok', handle: '@autaris', external_id: 'tk_123', status: 'active', last_synced_at: new Date().toISOString() },
          { user_id: userId, platform: 'instagram', handle: '@autaris', external_id: 'ig_456', status: 'active', last_synced_at: new Date().toISOString() }
        ])
        .select('id');
      if (aErr) { setMsg('Accounts error: ' + aErr.message); return; }

      const firstId = accs?.[0]?.id;
      if (!firstId) { setMsg('No social account id returned.'); return; }

      // Two posts
      const { error: pmErr } = await (supabase as any)
        .from('post_metrics')
        .insert([
          {
            user_id: userId,
            social_account_id: firstId,
            post_id: 'post_1',
            title: 'First Post',
            url: 'https://tiktok.com/@autaris/video/1',
            published_at: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
            views: 1200, likes: 140, comments: 22, shares: 15
          },
          {
            user_id: userId,
            social_account_id: firstId,
            post_id: 'post_2',
            title: 'Second Post',
            url: 'https://tiktok.com/@autaris/video/2',
            published_at: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
            views: 800, likes: 90, comments: 10, shares: 8
          }
        ]);
      if (pmErr) { setMsg('Post metrics error: ' + pmErr.message); return; }

      // Weekly insight (current week Monday)
      const monday = new Date(); monday.setHours(0,0,0,0);
      const day = monday.getDay(); const diff = (day === 0 ? 6 : day - 1);
      monday.setDate(monday.getDate() - diff);
      const { error: wiErr } = await (supabase as any)
        .from('weekly_insights')
        .upsert({
          user_id: userId,
          week_start: monday.toISOString().slice(0,10),
          narrative: 'Solid growth this week driven by strong hooks.',
          recommendations: 'Double down on high-retention hooks; test Tue/Thu 9–11am.',
          best_times: [{ day:'Tue', time:'09:00', platform:'tiktok' }, { day:'Thu', time:'11:00', platform:'instagram' }],
          top_posts: [{ post_id:'post_1', url:'https://tiktok.com/@autaris/video/1', score:0.92 }]
        });
      if (wiErr) { setMsg('Weekly insights error: ' + wiErr.message); return; }

      setMsg('Done! Go check the dashboard.');
    } catch (error: any) {
      setMsg('Error: ' + error.message);
    }
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Seed Full Demo Data</h1>
      <p className="text-sm text-muted-foreground">
        This seeds complete data after running the SQL migration. You must be logged in.
      </p>
      <Button onClick={seed}>Seed Full Data</Button>
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </main>
  );
}