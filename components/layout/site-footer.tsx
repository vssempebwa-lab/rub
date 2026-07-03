'use client';

import Link from 'next/link';
import { Camera, Phone, Mail, MapPin, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { useSession } from '@/features/auth/hooks/use-session';
import { getDashboardPath } from '@/features/auth/utils/dashboard-path';
import { NAV_LINKS } from '@/components/layout/site-header';

export function SiteFooter() {
  const { isAuthenticated, role, loading } = useSession();
  const dashboardPath = getDashboardPath(role);

  return (
    <footer className="bg-background border-t py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-6 w-6 text-primary" />
              <span className="font-[family-name:var(--font-playfair)] text-xl font-bold">Rub Shoots</span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-6">
              Professional photography services capturing life&apos;s most precious moments. Wedding, portrait, graduation, and event photography.
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><Instagram className="h-4 w-4" /></a>
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><Facebook className="h-4 w-4" /></a>
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><Twitter className="h-4 w-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" /> +233 20 123 4567</li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" /> hello@rubshoots.com</li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> Accra, Ghana</li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> Mon - Sat: 9AM - 6PM</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Rub Shoots Photography. All rights reserved.</p>
          {!loading && (
            <div className="flex gap-6 text-sm text-muted-foreground">
              {isAuthenticated ? (
                <Link href={dashboardPath} className="hover:text-foreground">Dashboard</Link>
              ) : (
                <Link href="/login" className="hover:text-foreground">Sign In</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
