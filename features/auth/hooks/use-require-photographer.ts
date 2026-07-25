'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getDashboardPath } from './use-auth';

export function useRequirePhotographer() {
  const router = useRouter();
  const { profile, loading, role } = useAuth();

  useEffect(() => {
    if (!loading && role !== 'photographer') {
      router.replace(getDashboardPath(role));
    }
  }, [loading, role, router]);

  return { profile, loading, hasWorkspaceAccess: role === 'photographer' };
}
