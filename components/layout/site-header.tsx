'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, LayoutDashboard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/features/auth/hooks/use-session';
import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { getDashboardPath } from '@/features/auth/utils/dashboard-path';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

type SiteHeaderProps = {
  fixed?: boolean;
  showNav?: boolean;
  extraActions?: React.ReactNode;
};

export function SiteHeader({ fixed = false, showNav = true, extraActions }: SiteHeaderProps) {
  const pathname = usePathname();
  const { profile, loading, signOut, role, isAuthenticated } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardPath = getDashboardPath(role);
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Account';

  return (
    <header
      className={`${fixed ? 'fixed top-0 left-0 right-0 z-50' : ''} bg-background/80 backdrop-blur-md border-b`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            <span className="font-[family-name:var(--font-playfair)] text-xl font-bold">Rub Shoots</span>
          </Link>

          {showNav && (
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="hidden lg:flex items-center gap-3">
            {extraActions}
            {!loading && (
              isAuthenticated ? (
                <>
                  <Link href={dashboardPath}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <span className="text-sm text-muted-foreground hidden xl:inline">
                    {displayName}
                  </span>
                  <SignOutButton onSignOut={signOut} />
                </>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
              )
            )}
          </div>

          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background px-4 py-4 space-y-3">
          {showNav && NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-sm font-medium py-2 ${
                pathname === link.href ? 'text-foreground' : 'text-muted-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {extraActions && <div className="pt-2 border-t">{extraActions}</div>}
          {!loading && (
            isAuthenticated ? (
              <>
                <Link
                  href={dashboardPath}
                  className="flex items-center gap-2 text-sm font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <p className="text-sm text-muted-foreground py-1">{displayName}</p>
                <SignOutButton
                  display="menu"
                  onSignOut={signOut}
                  onOpen={() => setMobileMenuOpen(false)}
                />
              </>
            ) : (
              <Link
                href="/login"
                className="block text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
}

export { NAV_LINKS };
