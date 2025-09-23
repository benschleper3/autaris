import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    // This will trigger the AuthForm which handles signup
    const { error } = await supabase.auth.signInWithPassword({
      email: 'signup_trigger',
      password: 'signup_trigger'
    });
    // If user is already logged in somehow, redirect to dashboard
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      navigate('/dashboard');
    } else {
      // Redirect to a signup page or modal - for now, let's scroll to hero
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = async () => {
    // Similar approach - this could open a login modal or redirect
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      navigate('/dashboard');
    } else {
      // For now, let's scroll to hero where they can access auth
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Screenshots', href: '#screenshots' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav id="nav" className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent">
            Growth OS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6 ml-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <Button variant="ghost" size="sm" onClick={handleLogin}>
              Log in
            </Button>
            <Button size="sm" onClick={handleSignUp}>
              Get started
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-6 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </a>
                ))}
                
                <div className="border-t pt-6 space-y-3">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogin();
                      setIsOpen(false);
                    }}
                  >
                    Log in
                  </Button>
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => {
                      handleSignUp();
                      setIsOpen(false);
                    }}
                  >
                    Get started
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}