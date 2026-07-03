'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { signOutUser } from '@/features/auth/utils/sign-out';
import type { Profile } from '@/types';

export function useSession() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
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
      }
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await signOutUser();
  }

  return {
    profile,
    loading,
    signOut,
    role: profile?.role ?? null,
    isAuthenticated: !!profile,
  };
}
