'use client';

import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { UpdateSystemButton } from './update-system-button';

export default function AdminDashboardPage() {
  const { loading, role } = useAuth({ redirectTo: '/admin/login' });

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Admin access required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The system update control is only available to authenticated admin users.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage live website content, colors, pricing, branding, and metadata.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-orange-700" />
            Site Customization Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Open the admin-only settings panel to update public website colors, pricing, branding, homepage content,
            business information, SEO metadata, and feature toggles.
          </p>
          <UpdateSystemButton />
        </CardContent>
      </Card>
    </div>
  );
}
