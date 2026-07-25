export function getDashboardPath(role?: string | null): string {
  return '/dashboard/photographer';
}

export function isDashboardPath(pathname: string): boolean {
  return pathname.startsWith('/dashboard');
}
