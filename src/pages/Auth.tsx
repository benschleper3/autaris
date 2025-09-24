import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();
  const loc = useLocation() as any;

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(null); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get('full_name') ?? '');
    const phone = String(fd.get('phone') ?? '');
    const email = String(fd.get('email') ?? '');
    const password = String(fd.get('password') ?? '');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, phone, avatar_url: null } }
    });

    setLoading(false);
    if (error) { setErr(error.message); return; }
    if (data.session) {
      nav((loc.state?.from?.pathname as string) || '/dashboard', { replace: true });
    } else {
      setErr('Check your email to confirm your account, then sign in.');
    }
  }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(null); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '');
    const password = String(fd.get('password') ?? '');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    if (data.session) nav((loc.state?.from?.pathname as string) || '/dashboard', { replace: true });
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{mode === 'signup' ? 'Create account' : 'Sign in'}</h1>
          <button className="text-sm underline" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
            {mode === 'signup' ? 'Have an account? Sign in' : 'Need an account? Create one'}
          </button>
        </div>

        {mode === 'signup' ? (
          <form className="space-y-3" onSubmit={handleSignUp}>
            <div><label className="text-sm">Full name</label><Input name="full_name" required placeholder="Your name" /></div>
            <div><label className="text-sm">Phone</label><Input name="phone" required placeholder="Your phone" /></div>
            <div><label className="text-sm">Email</label><Input name="email" type="email" required placeholder="you@example.com" /></div>
            <div><label className="text-sm">Password</label><Input name="password" type="password" required placeholder="********" /></div>
            {err && <p className="text-xs text-red-500">{err}</p>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Working…' : 'Sign up'}</Button>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={handleSignIn}>
            <div><label className="text-sm">Email</label><Input name="email" type="email" required placeholder="you@example.com" /></div>
            <div><label className="text-sm">Password</label><Input name="password" type="password" required placeholder="********" /></div>
            {err && <p className="text-xs text-red-500">{err}</p>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Working…' : 'Sign in'}</Button>
          </form>
        )}
      </Card>
    </div>
  );
}