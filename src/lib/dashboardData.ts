// Client-side data helpers (adapted from Next.js server actions)
import { supabase } from './supabaseClient';

export async function getTotals7d() {
  const since = new Date(Date.now() - 7*24*60*60*1000).toISOString();
  const { data, error } = await supabase
    .from('post_metrics')
    .select('views,likes,comments,shares,published_at')
    .gte('published_at', since);
  
  if (error) throw error;
  
  return (data||[]).reduce((a, r) => ({
    views: a.views + (r.views||0),
    likes: a.likes + (r.likes||0),
    comments: a.comments + (r.comments||0),
    shares: a.shares + (r.shares||0),
  }), { views:0, likes:0, comments:0, shares:0 });
}

export async function getTopPosts7d() {
  const since = new Date(Date.now() - 7*24*60*60*1000).toISOString();
  const { data, error } = await supabase
    .from('post_metrics')
    .select('title,url,published_at,views,likes,comments,shares,engagement_rate')
    .gte('published_at', since)
    .order('engagement_rate', { ascending: false })
    .limit(5);
  
  if (error) throw error;
  return data||[];
}

export async function getWeeklyInsight() {
  // compute this week's Monday in local time
  const d = new Date(); 
  d.setHours(0,0,0,0);
  const diffToMon = (d.getDay() === 0 ? 6 : d.getDay()-1);
  d.setDate(d.getDate() - diffToMon);
  const isoMonday = d.toISOString().slice(0,10);

  const { data, error } = await supabase
    .from('weekly_insights')
    .select('*')
    .eq('week_start', isoMonday)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}