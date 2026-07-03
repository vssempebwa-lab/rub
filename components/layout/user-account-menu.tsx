'use client';

import Link from 'next/link';
import { ChevronDown, Globe, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { getDashboardPath } from '@/features/auth/utils/dashboard-path';
import type { Profile } from '@/types';

type UserAccountMenuProps = {
  profile: Profile;
  role: string | null;
  onSignOut: () => void | Promise<void>;
  onNavigate?: () => void;
};

export function UserAccountMenu({ profile, role, onSignOut, onNavigate }: UserAccountMenuProps) {
  const dashboardPath = getDashboardPath(role);
  const displayName = profile.full_name || profile.email?.split('@')[0] || 'Account';
  const initial = (profile.full_name || profile.email || 'U').charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 pl-2 pr-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initial}
          </span>
          <span className="hidden sm:inline max-w-[120px] truncate">{displayName}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <span className="font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground capitalize">{role} workspace</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardPath} onClick={onNavigate} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Open workspace
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/" onClick={onNavigate} className="cursor-pointer">
            <Globe className="mr-2 h-4 w-4" />
            Public website
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-1">
          <SignOutButton display="menu" onSignOut={onSignOut} onOpen={onNavigate} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
