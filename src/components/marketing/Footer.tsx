import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent">
                Growth OS
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              The all-in-one platform for UGC creators to track performance, understand what works, and generate brand-ready reports.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-semibold">Legal</h3>
              <nav className="flex flex-col space-y-1 text-sm">
                <Link 
                  to="/terms" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
                <Link 
                  to="/privacy" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </nav>
            </div>

            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-semibold">Contact</h3>
              <nav className="flex flex-col space-y-1 text-sm">
                <a 
                  href="mailto:BenSchleper8@gmail.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  BenSchleper8@gmail.com
                </a>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} Growth OS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}