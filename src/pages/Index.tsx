import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import TestSupabase from '@/components/TestSupabase';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto">
        <TestSupabase />
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
