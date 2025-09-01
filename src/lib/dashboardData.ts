// Client-side data helpers - simplified for existing schema
import { supabase } from '@/integrations/supabase/client';

// Simplified helpers that work with current database schema
export async function getTotals7d() {
  // Return mock data until SQL migration is run
  return { views: 0, likes: 0, comments: 0, shares: 0 };
}

export async function getTopPosts7d() {
  // Return empty array until SQL migration is run  
  return [];
}

export async function getWeeklyInsight() {
  // Return null until SQL migration is run
  return null;
}

// These will work after running the SQL migration:
export async function getTotals7dReal() {
  try {
    const since = new Date(Date.now() - 7*24*60*60*1000).toISOString();
    const { data, error } = await (supabase as any)
      .from('post_metrics')
      .select('views,likes,comments,shares,published_at')
      .gte('published_at', since);

    if (error) throw error;
    const base = { views: 0, likes: 0, comments: 0, shares: 0 };
    return (data ?? []).reduce((a: any, r: any) => ({
      views: a.views + (r.views || 0),
      likes: a.likes + (r.likes || 0),
      comments: a.comments + (r.comments || 0),
      shares: a.shares + (r.shares || 0),
    }), base);
  } catch (error) {
    return { views: 0, likes: 0, comments: 0, shares: 0 };
  }
}

export async function getTopPosts7dReal() {
  try {
    const since = new Date(Date.now() - 7*24*60*60*1000).toISOString();
    const { data, error } = await (supabase as any)
      .from('post_metrics')
      .select('title,url,published_at,views,likes,comments,shares,engagement_rate')
      .gte('published_at', since)
      .order('engagement_rate', { ascending: false })
      .limit(5);
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    return [];
  }
}

export async function getWeeklyInsightReal() {
  try {
    const d = new Date(); d.setHours(0,0,0,0);
    const diffToMon = (d.getDay() === 0 ? 6 : d.getDay()-1);
    d.setDate(d.getDate() - diffToMon);
    const mondayIso = d.toISOString().slice(0,10);

    const { data, error } = await (supabase as any)
      .from('weekly_insights')
      .select('*')
      .eq('week_start', mondayIso)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
}