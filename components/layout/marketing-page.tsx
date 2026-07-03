'use client';

import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

type MarketingPageProps = {
  children: React.ReactNode;
  headerFixed?: boolean;
  showNav?: boolean;
  showFooter?: boolean;
  extraActions?: React.ReactNode;
  className?: string;
};

export function MarketingPage({
  children,
  headerFixed = false,
  showNav = true,
  showFooter = true,
  extraActions,
  className,
}: MarketingPageProps) {
  return (
    <div className={`marketing-site min-h-screen flex flex-col ${className ?? ''}`}>
      <SiteHeader fixed={headerFixed} showNav={showNav} extraActions={extraActions} />
      <main className="flex-1">{children}</main>
      {showFooter && <SiteFooter />}
    </div>
  );
}
