'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getDashboardPath } from '@/features/auth/utils/dashboard-path';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { loading, role } = useAuth({ redirectTo: '/login' });

  useEffect(() => {
    if (!loading) {
      router.replace(getDashboardPath(role));
    }
  }, [loading, role, router]);

  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
