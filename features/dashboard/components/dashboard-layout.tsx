'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { dashboardNavigation, getDashboardPageTitle, roleLabels } from '@/features/dashboard/config/navigation';
import { getDashboardPath } from '@/features/auth/utils/dashboard-path';
import type { UserRole } from '@/types';

function DashboardSidebarSkeleton() {
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/80 animate-pulse">
      <div className="h-16 border-b" />
      <div className="p-4 border-b">
        <div className="h-10 w-10 rounded-full bg-muted" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-8 w-full rounded-md bg-muted" />
        <div className="h-8 w-full rounded-md bg-muted" />
        <div className="h-8 w-full rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, loading, signOut, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fallbackRole: UserRole = role === 'admin' ? 'admin' : 'photographer';
  const currentNav = dashboardNavigation[fallbackRole];
  const dashboardHome = getDashboardPath(role);
  const pageTitle = getDashboardPageTitle(pathname);
  const workspaceLabel = roleLabels[fallbackRole] ?? 'Workspace';

  if (loading) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center" suppressHydrationWarning>
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" suppressHydrationWarning />
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen flex" suppressHydrationWarning>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/80 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        suppressHydrationWarning
      >
        <div className="h-full flex flex-col">
          <div className="h-16 px-5 border-b flex items-center relative">
            <Link href={dashboardHome} className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Camera className="h-4 w-4" />
              </span>
              <div className="min-w-0 leading-tight">
                <span className="font-semibold text-sm block truncate">Rub Shoots</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Workspace</span>
              </div>
            </Link>
            <button type="button" className="lg:hidden ml-auto p-1" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-4 py-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold text-sm">
                  {(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{profile?.full_name || profile?.email}</p>
                <p className="text-xs text-muted-foreground truncate">{workspaceLabel}</p>
              </div>
            </div>
          </div>

          <div className="py-3 px-3 flex-1 overflow-y-auto">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Manage</p>
            <nav className="space-y-0.5" aria-label="Workspace navigation">
              {currentNav.map((item) => (
                <WorkspaceNavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setSidebarOpen(false)}
                />
              ))}
            </nav>
          </div>

          <div className="p-3 border-t space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              View public website
            </Link>
            <SignOutButton display="sidebar" onSignOut={signOut} />
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky h-14 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-8 top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" className="lg:hidden p-1 -ml-1" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:block">{workspaceLabel}</p>
              <h1 className="font-semibold text-base sm:text-lg truncate">{pageTitle}</h1>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Public site</span>
            </Button>
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

function WorkspaceNavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: (typeof dashboardNavigation)[keyof typeof dashboardNavigation][number];
  pathname: string;
  onNavigate: () => void;
}) {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
      onClick={onNavigate}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 truncate">{item.label}</span>
    </Link>
  );
}
