'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Menu, X } from 'lucide-react';
import { useWebsiteContent } from '@/features/website/hooks/use-website-content';
import { defaultSiteSettings, fetchSiteSettings } from '@/features/website/site-settings';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
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
  const { business } = useWebsiteContent();
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);
  const brandName = business.businessName.toLowerCase().includes('photography')
    ? business.businessName
    : `${business.businessName} Photography`;
  const logoUrl = settings.branding.logoUrl || '/logo.png';

  useEffect(() => {
    fetchSiteSettings().then(setSettings);
  }, []);

  return (
    <header
      className={`${fixed ? 'fixed top-0 left-0 right-0 z-50' : 'sticky top-0 z-40'} marketing-header border-b border-border/60 bg-background/90 backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-20 py-3 lg:min-h-24">
          <Link href="/" className="flex min-w-0 items-center gap-0 group">
            {logoUrl ? (
              <span className="flex h-16 w-28 shrink-0 items-center justify-start overflow-hidden sm:h-20 sm:w-36 lg:h-24 lg:w-44">
                <Image
                  src={logoUrl}
                  alt={`${business.businessName} logo`}
                  width={220}
                  height={220}
                  className="h-full w-full object-contain object-left"
                  priority={fixed}
                />
              </span>
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors lg:h-12 lg:w-12">
                <Camera className="h-5 w-5 text-primary" />
              </span>
            )}
            <div className="min-w-0 -ml-1 sm:-ml-2">
              <span className="font-[family-name:var(--font-playfair)] text-lg font-bold block truncate lg:text-xl">
                {brandName}
              </span>
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

          {extraActions && <div className="hidden lg:flex items-center gap-2">{extraActions}</div>}

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
        </div>
      )}
    </header>
  );
}

export { NAV_LINKS };
