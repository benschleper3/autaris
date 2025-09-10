import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Filter, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PostData {
  post_id: string;
  title: string;
  platform: string;
  published_at: string;
  views: number;
  engagement_rate: number;
}

export default function Content() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, platform, fromDate, toDate]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('v_posts_with_latest')
        .select('post_id, title, platform, published_at, created_at, views, engagement_rate')
        .eq('user_id', user.id)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (platform !== 'all') {
        // Cast to the specific platform type expected by Supabase
        query = query.eq('platform', platform as any);
      }

      if (fromDate && toDate) {
        query = query.gte('published_at', fromDate).lte('published_at', toDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPosts(data?.map(post => ({
        ...post,
        published_at: post.published_at || post.created_at
      })) || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const addToPortfolio = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .insert({
          user_id: user.id,
          post_id: postId,
          title: 'Untitled'
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }
      
      // Show success message or update UI
    } catch (error) {
      console.error('Error adding to portfolio:', error);
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Content Library
          </h1>
          <p className="text-muted-foreground mt-1">All your posts in one place</p>
        </div>

        {/* Filters */}
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All platforms</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">From Date</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Table */}
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              All Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No content found</p>
                <p className="text-sm text-muted-foreground">Connect your social accounts to sync your content</p>
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
                            onClick={() => addToPortfolio(post.post_id)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add to Portfolio
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
      </div>
    </Layout>
  );
}