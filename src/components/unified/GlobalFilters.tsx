import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarIcon, User, LogOut, Trash2, CreditCard, MessageSquare, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { connectTikTok } from '@/lib/tiktok';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect } from 'react';

interface TikTokProfile {
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number;
  like_count: number;
  video_count: number;
}

interface GlobalFiltersProps {
  filters: {
    from: Date | null;
    to: Date | null;
    platform: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function GlobalFilters({ filters, onFiltersChange }: GlobalFiltersProps) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tiktokProfile, setTiktokProfile] = useState<TikTokProfile | null>(null);
  const [tiktokLoading, setTiktokLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchTikTokProfile();
  }, []);

  const fetchTikTokProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_accounts')
        .select('display_name, avatar_url, follower_count, like_count, video_count')
        .eq('user_id', user.id)
        .eq('platform', 'tiktok')
        .maybeSingle();

      if (error) throw error;
      setTiktokProfile(data);
    } catch (error) {
      console.error('Error fetching TikTok profile:', error);
    } finally {
      setTiktokLoading(false);
    }
  };

  const handleTikTokConnect = () => {
    connectTikTok();
  };

  const handleTikTokDisconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', 'tiktok');

      if (error) throw error;

      setTiktokProfile(null);
      toast({
        title: "Disconnected",
        description: "TikTok account has been disconnected."
      });
    } catch (error) {
      console.error('Error disconnecting TikTok:', error);
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect TikTok account.",
        variant: "destructive"
      });
    }
  };

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete user data
      await supabase.auth.admin.deleteUser(user.id);
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleContactSupport = async () => {
    if (!supportMessage.trim() || !supportEmail.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both your email and message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would integrate with your support system
      // For now, we'll just show a success message
      toast({
        title: "Message sent",
        description: "Our support team will get back to you soon.",
      });
      
      setSupportMessage('');
      setSupportEmail('');
      setSupportDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageSubscription = () => {
    // Redirect to subscription management (implement based on your payment provider)
    toast({
      title: "Coming soon",
      description: "Subscription management will be available soon.",
    });
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">
              Autaris
            </span>
          </Link>
          
          <div className="flex items-center gap-4 ml-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">From:</span>
              <Popover open={fromOpen} onOpenChange={setFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !filters.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.from ? format(filters.from, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.from || undefined}
                    onSelect={(date) => {
                      updateFilter('from', date);
                      setFromOpen(false);
                    }}
                    className="p-3 pointer-events-auto"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">To:</span>
              <Popover open={toOpen} onOpenChange={setToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !filters.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.to ? format(filters.to, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.to || undefined}
                    onSelect={(date) => {
                      updateFilter('to', date);
                      setToOpen(false);
                    }}
                    className="p-3 pointer-events-auto"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {tiktokProfile?.avatar_url ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={tiktokProfile.avatar_url} alt={tiktokProfile.display_name || 'User'} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="w-5 h-5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* TikTok Profile Section */}
            {tiktokProfile && tiktokProfile.display_name ? (
              <>
                <div className="px-2 py-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tiktokProfile.avatar_url || undefined} alt={tiktokProfile.display_name} />
                      <AvatarFallback>{tiktokProfile.display_name[0]?.toUpperCase() || 'T'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{tiktokProfile.display_name}</p>
                      <p className="text-xs text-muted-foreground">TikTok Connected</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-bold">{tiktokProfile.follower_count.toLocaleString()}</div>
                      <div className="text-muted-foreground">Followers</div>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-bold">{tiktokProfile.like_count.toLocaleString()}</div>
                      <div className="text-muted-foreground">Likes</div>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-bold">{tiktokProfile.video_count}</div>
                      <div className="text-muted-foreground">Videos</div>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleTikTokDisconnect}>
                  Disconnect TikTok
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={handleTikTokConnect}
                disabled={tiktokLoading}
              >
                {tiktokLoading ? 'Loading...' : 'Connect TikTok Account'}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleManageSubscription}>
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSupportDialogOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contact Support Dialog */}
      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Send us a message and we'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="support-email">Your Email</Label>
              <Input
                id="support-email"
                type="email"
                placeholder="your@email.com"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                placeholder="How can we help you?"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSupportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContactSupport}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}