import type { UserRole } from '@/types';

export function getDashboardPath(role?: string | null): string {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'photographer') return '/dashboard/photographer';
  return '/dashboard/client';
}

export function isDashboardPath(pathname: string): boolean {
  return pathname.startsWith('/dashboard');
}
