'use client';

import Link from 'next/link';
import { ArrowRight, Camera, Check, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { contactLink, currencyCode, type PricingPackage } from '@/lib/pricing-data';

type PricingCardProps = {
  packageItem: PricingPackage;
  eyebrow?: string;
  featured?: boolean;
  compact?: boolean;
};

const currencyFormatter = new Intl.NumberFormat('en-UG', {
  style: 'currency',
  currency: currencyCode,
  maximumFractionDigits: 0,
});

export function PricingCard({
  packageItem,
  eyebrow,
  featured = false,
  compact = false,
}: PricingCardProps) {
  const isExternalContactLink = contactLink.startsWith('http');

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-lg border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:-translate-y-1 focus-within:shadow-xl',
        featured
          ? 'border-orange-500 shadow-orange-950/10 ring-1 ring-orange-500/25'
          : 'border-border',
        compact ? 'p-5' : 'lg:p-7'
      )}
    >
      {featured && (
        <div className="absolute -top-3 left-6">
          <Badge className="border-orange-500 bg-orange-600 text-white shadow-sm">
            Most Popular
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
            {eyebrow}
          </p>
        )}
        <div>
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold leading-tight">
            {packageItem.name}
          </h3>
          <div className="mt-4">
            {packageItem.price === null ? (
              <p className="text-2xl font-bold text-orange-700">TODO: confirm price</p>
            ) : (
              <p className="text-3xl font-bold text-foreground">
                {currencyFormatter.format(packageItem.price)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-md border border-orange-200/70 bg-orange-50/70 p-4 text-sm text-stone-800">
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" aria-hidden="true" />
          <span>{packageItem.duration}</span>
        </div>
        <div className="flex items-start gap-2">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" aria-hidden="true" />
          <span>{packageItem.numberOfPhotographers}</span>
        </div>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {packageItem.deliverables.map((deliverable) => (
          <li key={deliverable} className="flex items-start gap-3 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" aria-hidden="true" />
            <span>{deliverable}</span>
          </li>
        ))}
      </ul>

      {packageItem.notes && (
        <p className="mt-6 rounded-md bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">
          {packageItem.notes}
        </p>
      )}

      <Button
        asChild
        className={cn(
          'mt-6 w-full bg-orange-600 text-white hover:bg-orange-700',
          featured && 'bg-red-700 hover:bg-red-800'
        )}
        variant="default"
      >
        <Link
          href={contactLink}
          target={isExternalContactLink ? '_blank' : undefined}
          rel={isExternalContactLink ? 'noreferrer' : undefined}
        >
          <Camera className="mr-2 h-4 w-4" aria-hidden="true" />
          {packageItem.ctaLabel ?? 'Book Now'}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}
