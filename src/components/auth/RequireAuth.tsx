import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const session = useSession();
  const loc = useLocation();
  if (session === undefined) return <div className="p-6 text-sm text-muted-foreground">Checking session…</div>;
  if (!session) return <Navigate to="/auth" replace state={{ from: loc }} />;
  return children;
}