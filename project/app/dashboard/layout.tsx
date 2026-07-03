'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Camera, LayoutDashboard, Calendar, Image as ImageIcon, Users, Settings,
  LogOut, Menu, X, ChevronDown, Bell, Search, FolderOpen, Heart,
  Download, MessageSquare, BarChart3, CreditCard, Shield, UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    setProfile(profileData);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const role = profile?.role || 'client';

  const navItems = {
    admin: [
      { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
      { label: 'Bookings', href: '/dashboard/admin/bookings', icon: Calendar },
      { label: 'Events', href: '/dashboard/admin/events', icon: FolderOpen },
      { label: 'Gallery Manager', href: '/dashboard/admin/galleries', icon: ImageIcon },
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

  const currentNav = navItems[role as keyof typeof navItems] || navItems.client;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b">
            <Link href="/" className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary" />
              <span className="font-[family-name:var(--font-playfair)] text-lg font-bold">Rub Shoots</span>
            </Link>
            <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <div className="mb-6 px-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">{(profile?.full_name || profile?.email || 'U').charAt(0)}</span>
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{profile?.full_name || profile?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
              </div>
            </div>
            <nav className="space-y-1">
              {currentNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="p-3 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-semibold text-lg capitalize hidden sm:block">
              {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">Website</Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
