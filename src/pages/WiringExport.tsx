import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, FileCode, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ComponentInfo {
  page_path: string;
  component_id: string;
  label_or_title: string;
  component_type: 'Chart' | 'Table' | 'Card' | 'Form' | 'Kanban' | 'Button' | 'Text' | 'Other';
  role_visibility: string[];
  data_source_kind: 'None' | 'SupabaseTable' | 'SupabaseQuery' | 'LocalState' | 'Static';
  data_table_name: string;
  data_query_sql: string;
  data_filters: Record<string, any>;
  input_bindings: Record<string, any>;
  output_mappings: Record<string, any>;
  actions: Array<{
    event: string;
    method: string;
    url_or_function: string;
    body_template: Record<string, any>;
  }>;
  notes: string;
}

export default function WiringExport() {
  const { toast } = useToast();
  const [selectedPages, setSelectedPages] = useState([
    '/dashboard-ugc',
    '/content', 
    '/performance',
    '/analytics'
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const availablePages = [
    '/dashboard-ugc',
    '/content',
    '/performance', 
    '/analytics'
  ];

  // Mock component inventory based on actual components
  const componentInventory: ComponentInfo[] = [
    // UGC Dashboard Components
    {
      page_path: '/dashboard-ugc',
      component_id: 'platform-cards',
      label_or_title: 'Platform Overview Cards',
      component_type: 'Card',
      role_visibility: ['ugc'],
      data_source_kind: 'Static',
      data_table_name: '',
      data_query_sql: '',
      data_filters: {},
      input_bindings: {},
      output_mappings: { platforms: 'card_grid' },
      actions: [{ event: 'onClick', method: 'FUNCTION', url_or_function: 'navigateToPlatform', body_template: { platform: 'platform_id' } }],
      notes: ''
    },
    {
      page_path: '/dashboard-ugc',
      component_id: 'metric-card-followers',
      label_or_title: 'Total Followers',
      component_type: 'Card',
      role_visibility: ['ugc'],
      data_source_kind: 'None',
      data_table_name: '',
      data_query_sql: '',
      data_filters: {},
      input_bindings: { title: 'Total Followers', value: '26.4K', change: '+8.2%' },
      output_mappings: { value: 'display_value', change: 'trend_indicator' },
      actions: [],
      notes: 'UNBOUND_PLACEHOLDER - Static data needs Supabase connection'
    },
    {
      page_path: '/dashboard-ugc',
      component_id: 'metric-card-reach',
      label_or_title: 'Weekly Reach',
      component_type: 'Card',
      role_visibility: ['ugc'],
      data_source_kind: 'None',
      data_table_name: '',
      data_query_sql: '',
      data_filters: {},
      input_bindings: { title: 'Weekly Reach', value: '89.2K', change: '+12.5%' },
      output_mappings: { value: 'display_value', change: 'trend_indicator' },
      actions: [],
      notes: 'UNBOUND_PLACEHOLDER - Static data needs Supabase connection'
    },
    {
      page_path: '/dashboard-ugc',
      component_id: 'activity-chart',
      label_or_title: 'Weekly Activity',
      component_type: 'Chart',
      role_visibility: ['ugc'],
      data_source_kind: 'Static',
      data_table_name: '',
      data_query_sql: '',
      data_filters: {},
      input_bindings: {},
      output_mappings: { 
        xAxis: 'day_name', 
        yAxis: ['followers', 'engagement'],
        gradients: ['growth-primary', 'growth-secondary']
      },
      actions: [],
      notes: 'Static mock data - needs post_metrics table connection'
    },
    {
      page_path: '/dashboard-ugc',
      component_id: 'content-performance-tracker',
      label_or_title: 'Content Performance',
      component_type: 'Card',
      role_visibility: ['ugc'],
      data_source_kind: 'None',
      data_table_name: 'post_metrics',
      data_query_sql: '',
      data_filters: { time_period: 'last_30_days' },
      input_bindings: {},
      output_mappings: { 
        platforms: 'platform_list',
        metrics: ['views', 'likes', 'shares', 'comments', 'saves', 'engagement_rate']
      },
      actions: [],
      notes: 'UNBOUND_PLACEHOLDER - Should connect to post_metrics table'
    },
    {
      page_path: '/dashboard-ugc',
      component_id: 'revenue-tracker',
      label_or_title: 'Revenue Tracker',
      component_type: 'Card',
      role_visibility: ['ugc'],
      data_source_kind: 'None',
      data_table_name: '',
      data_query_sql: '',
      data_filters: {},
      input_bindings: {},
      output_mappings: {},
      actions: [],
      notes: 'UNBOUND_PLACEHOLDER - Needs revenue/earnings data structure'
    },
    {
      page_path: '/dashboard-ugc',
      component_id: 'brand-report-generator',
      label_or_title: 'Brand Report Generator',
      component_type: 'Card',
      role_visibility: ['ugc'],
      data_source_kind: 'None',
      data_table_name: '',
      data_query_sql: '',
      data_filters: {},
      input_bindings: {},
      output_mappings: {},
      actions: [{ event: 'onClick', method: 'POST', url_or_function: '/api/generate-report', body_template: { user_id: 'auth.user_id', report_type: 'brand' } }],
      notes: 'UNBOUND_PLACEHOLDER - Needs brand partnership data'
    },
    {
      page_path: '/dashboard-ugc',
      component_id: 'portfolio-builder',
      label_or_title: 'Portfolio Builder',
      component_type: 'Card',
      role_visibility: ['ugc'],
      data_source_kind: 'None',
      data_table_name: '',
      data_query_sql: '',
      data_filters: {},
      input_bindings: {},
      output_mappings: {},
      actions: [],
      notes: 'UNBOUND_PLACEHOLDER - Needs content portfolio structure'
    },
    {
      page_path: '/dashboard-ugc',
      component_id: 'ai-growth-insights',
      label_or_title: 'AI Growth Insights',
      component_type: 'Card',
      role_visibility: ['ugc'],
      data_source_kind: 'Static',
      data_table_name: 'weekly_insights',
      data_query_sql: '',
      data_filters: { user_id: 'auth.user_id' },
      input_bindings: {},
      output_mappings: { insights: 'insight_list', confidence: 'confidence_scores' },
      actions: [],
      notes: 'Has weekly_insights table reference but using static data'
    },
    {
      page_path: '/dashboard-ugc',
      component_id: 'campaign-dashboard',
      label_or_title: 'Campaign Dashboard',
      component_type: 'Card',
      role_visibility: ['ugc'],
      data_source_kind: 'None',
      data_table_name: '',
      data_query_sql: '',
      data_filters: {},
      input_bindings: {},
      output_mappings: {},
      actions: [],
      notes: 'UNBOUND_PLACEHOLDER - Needs campaign management structure'
    },
    {
      page_path: '/dashboard-ugc',
      component_id: 'top-posts',
      label_or_title: 'Top Posts',
      component_type: 'Table',
      role_visibility: ['ugc'],
      data_source_kind: 'None',
      data_table_name: 'post_metrics',
      data_query_sql: 'SELECT * FROM post_metrics WHERE user_id = auth.uid() ORDER BY engagement_rate DESC LIMIT 10',
      data_filters: { user_id: 'auth.user_id', limit: 10 },
      input_bindings: {},
      output_mappings: { 
        columns: ['title', 'platform', 'engagement_rate', 'views', 'likes'],
        sort: 'engagement_rate_desc'
      },
      actions: [{ event: 'onRowClick', method: 'FUNCTION', url_or_function: 'viewPostDetails', body_template: { post_id: 'row.post_id' } }],
      notes: 'UNBOUND_PLACEHOLDER - Should query post_metrics table'
    },
    // Placeholder entries for other pages
    {
      page_path: '/content',
      component_id: 'content-library',
      label_or_title: 'Content Library',
      component_type: 'Table',
      role_visibility: ['ugc'],
      data_source_kind: 'None',
      data_table_name: 'post_metrics',
      data_query_sql: 'SELECT * FROM post_metrics WHERE user_id = auth.uid()',
      data_filters: { user_id: 'auth.user_id' },
      input_bindings: {},
      output_mappings: { columns: ['title', 'platform', 'published_at', 'engagement_rate'] },
      actions: [],
      notes: 'UNBOUND_PLACEHOLDER - Page not implemented yet'
    },
    {
      page_path: '/performance',
      component_id: 'performance-analytics',
      label_or_title: 'Performance Analytics',
      component_type: 'Chart',
      role_visibility: ['ugc'],
      data_source_kind: 'None',
      data_table_name: 'post_metrics',
      data_query_sql: 'SELECT DATE(published_at) as date, AVG(engagement_rate) as avg_engagement FROM post_metrics WHERE user_id = auth.uid() GROUP BY DATE(published_at)',
      data_filters: { user_id: 'auth.user_id' },
      input_bindings: {},
      output_mappings: { xAxis: 'date', yAxis: 'avg_engagement' },
      actions: [],
      notes: 'UNBOUND_PLACEHOLDER - Page not implemented yet'
    },
    {
      page_path: '/analytics',
      component_id: 'analytics-overview',
      label_or_title: 'Analytics Overview',
      component_type: 'Card',
      role_visibility: ['ugc', 'coach'],
      data_source_kind: 'None',
      data_table_name: 'post_metrics',
      data_query_sql: '',
      data_filters: {},
      input_bindings: {},
      output_mappings: {},
      actions: [],
      notes: 'UNBOUND_PLACEHOLDER - Page not implemented yet'
    }
  ];

  const filteredComponents = useMemo(() => {
    return componentInventory.filter(component => {
      const matchesPage = selectedPages.includes(component.page_path);
      const matchesSearch = searchQuery === '' || 
        component.component_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.label_or_title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || component.component_type === typeFilter;
      const matchesRole = roleFilter === 'all' || 
        (roleFilter === 'ugc' && component.role_visibility.includes('ugc')) ||
        (roleFilter === 'coach' && component.role_visibility.includes('coach'));
      
      return matchesPage && matchesSearch && matchesType && matchesRole;
    });
  }, [selectedPages, searchQuery, typeFilter, roleFilter, componentInventory]);

  const exportJson = useMemo(() => {
    const groupedByPage = filteredComponents.reduce((acc, component) => {
      const page = acc.find(p => p.path === component.page_path);
      const componentData = {
        id: component.component_id,
        label: component.label_or_title,
        type: component.component_type,
        roleVisibility: component.role_visibility,
        data: {
          kind: component.data_source_kind,
          table: component.data_table_name,
          sql: component.data_query_sql,
          filters: component.data_filters
        },
        inputs: component.input_bindings,
        outputs: component.output_mappings,
        actions: component.actions.map(action => ({
          event: action.event,
          method: action.method,
          urlOrFn: action.url_or_function,
          body: action.body_template
        })),
        notes: component.notes
      };

      if (page) {
        page.components.push(componentData);
      } else {
        acc.push({
          path: component.page_path,
          components: [componentData]
        });
      }
      return acc;
    }, [] as any[]);

    return {
      export_version: "v1",
      generated_at_iso: new Date().toISOString(),
      pages: groupedByPage
    };
  }, [filteredComponents]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportJson, null, 2));
      toast({
        title: "Copied to clipboard",
        description: "The JSON export has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please select and copy manually.",
        variant: "destructive",
      });
    }
  };

  const handlePageToggle = (page: string, checked: boolean) => {
    if (checked) {
      setSelectedPages([...selectedPages, page]);
    } else {
      setSelectedPages(selectedPages.filter(p => p !== page));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <FileCode className="w-8 h-8" />
          Wiring Export
        </h1>
        <p className="text-muted-foreground">
          Copy this JSON and paste it back to my assistant.
        </p>
      </div>

      {/* Page Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Select Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availablePages.map(page => (
              <div key={page} className="flex items-center space-x-2">
                <Checkbox
                  id={page}
                  checked={selectedPages.includes(page)}
                  onCheckedChange={(checked) => handlePageToggle(page, !!checked)}
                />
                <label htmlFor={page} className="text-sm font-medium">
                  {page}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Component Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Chart">Chart</SelectItem>
                <SelectItem value="Table">Table</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Form">Form</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ugc">UGC</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Component Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Component Inventory ({filteredComponents.length} components)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border p-2 text-left">Page</th>
                  <th className="border border-border p-2 text-left">Component ID</th>
                  <th className="border border-border p-2 text-left">Label</th>
                  <th className="border border-border p-2 text-left">Type</th>
                  <th className="border border-border p-2 text-left">Role Visibility</th>
                  <th className="border border-border p-2 text-left">Data Source</th>
                  <th className="border border-border p-2 text-left">Table</th>
                  <th className="border border-border p-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.map((component, index) => (
                  <tr 
                    key={index} 
                    className={component.notes.includes('UNBOUND_PLACEHOLDER') ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}
                  >
                    <td className="border border-border p-2 text-sm">{component.page_path}</td>
                    <td className="border border-border p-2 text-sm font-mono">{component.component_id}</td>
                    <td className="border border-border p-2 text-sm">{component.label_or_title}</td>
                    <td className="border border-border p-2">
                      <Badge variant="secondary">{component.component_type}</Badge>
                    </td>
                    <td className="border border-border p-2">
                      <div className="flex gap-1">
                        {component.role_visibility.map(role => (
                          <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="border border-border p-2">
                      <Badge 
                        variant={component.data_source_kind === 'None' ? 'destructive' : 'default'}
                        className="text-xs"
                      >
                        {component.data_source_kind}
                      </Badge>
                    </td>
                    <td className="border border-border p-2 text-sm font-mono">{component.data_table_name || '-'}</td>
                    <td className="border border-border p-2 text-xs text-muted-foreground max-w-xs truncate" title={component.notes}>
                      {component.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* JSON Export */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>JSON Export</CardTitle>
          <Button onClick={handleCopyToClipboard} size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
            <code>{JSON.stringify(exportJson, null, 2)}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}