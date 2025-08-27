import AuthForm from '@/components/AuthForm';
import TestSupabase from '@/components/TestSupabase';

const Index = () => {
  return (
    <main className="p-6 space-y-6">
      <AuthForm />
      <TestSupabase />
    </main>
  );
};

export default Index;
