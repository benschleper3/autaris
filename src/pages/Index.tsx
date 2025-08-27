import AuthForm from '@/components/AuthForm';
import TestSupabase from '@/components/TestSupabase';
import ProfileCard from '@/components/ProfileCard';

const Index = () => {
  return (
    <main className="p-6 space-y-6">
      <AuthForm />
      <ProfileCard />
      <TestSupabase />
    </main>
  );
};

export default Index;
