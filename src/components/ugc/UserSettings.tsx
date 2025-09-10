import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, User, Link2, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface SocialAccount {
  platform: string;
  handle: string;
  status: string;
  last_synced_at: string;
}

interface UserProfile {
  email: string;
  full_name: string;
  avatar_url?: string;
}

export default function UserSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setProfile({
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url
          });
        }

        // Fetch social accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from('social_accounts')
          .select('platform, handle, status, last_synced_at')
          .order('created_at', { ascending: false });

        if (accountsError) throw accountsError;
        setSocialAccounts(accountsData || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const addSocialAccount = async () => {
    toast({
      title: "Coming Soon",
      description: "Social account integration will be available soon",
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'connected': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'error': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed from here
              </p>
            </div>

            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile?.full_name || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Profile information is read-only
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  UGC Creator
                </Badge>
                <span className="text-sm text-muted-foreground">Your current role</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Accounts */}
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Social Accounts
              </CardTitle>
              <Button onClick={addSocialAccount} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Account
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {socialAccounts.length === 0 ? (
              <div className="text-center py-8">
                <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No social accounts connected</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your social media accounts to track performance
                </p>
                <Button onClick={addSocialAccount} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Account
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Handle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {socialAccounts.map((account, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="secondary" className={getPlatformColor(account.platform)}>
                            {account.platform}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          @{account.handle}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(account.status)}>
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {account.last_synced_at 
                            ? new Date(account.last_synced_at).toLocaleDateString()
                            : 'Never'
                          }
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
    </div>
  );
}