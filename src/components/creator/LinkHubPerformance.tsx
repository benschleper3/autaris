import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, MousePointer } from 'lucide-react';

interface LinkPerformance {
  title: string;
  slug: string;
  clicks: number;
}

export default function LinkHubPerformance() {
  const [linkData, setLinkData] = useState<LinkPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkPerformance = async () => {
      try {
        const { data, error } = await supabase
          .from('link_hub_links')
          .select(`
            title,
            slug,
            link_clicks(count)
          `)
          .order('link_clicks.count', { ascending: false });

        if (error) throw error;
        
        // Transform the data
        const transformedData = (data || []).map(link => ({
          title: link.title,
          slug: link.slug,
          clicks: link.link_clicks?.length || 0
        }));
        
        setLinkData(transformedData);
      } catch (error) {
        console.error('Error fetching link performance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkPerformance();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link Hub Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Link Hub Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {linkData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No link hub data available</p>
            <p className="text-sm">Create links to track their performance</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linkData.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell className="text-muted-foreground">/{link.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <MousePointer className="w-3 h-3" />
                      {link.clicks}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}