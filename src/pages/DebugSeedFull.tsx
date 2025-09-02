import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

async function seedWeeklyInsightsPerPlatform(userId: string) {
  // compute this week's Monday (yyyy-mm-dd)
  const mondayISO = (() => {
    const d = new Date(); 
    d.setHours(0,0,0,0);
    const diff = (d.getDay() === 0 ? 6 : d.getDay() - 1);
    d.setDate(d.getDate() - diff);
    return d.toISOString().slice(0,10);
  })();

  // simple demo narratives & recs per platform (customize anytime)
  const insights = [
    {
      user_id: userId, week_start: mondayISO, platform: 'instagram' as const,
      narrative: 'IG engagement is steady; Reels drive most interactions.',
      recommendations: '- Post 1–2 Reels during peak hours (Tue/Thu 6–8pm)\n- Use 3–5 niche hashtags\n- Reuse best hook from last week'
    },
    {
      user_id: userId, week_start: mondayISO, platform: 'youtube' as const,
      narrative: 'YT watch time rose; shorts boost discovery.',
      recommendations: '- Publish 2 Shorts + 1 Longform\n- Front-load value in first 15 seconds\n- Add end screens to push binge'
    },
    {
      user_id: userId, week_start: mondayISO, platform: 'twitter' as const,
      narrative: 'X impressions grew with threads.',
      recommendations: '- Ship 1 thread (5–7 tweets)\n- Quote-tweet your best post\n- Ask 1 question to drive replies'
    },
    {
      user_id: userId, week_start: mondayISO, platform: 'linkedin' as const,
      narrative: 'LI saves & comments are up.',
      recommendations: '- Post 1 carousel with a how-to\n- Add a CTA question\n- Reply to all comments within 2h'
    },
    {
      user_id: userId, week_start: mondayISO, platform: 'facebook' as const,
      narrative: 'FB shares correlate with link posts at lunch.',
      recommendations: '- Publish 1 link post between 12–1pm\n- Reuse top image + headline variant\n- Ask for shares explicitly'
    },
    {
      user_id: userId, week_start: mondayISO, platform: 'tiktok' as const,
      narrative: 'TT velocity good; hooks matter most.',
      recommendations: '- Test 2 hook variants on same idea\n- Keep cuts <2s for first 10s\n- Leverage trending sound quietly'
    }
  ];

  // idempotent upsert — requires unique(user_id,week_start,platform)
  const { error } = await supabase
    .from('weekly_insights')
    .upsert(insights, { onConflict: 'user_id,week_start,platform' });
  if (error) throw error;
}

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

      // Seed per-platform weekly insights
      await seedWeeklyInsightsPerPlatform(userId);

      setMsg('Done! Go check the dashboard with per-platform insights.');
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