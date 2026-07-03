'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import type { SocialLinks } from '@/features/website/types';

type SocialLinksBarProps = {
  social: SocialLinks;
  className?: string;
  iconClassName?: string;
};

export function SocialLinksBar({ social, className = '', iconClassName = 'h-4 w-4' }: SocialLinksBarProps) {
  const links = [
    { key: 'instagram' as const, icon: Instagram, label: 'Instagram' },
    { key: 'facebook' as const, icon: Facebook, label: 'Facebook' },
    { key: 'twitter' as const, icon: Twitter, label: 'Twitter' },
  ].filter((item) => social[item.key]);

  if (links.length === 0) return null;

  return (
    <div className={`flex gap-3 ${className}`}>
      {links.map(({ key, icon: Icon, label }) => (
        <a
          key={key}
          href={social[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="h-9 w-9 rounded-full bg-background border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Icon className={iconClassName} />
        </a>
      ))}
    </div>
  );
}
