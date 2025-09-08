import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/config';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';

// Content Library Component with SupabaseQuery
function ContentLibrary() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: queryData, error } = await supabase.rpc('exec_sql', {
        query: `
          select
            title,
            platform,
            coalesce(published_at, created_at) as published_at,
            engagement_rate,
            post_id
          from public.v_posts_with_latest
          where user_id = auth.uid()
          order by coalesce(published_at, now()) desc;
        `
      });
      
      if (!error) {
        setData(queryData || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading content...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Content Library</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Platform</th>
              <th className="text-left p-2">Published</th>
              <th className="text-left p-2">Engagement Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{item.title}</td>
                <td className="p-2">{item.platform}</td>
                <td className="p-2">{new Date(item.published_at).toLocaleDateString()}</td>
                <td className="p-2">{item.engagement_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function Content() {
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
        <ContentLibrary />
      </div>
    </div>
  );
}