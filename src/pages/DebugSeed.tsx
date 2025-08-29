'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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

    await supabase.from('profiles').upsert({ 
      id: user_id, 
      full_name: 'Ben Schleper', 
      timezone: 'America/Chicago' 
    });

    const { data: accs } = await supabase
      .from('social_accounts')
      .insert([
        { user_id, platform: 'tiktok', handle: '@autaris', external_id: 'tk_123', status: 'active', last_synced_at: new Date().toISOString() },
        { user_id, platform: 'instagram', handle: '@autaris', external_id: 'ig_456', status: 'active', last_synced_at: new Date().toISOString() }
      ])
      .select('id');

    const firstId = accs?.[0]?.id;
    if (firstId) {
      await supabase.from('post_metrics').insert([
        { user_id, social_account_id: firstId, post_id: 'post_1', title: 'First Post', url: 'https://tiktok.com/@autaris/video/1', published_at: new Date(Date.now()-3*864e5).toISOString(), views: 1200, likes: 140, comments: 22, shares: 15 },
        { user_id, social_account_id: firstId, post_id: 'post_2', title: 'Second Post', url: 'https://tiktok.com/@autaris/video/2', published_at: new Date(Date.now()-1*864e5).toISOString(), views: 800, likes: 90, comments: 10, shares: 8 }
      ]);
    }

    const monday = new Date();
    monday.setHours(0,0,0,0);
    const day = monday.getDay(); // 0=Sun
    const diffToMon = (day === 0 ? 6 : day - 1);
    monday.setDate(monday.getDate() - diffToMon);

    await supabase.from('weekly_insights').upsert({
      user_id,
      week_start: monday.toISOString().slice(0,10),
      narrative: 'Solid growth this week driven by short-form hooks.',
      recommendations: 'Double down on high-retention hooks; test earlier post times on Tue/Thu.',
      best_times: [{ day: 'Tue', time: '09:00', platform: 'tiktok' }, { day: 'Thu', time: '11:00', platform: 'instagram' }],
      top_posts: [{ post_id: 'post_1', url: 'https://tiktok.com/@autaris/video/1', score: 0.92 }]
    });

    setMsg('Done. Go check the dashboard!');
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Seed Demo Data</h1>
      <button onClick={seed} className="px-4 py-2 rounded bg-black text-white">
        Seed
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}