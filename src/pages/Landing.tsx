import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/marketing/Navbar';
import { Hero } from '@/components/marketing/Hero';
import { Features } from '@/components/marketing/Features';
import { Screenshots } from '@/components/marketing/Screenshots';
import { Testimonials } from '@/components/marketing/Testimonials';
import { FAQ } from '@/components/marketing/FAQ';
import { Footer } from '@/components/marketing/Footer';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/dashboard');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Screenshots />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}