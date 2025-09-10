import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Eye, TrendingUp, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PortfolioItem {
  id: string;
  post_id: string;
  featured: boolean;
  title: string;
  platform: string;
  engagement_rate: number;
  views: number;
  image_url?: string;
}

interface Props {
  onClose: () => void;
}

export default function PortfolioManagerModal({ onClose }: Props) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  const fetchPortfolioItems = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get portfolio items with post data
      const { data: portfolioData, error } = await supabase
        .from('portfolio_items')
        .select(`
          id,
          post_id,
          featured,
          title,
          image_url
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching portfolio items:', error);
        setItems([]);
      } else {
        // For now, mock the additional data since we don't have post relationships
        const formatted = (portfolioData || []).map(item => ({
          ...item,
          platform: 'instagram', // Mock platform
          engagement_rate: Math.random() * 10, // Mock ER
          views: Math.floor(Math.random() * 100000) // Mock views
        }));
        setItems(formatted);
      }
    } catch (error) {
      console.error('Error:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('portfolio_items')
        .update({ featured: !item.featured })
        .eq('id', id);

      if (error) {
        console.error('Error updating featured status:', error);
        toast({
          title: "Error",
          description: "Failed to update featured status",
          variant: "destructive"
        });
      } else {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, featured: !item.featured } : item
        ));
        toast({
          title: "Success",
          description: "Featured status updated",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const removeFromPortfolio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing portfolio item:', error);
        toast({
          title: "Error",
          description: "Failed to remove item from portfolio",
          variant: "destructive"
        });
      } else {
        setItems(prev => prev.filter(item => item.id !== id));
        toast({
          title: "Success",
          description: "Item removed from portfolio",
        });
      }
    } catch (error) {
      console.error('Error:', error);
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
      <>
        <DialogHeader>
          <DialogTitle>Portfolio Manager</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Portfolio Manager</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No portfolio items yet</p>
            <p className="text-sm text-muted-foreground">
              Add posts to your portfolio from the Top Posts table
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>ER%</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        {item.title || 'Untitled'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getPlatformColor(item.platform)}>
                        {item.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {item.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono">
                      {item.engagement_rate.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.featured}
                        onCheckedChange={() => toggleFeatured(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromPortfolio(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </>
  );
}