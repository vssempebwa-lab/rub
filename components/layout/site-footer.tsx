'use client';

import Link from 'next/link';
import { Camera, Phone, Mail, MapPin, Clock, LayoutDashboard, LogIn } from 'lucide-react';
import { useSession } from '@/features/auth/hooks/use-session';
import { getDashboardPath } from '@/features/auth/utils/dashboard-path';
import { NAV_LINKS } from '@/components/layout/site-header';
import { useWebsiteContent } from '@/features/website/hooks/use-website-content';
import { SocialLinksBar } from '@/features/website/components/social-links';

export function SiteFooter() {
  const { isAuthenticated, role, loading } = useSession();
  const { business, loading: contentLoading } = useWebsiteContent();
  const dashboardPath = getDashboardPath(role);

  const primaryPhone = business.phones[0] ?? '';
  const primaryEmail = business.emails[0] ?? '';
  const location = [business.city, business.country].filter(Boolean).join(', ');

  return (
    <footer className="marketing-footer border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-6 w-6 text-primary" />
              <span className="font-[family-name:var(--font-playfair)] text-xl font-bold">{business.businessName}</span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-6 text-sm leading-relaxed">
              {business.footerDescription}
            </p>
            <SocialLinksBar social={business.social} />
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {primaryPhone && <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> {primaryPhone}</li>}
              {primaryEmail && <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> {primaryEmail}</li>}
              {location && <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {location}</li>}
              {business.footerHours && <li className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" /> {business.footerHours}</li>}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">For clients</h4>
            <ul className="space-y-2.5">
              {!loading && (
                isAuthenticated ? (
                  <li>
                    <Link href={dashboardPath} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      <LayoutDashboard className="h-4 w-4" />
                      Your workspace
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      <LogIn className="h-4 w-4" />
                      Client portal login
                    </Link>
                  </li>
                )
              )}
              <li>
                <Link href="/portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  View galleries
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Packages & pricing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {business.businessName} Photography. All rights reserved.</p>
          <p>Public website · <Link href="/login" className="hover:text-foreground underline-offset-4 hover:underline">Staff & client login</Link></p>
        </div>
      </div>
    </footer>
  );
}
