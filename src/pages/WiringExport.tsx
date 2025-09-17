import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Copy, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock component data - in a real implementation, this would come from Lovable's internal APIs
const mockComponentData = [
  {
    page_path: '/dashboard-ugc',
    component_id: 'ugc-kpi-cards',
    label_or_title: 'UGC KPI Cards',
    component_type: 'Card',
    role_visibility: ['ugc'],
    data_source_kind: 'SupabaseQuery',
    data_table_name: '',
    data_query_sql: 'SELECT * FROM get_ugc_kpis()',
    data_filters: {},
    input_bindings: { dateRange: 'last_30_days' },
    output_mappings: { views: 'viewsCount', engagement: 'avgEngagement' },
    actions: [],
    notes: 'Main UGC dashboard metrics'
  },
  {
    page_path: '/dashboard-ugc',
    component_id: 'performance-chart',
    label_or_title: 'Performance Trends',
    component_type: 'Chart',
    role_visibility: ['ugc'],
    data_source_kind: 'SupabaseQuery',
    data_table_name: '',
    data_query_sql: 'SELECT * FROM get_daily_perf($1, $2, $3)',
    data_filters: { platform: 'all', dateRange: '30d' },
    input_bindings: { fromDate: 'filters.startDate', toDate: 'filters.endDate' },
    output_mappings: { xAxis: 'day', yAxis: ['day_views', 'avg_er_percent'] },
    actions: [],
    notes: 'Daily performance visualization'
  },
  {
    page_path: '/dashboard-ugc',
    component_id: 'best-posts-table',
    label_or_title: 'Best Posts Table',
    component_type: 'Table',
    role_visibility: ['ugc'],
    data_source_kind: 'SupabaseTable',
    data_table_name: 'v_posts_with_latest',
    data_query_sql: '',
    data_filters: { orderBy: 'engagement_rate', limit: 10 },
    input_bindings: {},
    output_mappings: { columns: ['title', 'platform', 'views', 'engagement_rate'] },
    actions: [
      {
        event: 'onRowClick',
        method: 'FUNCTION',
        url_or_function: 'handlePostClick',
        body_template: { postId: '{{row.post_id}}' }
      }
    ],
    notes: 'Top performing posts by engagement'
  },
  {
    page_path: '/content',
    component_id: 'content-calendar',
    label_or_title: 'Content Calendar',
    component_type: 'Other',
    role_visibility: [],
    data_source_kind: 'None',
    data_table_name: '',
    data_query_sql: '',
    data_filters: {},
    input_bindings: {},
    output_mappings: {},
    actions: [],
    notes: 'UNBOUND_PLACEHOLDER'
  },
  {
    page_path: '/performance',
    component_id: 'analytics-dashboard',
    label_or_title: 'Analytics Overview',
    component_type: 'Chart',
    role_visibility: ['admin', 'owner'],
    data_source_kind: 'LocalState',
    data_table_name: '',
    data_query_sql: '',
    data_filters: {},
    input_bindings: { metrics: 'state.selectedMetrics' },
    output_mappings: { series: ['views', 'likes', 'shares'] },
    actions: [],
    notes: 'Performance analytics dashboard'
  },
  {
    page_path: '/analytics',
    component_id: 'revenue-tracker',
    label_or_title: 'Revenue Tracking',
    component_type: 'Card',
    role_visibility: ['owner'],
    data_source_kind: 'SupabaseTable',
    data_table_name: 'creator_revenue',
    data_query_sql: '',
    data_filters: { status: 'paid' },
    input_bindings: {},
    output_mappings: { totalRevenue: 'sum(amount_cents)' },
    actions: [
      {
        event: 'onUpdate',
        method: 'POST',
        url_or_function: '/api/revenue/update',
        body_template: { amount: '{{form.amount}}', notes: '{{form.notes}}' }
      }
    ],
    notes: 'Creator revenue tracking'
  }
];

const allPages = ['/dashboard-ugc', '/content', '/performance', '/analytics'];
const componentTypes = ['Chart', 'Table', 'Card', 'Form', 'Kanban', 'Button', 'Text', 'Other'];
const roleVisibilities = ['coach', 'ugc', 'owner', 'admin', '[] (no gating)'];

