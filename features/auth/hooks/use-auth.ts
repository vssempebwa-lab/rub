'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { signOutUser } from '@/features/auth/utils/sign-out';
import { getDashboardPath } from '@/features/auth/utils/dashboard-path';
import type { Profile } from '@/types';

export function useAuth({ redirectTo }: { redirectTo?: string } = {}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const signingOutRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (mounted && !signingOutRef.current && redirectTo) {
            router.push(redirectTo);
          } else if (mounted) {
            setLoading(false);
            setError('Not authenticated');
          }
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (mounted) {
          setProfile(profileData);
          setLoading(false);
          setError(null);
        }
      } catch (err: unknown) {
        if (mounted) {
          setLoading(false);
          setError(err instanceof Error ? err.message : 'Authentication failed');
        }
      }
    }

    checkAuth();

    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const authResult = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session && !signingOutRef.current && redirectTo) {
          router.push(redirectTo);
        }
      });
      subscription = authResult.data.subscription;
    } catch {
      // Auth listener failed; continue without real-time auth updates
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [redirectTo, router]);

  async function signOut() {
    signingOutRef.current = true;
    await signOutUser();
  }

  return { profile, loading, error, signOut, role: profile?.role ?? 'client' };
}

export { getDashboardPath };
