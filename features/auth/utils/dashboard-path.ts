export function getDashboardPath(role?: string | null): string {
  if (role === 'admin') return '/dashboard/admin';
  return '/dashboard/photographer';
}

export function isDashboardPath(pathname: string): boolean {
  return pathname.startsWith('/dashboard');
}
