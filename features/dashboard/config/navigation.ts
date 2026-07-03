import {
  Camera,
  Globe,
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  Users,
  Settings,
  FolderOpen,
  MessageSquare,
  BarChart3,
  Heart,
  Download,
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
  client: 'Client portal',
};

export const dashboardNavigation: Record<UserRole, NavItem[]> = {
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Bookings', href: '/dashboard/admin/bookings', icon: Calendar },
    { label: 'Events', href: '/dashboard/admin/events', icon: FolderOpen },
    { label: 'Gallery Manager', href: '/dashboard/admin/galleries', icon: ImageIcon },
    { label: 'Website', href: '/dashboard/admin/website', icon: Globe },
    { label: 'Clients', href: '/dashboard/admin/clients', icon: Users },
    { label: 'Photographers', href: '/dashboard/admin/photographers', icon: Camera },
    { label: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
  photographer: [
    { label: 'Dashboard', href: '/dashboard/photographer', icon: LayoutDashboard },
    { label: 'Events', href: '/dashboard/photographer/events', icon: FolderOpen },
    { label: 'Upload Photos', href: '/dashboard/photographer/upload', icon: ImageIcon },
    { label: 'Client Galleries', href: '/dashboard/photographer/galleries', icon: ImageIcon },
    { label: 'Messages', href: '/dashboard/photographer/messages', icon: MessageSquare },
    { label: 'Profile', href: '/dashboard/photographer/profile', icon: UserCircle },
  ],
  client: [
    { label: 'Dashboard', href: '/dashboard/client', icon: LayoutDashboard },
    { label: 'My Galleries', href: '/dashboard/client/galleries', icon: ImageIcon },
    { label: 'Favorites', href: '/dashboard/client/favorites', icon: Heart },
    { label: 'Downloads', href: '/dashboard/client/downloads', icon: Download },
    { label: 'Bookings', href: '/dashboard/client/bookings', icon: Calendar },
    { label: 'Profile', href: '/dashboard/client/profile', icon: UserCircle },
  ],
};
