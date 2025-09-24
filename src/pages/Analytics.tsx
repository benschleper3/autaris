import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';

// Analytics Overview Component with SupabaseQuery
function AnalyticsOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Use existing tables to calculate similar metrics
      const { data: postsData, error } = await supabase
        .from('v_posts_with_latest')
        .select('*')
        .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (!error && postsData) {
        const posts = postsData.length;
        const totalViews = postsData.reduce((sum, post) => sum + (post.views || 0), 0);
        const avgEngagement = postsData.length > 0 
          ? postsData.reduce((sum, post) => sum + (post.engagement_rate || 0), 0) / postsData.length
          : 0;
          
        setData({
          posts_published_30d: posts,
          total_views_30d: totalViews,
          avg_er_30d: avgEngagement
        });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {data?.posts_published_30d || 0}
          </div>
          <div className="text-sm text-muted-foreground">Posts Published (30d)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {data?.total_views_30d?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-muted-foreground">Total Views (30d)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {data?.avg_er_30d || 0}%
          </div>
          <div className="text-sm text-muted-foreground">Average Engagement Rate (30d)</div>
        </div>
      </div>
    </Card>
  );
}

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      
      setUser(session.user);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      setProfile(profileData);
      setLoading(false);
    };

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || profile?.role !== 'ugc') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navigation />
      <div className="p-6">
        <AnalyticsOverview />
      </div>
    </div>
  );
}