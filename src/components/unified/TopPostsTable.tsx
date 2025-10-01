import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, ExternalLink, FolderPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TopPostsTableProps {
  filters: {
    from: Date | null;
    to: Date | null;
    platform: string;
  };
}

interface PostData {
  post_id: string;
  title: string;
  platform: string;
  published_at: string;
  created_at: string;
  views: number;
  engagement_rate: number;
  url?: string;
}

interface PostInsight {
  angle: string;
  what_to_replicate: string;
  next_test: string;
}

export default function TopPostsTable({ filters }: TopPostsTableProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [insights, setInsights] = useState<PostInsight | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTopPosts();
  }, [filters]);

  const fetchTopPosts = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('v_posts_with_latest')
        .select('post_id, title, platform, published_at, created_at, views, engagement_rate, url')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      // Apply filters
      if (filters.platform !== 'all') {
        query = query.eq('platform', filters.platform as any);
      }

      if (filters.from || filters.to) {
        if (filters.from && filters.to) {
          query = query.gte('created_at', filters.from.toISOString())
                       .lte('created_at', filters.to.toISOString());
        } else if (filters.from) {
          query = query.gte('created_at', filters.from.toISOString());
        } else if (filters.to) {
          query = query.lte('created_at', filters.to.toISOString());
        }
      }

      const { data, error } = await query
        .order('engagement_rate', { ascending: false })
        .order('views', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching top posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPortfolio = async (post: PostData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert directly into portfolio_items table
      const { error } = await supabase
        .from('portfolio_items')
        .insert({
          user_id: user.id,
          post_id: post.post_id,
          title: post.title || 'Untitled',
          description: `${post.platform} post with ${post.views?.toLocaleString() || 0} views and ${post.engagement_rate?.toFixed(2) || 0}% engagement rate`,
          image_url: null,
          featured: false
        });

      if (error) {
        // Check if it's a duplicate key error
        if (error.message.includes('duplicate') || error.code === '23505') {
          toast({
            title: "Already in Portfolio",
            description: "This post is already in your portfolio.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Added to Portfolio",
        description: "Post has been added to your portfolio successfully."
      });
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      toast({
        title: "Addition Failed",
        description: "Could not add post to portfolio. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAIExplain = async (post: PostData) => {
    try {
      setSelectedPost(post);
      setInsightsLoading(true);
      setDrawerOpen(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('https://your-n8n-domain.com/webhook/post-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: post.post_id,
          user_id: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to get insights');
      
      const data = await response.json();

      setInsights({
        angle: data.angle || 'No specific angle identified',
        what_to_replicate: data.what_to_replicate || 'No specific elements identified',
        next_test: data.next_test || 'No specific tests suggested'
      });

      toast({
        title: "AI Analysis Complete",
        description: "Post insights have been generated successfully."
      });
    } catch (error) {
      console.error('Error getting AI insights:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not generate insights for this post.",
        variant: "destructive"
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      tiktok: 'bg-pink-500',
      instagram: 'bg-purple-500',
      youtube: 'bg-red-500',
      twitter: 'bg-blue-500'
    };
    return colors[platform.toLowerCase() as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card id="table-top-posts">
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No posts found for the selected filters
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card id="table-top-posts">
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>ER%</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.post_id} className="hover:bg-muted/50">
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {post.title || 'Untitled'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPlatformColor(post.platform)} text-white`}>
                      {post.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(post.published_at || post.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{post.views?.toLocaleString() || '0'}</TableCell>
                  <TableCell>{post.engagement_rate?.toFixed(2) || '0.00'}%</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAIExplain(post)}
                        className="flex items-center gap-1"
                      >
                        <Brain className="w-3 h-3" />
                        AI Explain
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToPortfolio(post)}
                        className="flex items-center gap-1"
                      >
                        <FolderPlus className="w-3 h-3" />
                        Add to Portfolio
                      </Button>
                      {post.url && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={post.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              AI Insights: {selectedPost?.title || 'Post Analysis'}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-6 space-y-6">
            {insightsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : insights ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Angle</h3>
                  <p className="text-muted-foreground">{insights.angle}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">What to Replicate</h3>
                  <p className="text-muted-foreground">{insights.what_to_replicate}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Next Test</h3>
                  <p className="text-muted-foreground">{insights.next_test}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Click "AI Explain" to generate insights for this post
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}