'use client';

import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AdminSiteCustomizationPanel } from '@/features/website/components/admin-site-customization-panel';

export default function AdminSystemPage() {
  const { loading, role, profile } = useAuth({ redirectTo: '/login' });

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
    <AdminSiteCustomizationPanel userId={profile?.id ?? ''} />
  );
}
