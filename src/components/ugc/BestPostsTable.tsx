import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkles, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface PostData {
  post_id: string;
  title: string;
  platform: string;
  published_at: string;
  views: number;
  engagement_rate: number;
  url?: string;
}

export default function BestPostsTable() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBestPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('v_posts_with_latest')
          .select('post_id, title, platform, published_at, created_at, views, engagement_rate, url')
          .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .gte('views', 100)
          .order('engagement_rate', { ascending: false })
          .order('views', { ascending: false })
          .limit(15);

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching best posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestPosts();
  }, []);

  const handleAIExplain = async (postId: string) => {
    toast({
      title: "AI Analysis Coming Soon",
      description: "Post insights feature will be available soon",
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'tiktok': return 'bg-pink-500/10 text-pink-700 dark:text-pink-300';
      case 'instagram': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'youtube': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Best Performing Posts (30d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Best Performing Posts (30d)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No high-performing posts yet</p>
            <p className="text-sm text-muted-foreground">Posts with 100+ views will appear here</p>
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
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
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
                        onClick={() => handleAIExplain(post.post_id)}
                        className="text-primary hover:text-primary/80"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
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