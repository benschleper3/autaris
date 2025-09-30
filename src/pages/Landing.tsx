import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/marketing/Navbar';
import { Hero } from '@/components/marketing/Hero';
import { Features } from '@/components/marketing/Features';
import { SocialImpact } from '@/components/marketing/SocialImpact';
import { FoundationLaunch } from '@/components/marketing/FoundationLaunch';
import { Footer } from '@/components/marketing/Footer';

export default function Landing() {
  const navigate = useNavigate();

  // No auto-redirect - allow authenticated users to view landing page

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <SocialImpact />
        <FoundationLaunch />
      </main>
      <Footer />
    </div>
  );
}