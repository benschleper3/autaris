import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUserRole() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setUserRole(null);
          return;
        }

        const { data: userData } = await supabase
          .from('user_meta')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        setUserRole(userData?.role || null);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';

  return { userRole, loading, isOwnerOrAdmin };
}