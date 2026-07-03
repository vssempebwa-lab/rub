'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getDashboardPath } from './use-auth';

export function useRequireAdmin() {
  const router = useRouter();
  const { profile, loading, role } = useAuth();

  useEffect(() => {
    if (!loading && role !== 'admin') {
      router.replace(getDashboardPath(role));
    }
  }, [loading, role, router]);

  return { profile, loading, isAdmin: role === 'admin' };
}
