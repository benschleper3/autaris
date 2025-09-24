import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface PortfolioManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PortfolioItem {
  id: string;
  post_id: string;
  featured: boolean;
  title: string;
  image_url: string;
}

export default function PortfolioManagerModal({ open, onOpenChange }: PortfolioManagerModalProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPortfolioItems();
    }
  }, [open]);

  const fetchPortfolioItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('id, post_id, featured, title, image_url')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      // Update local database directly
      const { error } = await supabase
        .from('portfolio_items')
        .update({ featured })
        .eq('id', id);

      if (error) throw error;

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, featured } : item
        )
      );

      toast({
        title: featured ? "Item Featured" : "Item Unfeatured",
        description: `Portfolio item has been ${featured ? 'featured' : 'unfeatured'}.`
      });
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({
        title: "Update Failed",
        description: "Could not update the portfolio item.",
        variant: "destructive"
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      // Delete from local database directly
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      toast({
        title: "Item Deleted",
        description: "Portfolio item has been removed."
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete the portfolio item.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Portfolio Manager</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-16 w-16" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No portfolio items yet</p>
              <p className="text-sm text-muted-foreground">
                Add posts to your portfolio from the Top Posts table
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{item.title || 'Untitled'}</h3>
                    <p className="text-sm text-muted-foreground">Post ID: {item.post_id}</p>
                    {item.featured && (
                      <Badge variant="secondary" className="mt-2">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      Featured
                      <Switch
                        checked={item.featured}
                        onCheckedChange={(checked) => toggleFeatured(item.id, checked)}
                      />
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}