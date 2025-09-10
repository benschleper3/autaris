import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Sparkles } from 'lucide-react';

interface Filters {
  from: Date | null;
  to: Date | null;
  platform: string | null;
}

interface PostData {
  post_id: string;
  title: string;
  platform: string;
  published_at: string;
  views: number;
  engagement_rate: number;
  url?: string;
}

interface Props {
  filters: Filters;
}

export default function UGCTopPosts({ filters }: Props) {
  const [data, setData] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPosts = async () => {
      setLoading(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        let query = supabase
          .from('v_posts_with_latest')
          .select('post_id, title, platform, published_at, created_at, views, engagement_rate, url')
          .eq('user_id', user.user.id);

        if (filters.platform) {
          query = query.eq('platform', filters.platform as any);
        }

        if (filters.from && filters.to) {
          query = query
            .gte('published_at', filters.from.toISOString())
            .lte('published_at', filters.to.toISOString());
        }

        const { data: postsData, error } = await query
          .order('engagement_rate', { ascending: false })
          .order('views', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching top posts:', error);
          setData([]);
        } else {
          const formatted = (postsData || []).map(post => ({
            ...post,
            published_at: post.published_at || post.created_at
          }));
          setData(formatted);
        }
      } catch (error) {
        console.error('Error:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPosts();
  }, [filters]);

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'tiktok': return 'bg-pink-500/10 text-pink-700 dark:text-pink-300';
      case 'instagram': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'youtube': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  const handleExplainPost = async (postId: string) => {
    // This would call an AI API to explain why the post performed well
    console.log('Explaining post:', postId);
    // TODO: Implement AI insights API call
  };

  if (loading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  return (
    <Card id="table-top-posts" className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Performing Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No posts yet</p>
            <p className="text-sm text-muted-foreground">Connect your social accounts to see performance data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">ER%</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((post) => (
                  <TableRow key={post.post_id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {post.title || 'Untitled Post'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getPlatformColor(post.platform)}>
                        {post.platform || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {post.published_at 
                        ? new Date(post.published_at).toLocaleDateString()
                        : 'Draft'
                      }
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {post.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {post.engagement_rate.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExplainPost(post.post_id)}
                        className="text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Explain
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}