export default function WiringExport() {
  const [selectedPages, setSelectedPages] = useState<string[]>(allPages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    return mockComponentData.filter(item => {
      // Page filter
      if (!selectedPages.includes(item.page_path)) return false;
      
      // Search filter
      if (searchQuery && !item.component_id.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !item.label_or_title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Component type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(item.component_type)) return false;
      
      // Role visibility filter
      if (selectedRoles.length > 0) {
        const itemRoles = item.role_visibility.length === 0 ? ['[] (no gating)'] : item.role_visibility;
        if (!selectedRoles.some(role => itemRoles.includes(role))) return false;
      }
      
      return true;
    });
  }, [selectedPages, searchQuery, selectedTypes, selectedRoles]);

  const exportJson = useMemo(() => {
    const pageGroups = selectedPages.reduce((acc, path) => {
      acc[path] = filteredData.filter(item => item.page_path === path);
      return acc;
    }, {} as Record<string, typeof filteredData>);

    return {
      export_version: "v1",
      generated_at_iso: new Date().toISOString(),
      pages: Object.entries(pageGroups).map(([path, components]) => ({
        path,
        components: components.map(comp => ({
          id: comp.component_id,
          label: comp.label_or_title,
          type: comp.component_type,
          roleVisibility: comp.role_visibility,
          data: {
            kind: comp.data_source_kind,
            table: comp.data_table_name,
            sql: comp.data_query_sql,
            filters: comp.data_filters
          },
          inputs: comp.input_bindings,
          outputs: comp.output_mappings,
          actions: comp.actions.map(action => ({
            event: action.event,
            method: action.method,
            urlOrFn: action.url_or_function,
            body: action.body_template
          })),
          notes: comp.notes
        }))
      }))
    };
  }, [selectedPages, filteredData]);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportJson, null, 2));
      toast({
        title: "Copied to clipboard",
        description: "Wiring export JSON has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy JSON to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handlePageToggle = (page: string) => {
    setSelectedPages(prev => 
      prev.includes(page) 
        ? prev.filter(p => p !== page)
        : [...prev, page]
    );
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Wiring Export
          </h1>
          <p className="text-muted-foreground mt-1">
            Copy this JSON and paste it back to my assistant.
          </p>
        </div>

        {/* Controls Row */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Page Picker */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Pages</Label>
              <div className="flex flex-wrap gap-2">
                {allPages.map(page => (
                  <div key={page} className="flex items-center space-x-2">
                    <Checkbox
                      id={`page-${page}`}
                      checked={selectedPages.includes(page)}
                      onCheckedChange={() => handlePageToggle(page)}
                    />
                    <Label htmlFor={`page-${page}`} className="text-sm">
                      {page}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Filter by component ID or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Component Type</Label>
                <div className="flex flex-wrap gap-2">
                  {componentTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => handleTypeToggle(type)}
                      />
                      <Label htmlFor={`type-${type}`} className="text-xs">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Role Visibility</Label>
                <div className="flex flex-wrap gap-2">
                  {roleVisibilities.map(role => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={() => handleRoleToggle(role)}
                      />
                      <Label htmlFor={`role-${role}`} className="text-xs">
                        {role}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Copy Button */}
            <div className="flex justify-end">
              <Button onClick={handleCopyJson} className="gap-2">
                <Copy className="w-4 h-4" />
                Copy JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Component Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Component Inventory</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredData.length} components found
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Page Path</th>
                    <th className="text-left p-2 font-medium">Component ID</th>
                    <th className="text-left p-2 font-medium">Label/Title</th>
                    <th className="text-left p-2 font-medium">Type</th>
                    <th className="text-left p-2 font-medium">Role Visibility</th>
                    <th className="text-left p-2 font-medium">Data Source</th>
                    <th className="text-left p-2 font-medium">Table</th>
                    <th className="text-left p-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`border-b hover:bg-muted/50 ${
                        item.data_source_kind === 'None' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                      }`}
                    >
                      <td className="p-2 font-mono text-xs">{item.page_path}</td>
                      <td className="p-2 font-mono text-xs">{item.component_id}</td>
                      <td className="p-2">{item.label_or_title}</td>
                      <td className="p-2">
                        <Badge variant="secondary">{item.component_type}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {item.role_visibility.length === 0 ? (
                            <Badge variant="outline" className="text-xs">No gating</Badge>
                          ) : (
                            item.role_visibility.map(role => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge 
                          variant={item.data_source_kind === 'None' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {item.data_source_kind}
                        </Badge>
                      </td>
                      <td className="p-2 font-mono text-xs">{item.data_table_name || '-'}</td>
                      <td className="p-2 text-xs text-muted-foreground max-w-48 truncate">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* JSON Export Viewer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">JSON Export</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96 whitespace-pre-wrap">
              {JSON.stringify(exportJson, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}