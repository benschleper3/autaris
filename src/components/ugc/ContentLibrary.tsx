import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PostData {
  post_id: string;
  title: string;
  platform: string;
  published_at: string;
  views: number;
  engagement_rate: number;
  url?: string;
}

export default function ContentLibrary() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        let query = supabase
          .from('v_posts_with_latest')
          .select('post_id, title, platform, published_at, created_at, views, engagement_rate, url')
          .order('published_at', { ascending: false });

        if (platformFilter !== 'all') {
          query = query.eq('platform', platformFilter);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [platformFilter]);

  const filteredPosts = posts.filter(post => 
    !searchTerm || 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.platform?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Content Library</h1>
          <p className="text-muted-foreground mt-1">Manage all your content in one place</p>
        </div>
        
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Content Library
        </h1>
        <p className="text-muted-foreground mt-1">Manage all your content in one place</p>
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
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Content ({filteredPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No content found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || platformFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Start creating content to see it here'
                }
              </p>
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
                  {filteredPosts.map((post) => (
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
                        <Button variant="ghost" size="sm">
                          View Details
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
  );
}