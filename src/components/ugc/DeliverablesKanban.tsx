import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar } from 'lucide-react';

interface Deliverable {
  id: string;
  title: string;
  campaign_id: string;
  due_date: string;
  approved: boolean;
  stage: string;
}

const stages = [
  { id: 'script', title: 'Script', color: 'bg-slate-100' },
  { id: 'first_cut', title: 'First Cut', color: 'bg-blue-100' },
  { id: 'final', title: 'Final', color: 'bg-yellow-100' },
  { id: 'submitted', title: 'Submitted', color: 'bg-orange-100' },
  { id: 'approved', title: 'Approved', color: 'bg-green-100' },
  { id: 'paid', title: 'Paid', color: 'bg-emerald-100' }
];

export default function DeliverablesKanban() {
  const [deliverables, setDeliverables] = useState<Record<string, Deliverable[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        const { data, error } = await supabase
          .from('deliverables')
          .select('id, title, campaign_id, due_date, approved, stage')
          .order('due_date', { ascending: true });

        if (error) throw error;

        // Group by stage
        const grouped = (data || []).reduce((acc, deliverable) => {
          const stage = deliverable.stage;
          if (!acc[stage]) acc[stage] = [];
          acc[stage].push(deliverable);
          return acc;
        }, {} as Record<string, Deliverable[]>);

        setDeliverables(grouped);
      } catch (error) {
        console.error('Error fetching deliverables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverables();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deliverables Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/50 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Deliverables Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {stages.map((stage) => (
              <div key={stage.id} className="w-72 flex-shrink-0">
                <div className={`p-3 rounded-t-lg ${stage.color}`}>
                  <h3 className="font-medium">{stage.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {deliverables[stage.id]?.length || 0} items
                  </p>
                </div>
                
                <div className="bg-muted/30 rounded-b-lg p-2 min-h-64 space-y-2">
                  {(deliverables[stage.id] || []).map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="bg-background rounded-lg p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-medium text-sm mb-2">{deliverable.title}</h4>
                      <div className="flex justify-between items-center">
                        {deliverable.approved && (
                          <Badge className="bg-green-100 text-green-800">
                            Approved
                          </Badge>
                        )}
                        {deliverable.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(deliverable.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}