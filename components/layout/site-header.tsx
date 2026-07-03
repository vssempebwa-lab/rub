'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/features/auth/hooks/use-session';
import { UserAccountMenu } from '@/components/layout/user-account-menu';
import { BookSessionDialog } from '@/components/layout/book-session-dialog';
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
  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header
      className={`${fixed ? 'fixed top-0 left-0 right-0 z-50' : 'sticky top-0 z-40'} marketing-header border-b border-border/60 bg-background/90 backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors">
              <Camera className="h-5 w-5 text-primary" />
            </span>
            <div className="leading-tight">
              <span className="font-[family-name:var(--font-playfair)] text-lg font-bold block">Rub Shoots</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Photography Studio</span>
            </div>
          </Link>

          {showNav && (
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="hidden lg:flex items-center gap-2">
            {extraActions}
            {!loading && (
              isAuthenticated && profile ? (
                <UserAccountMenu profile={profile} role={role} onSignOut={signOut} />
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      Client portal
                    </Button>
                  </Link>
                  {extraActions ? null : <BookSessionDialog />}
                </>
              )
            )}
          </div>

          <button
            type="button"
            className="lg:hidden p-2 -mr-2 rounded-md hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background px-4 py-4 space-y-1">
          {showNav && NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2.5 text-sm font-medium ${
                pathname === link.href ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'
              }`}
              onClick={closeMobile}
            >
              {link.label}
            </Link>
          ))}
          {extraActions && <div className="pt-3 mt-2 border-t space-y-2">{extraActions}</div>}
          {!loading && (
            <div className="pt-3 mt-2 border-t space-y-2">
              {isAuthenticated && profile ? (
                <UserAccountMenu profile={profile} role={role} onSignOut={signOut} onNavigate={closeMobile} />
              ) : (
                <>
                  <Link href="/login" onClick={closeMobile}>
                    <Button variant="outline" className="w-full">Client portal</Button>
                  </Link>
                  <BookSessionDialog trigger={<Button className="w-full">Book a session</Button>} />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export { NAV_LINKS };
