'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, Shield, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface Settings {
  maintenanceMode: boolean;
  defaultEventPublic: boolean;
  autoApproveBookings: boolean;
  maxUploadSizeMB: number;
}

const defaultSettings: Settings = {
  maintenanceMode: false,
  defaultEventPublic: false,
  autoApproveBookings: false,
  maxUploadSizeMB: 50,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('adminSettings');
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch {}
    }
    setLoading(false);
  }, []);

  function handleSave() {
    setSaving(true);
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage application preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label>Maintenance Mode</Label>
              <p className="text-xs text-muted-foreground">Temporarily disable public access to the site.</p>
            </div>
            <Switch checked={settings.maintenanceMode} onCheckedChange={v => setSettings({ ...settings, maintenanceMode: v })} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label>Default Event Visibility</Label>
              <p className="text-xs text-muted-foreground">New events will be public by default.</p>
            </div>
            <Switch checked={settings.defaultEventPublic} onCheckedChange={v => setSettings({ ...settings, defaultEventPublic: v })} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label>Auto-approve Bookings</Label>
              <p className="text-xs text-muted-foreground">Automatically confirm new booking requests.</p>
            </div>
            <Switch checked={settings.autoApproveBookings} onCheckedChange={v => setSettings({ ...settings, autoApproveBookings: v })} />
          </div>
          <div className="space-y-2">
            <Label>Max Upload Size (MB)</Label>
            <Input
              type="number"
              value={settings.maxUploadSizeMB}
              onChange={e => setSettings({ ...settings, maxUploadSizeMB: Math.max(1, Number(e.target.value) || 1) })}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">Maximum file size for photo uploads.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Authentication: Supabase</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Upload className="h-4 w-4" />
            <span>Storage: Supabase Storage</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>Database: PostgreSQL (Supabase)</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Settings</>}
        </Button>
      </div>
    </div>
  );
}
