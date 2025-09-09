import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkles, ExternalLink, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PostData {
  post_id: string;
  title: string;
  platform: string;
  published_at: string;
  views: number;
  engagement_rate: number;
}

export default function BestPostsTable() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestPosts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: postsData, error } = await supabase
          .from('v_posts_with_latest')
          .select('post_id, title, platform, published_at, created_at, views, engagement_rate')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .gte('views', 100)
          .order('engagement_rate', { ascending: false })
          .order('views', { ascending: false })
          .limit(15);

        if (error) throw error;
        
        const formattedPosts = (postsData || []).map(post => ({
          post_id: post.post_id,
          title: post.title,
          platform: post.platform,
          published_at: post.published_at || post.created_at,
          views: post.views || 0,
          engagement_rate: post.engagement_rate || 0
        }));
        
        setPosts(formattedPosts);
      } catch (error) {
        console.error('Error fetching best posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestPosts();
  }, []);

  const handleAIExplain = async (postId: string) => {
    setSelectedPost(postId);
    // TODO: Implement API call to /api/ai/post-insights
    console.log('AI Explain for post:', postId);
    // Mock delay
    setTimeout(() => setSelectedPost(null), 2000);
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'instagram': 'bg-pink-500',
      'tiktok': 'bg-black',
      'youtube': 'bg-red-500',
      'twitter': 'bg-blue-500',
      'linkedin': 'bg-blue-600'
    };
    return colors[platform.toLowerCase()] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-chart-4" />
          Best Posts (30d) - What's Working
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>ER%</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post, index) => (
                <TableRow key={post.post_id}>
                  <TableCell className="max-w-xs">
                    <div className="truncate font-medium">{post.title}</div>
                    <div className="text-xs text-muted-foreground">#{index + 1}</div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={`${getPlatformColor(post.platform)} text-white capitalize`}
                    >
                      {post.platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {post.views.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-chart-2">
                        {post.engagement_rate.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIExplain(post.post_id)}
                        disabled={selectedPost === post.post_id}
                        className="flex items-center gap-1"
                      >
                        <Lightbulb className="w-3 h-3" />
                        {selectedPost === post.post_id ? 'Analyzing...' : 'AI Explain'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}