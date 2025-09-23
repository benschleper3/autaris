import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const session = useSession();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const navLinks = [
    { name: 'Features', href: '/features', isRoute: true },
    { name: 'FAQ', href: '/faq', isRoute: true },
    { name: 'Terms', href: '/terms', isRoute: true },
    { name: 'Privacy', href: '/privacy', isRoute: true },
  ];

  return (
    <nav id="nav" className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link 
          to="/landing" 
          className="flex items-center space-x-2"
          onClick={() => {
            // Scroll to top when clicking logo
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent">
            Growth OS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6 ml-8">
          {navLinks.map((link) => 
            link.isRoute ? (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {link.name}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {link.name}
              </a>
            )
          )}
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {session ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleSignIn}>
                  Sign in
                </Button>
                <Button size="sm" onClick={handleSignIn}>
                  Get started
                </Button>
              </>
            )}
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
                {navLinks.map((link) => 
                  link.isRoute ? (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </a>
                  )
                )}
                
                <div className="border-t pt-6 space-y-3">
                  {session ? (
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                    >
                      Sign out
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        size="lg" 
                        className="w-full justify-start"
                        onClick={() => {
                          handleSignIn();
                          setIsOpen(false);
                        }}
                      >
                        Sign in
                      </Button>
                      <Button 
                        size="lg" 
                        className="w-full"
                        onClick={() => {
                          handleSignIn();
                          setIsOpen(false);
                        }}
                      >
                        Get started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}