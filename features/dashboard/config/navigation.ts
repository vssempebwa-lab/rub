import {
  LayoutDashboard,
  Image as ImageIcon,
  FolderOpen,
  MessageSquare,
  RefreshCw,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function getDashboardPageTitle(pathname: string): string {
  for (const items of Object.values(dashboardNavigation)) {
    const match = items.find((item) => item.href === pathname);
    if (match) return match.label;
  }

  const segment = pathname.split('/').pop()?.replace(/-/g, ' ');
  return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Dashboard';
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'Admin workspace',
  photographer: 'Photographer workspace',
};

export const dashboardNavigation: Record<UserRole, NavItem[]> = {
  admin: [
    { label: 'Admin Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Events', href: '/dashboard/photographer/events', icon: FolderOpen },
    { label: 'Upload Photos', href: '/dashboard/photographer/upload', icon: ImageIcon },
    { label: 'Galleries', href: '/dashboard/photographer/galleries', icon: ImageIcon },
    { label: 'Messages', href: '/dashboard/photographer/messages', icon: MessageSquare },
    { label: 'Profile', href: '/dashboard/photographer/profile', icon: UserCircle },
    { label: 'Site Customization', href: '/dashboard/admin/system', icon: RefreshCw },
  ],
  photographer: [
    { label: 'Dashboard', href: '/dashboard/photographer', icon: LayoutDashboard },
    { label: 'Events', href: '/dashboard/photographer/events', icon: FolderOpen },
    { label: 'Upload Photos', href: '/dashboard/photographer/upload', icon: ImageIcon },
    { label: 'Galleries', href: '/dashboard/photographer/galleries', icon: ImageIcon },
    { label: 'Messages', href: '/dashboard/photographer/messages', icon: MessageSquare },
    { label: 'Profile', href: '/dashboard/photographer/profile', icon: UserCircle },
  ],
};
