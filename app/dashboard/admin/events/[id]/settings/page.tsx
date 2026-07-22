"use client";

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { QrCode, Copy, Share2, Eye } from 'lucide-react';

export default function EventSettingsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [permissions, setPermissions] = useState({
    allow_uploads: false,
    allow_face_scan: false,
    allow_all_photos: true,
    category_password_protection: false,
    invite_only: false,
  });
  const [accessCode, setAccessCode] = useState('••••••');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setEvent(data);
      setLoading(false);
    })();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    const { error } = await supabase.from('events').update({
      name: event.name,
      location: event.location,
      description: event.description,
      status: event.status,
    }).eq('id', id);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Saved', description: 'Event settings updated.' });
  }

  const handleCopyLink = () => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/${event?.gallery_url}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Copied', description: 'Gallery link copied to clipboard' });
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Left Sidebar - Event Info */}
      <div className="lg:col-span-1">
        <div className="rounded-lg bg-gradient-to-b from-blue-950 to-blue-900 p-6 text-white space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2">{event?.name || 'Event'}</h3>
            <Badge className="bg-orange-500 hover:bg-orange-600">Event Access</Badge>
          </div>

          <nav className="space-y-2">
            <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 font-medium text-sm">
              <span>🔐</span> Event Access
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-blue-800 font-medium text-sm">
              <span>👥</span> Team Permissions
            </button>
          </nav>

          {/* QR Code Section */}
          <div className="bg-white rounded-lg p-4 flex items-center justify-center min-h-40">
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <p className="text-xs text-gray-600">QR Code</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button className="w-full gap-2 bg-orange-500 hover:bg-orange-600">
              <QrCode className="h-4 w-4" />
              Download QR
            </Button>
            <Button variant="outline" className="w-full gap-2 border-orange-500 text-orange-500 hover:bg-orange-50" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
            <Button variant="outline" className="w-full gap-2 border-orange-500 text-orange-500 hover:bg-orange-50">
              <Share2 className="h-4 w-4" />
              Share Link
            </Button>
          </div>
        </div>
      </div>

      {/* Right Main Content - Settings */}
      <div className="lg:col-span-2">
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Access Permissions</h2>
          </div>

          {/* Permission Options */}
          <div className="space-y-4">
            {/* Anyone Can Upload */}
            <div className="flex items-start justify-between p-4 rounded-lg border bg-background/50 hover:bg-background/70 transition">
              <div className="flex gap-3 flex-1">
                <div className="mt-1 text-2xl">📤</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Anyone Can Upload</h3>
                  <p className="text-xs text-muted-foreground">Allow anyone to upload media via a shared link or QR code.</p>
                </div>
              </div>
              <Switch checked={permissions.allow_uploads} onCheckedChange={(checked) => setPermissions({ ...permissions, allow_uploads: checked })} />
            </div>

            {/* Face Scan */}
            <div className="flex items-start justify-between p-4 rounded-lg border bg-background/50 hover:bg-background/70 transition">
              <div className="flex gap-3 flex-1">
                <div className="mt-1 text-2xl">👤</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Face Scan</h3>
                  <p className="text-xs text-muted-foreground">Enable face scan to instantly find matching photos.</p>
                </div>
              </div>
              <Switch checked={permissions.allow_face_scan} onCheckedChange={(checked) => setPermissions({ ...permissions, allow_face_scan: checked })} />
            </div>

            {/* Access All Photos */}
            <div className="flex items-start justify-between p-4 rounded-lg border bg-background/50 hover:bg-background/70 transition">
              <div className="flex gap-3 flex-1">
                <div className="mt-1 text-2xl">🔓</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Access All Photos</h3>
                  <p className="text-xs text-muted-foreground">Allow guests to view all event media using an access code.</p>
                </div>
              </div>
              <Switch checked={permissions.allow_all_photos} onCheckedChange={(checked) => setPermissions({ ...permissions, allow_all_photos: checked })} />
            </div>

            {/* Access Code Display */}
            {permissions.allow_all_photos && (
              <div className="mt-2 p-4 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-orange-600" />
                    <p className="text-sm text-orange-900 font-medium">Access Code</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-mono font-bold text-orange-600">{accessCode}</code>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => {
                      navigator.clipboard.writeText(accessCode === '••••••' ? '123456' : accessCode);
                      toast({ title: 'Copied', description: 'Access code copied' });
                    }}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Category Password Protection */}
            <div className="flex items-start justify-between p-4 rounded-lg border bg-background/50 hover:bg-background/70 transition">
              <div className="flex gap-3 flex-1">
                <div className="mt-1 text-2xl">🔒</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Category Password Protection</h3>
                  <p className="text-xs text-muted-foreground">Lock specific categories and protect them with a common password.</p>
                </div>
              </div>
              <Switch checked={permissions.category_password_protection} onCheckedChange={(checked) => setPermissions({ ...permissions, category_password_protection: checked })} />
            </div>

            {/* Invite Only */}
            <div className="flex items-start justify-between p-4 rounded-lg border bg-background/50 hover:bg-background/70 transition">
              <div className="flex gap-3 flex-1">
                <div className="mt-1 text-2xl">📧</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Invite Only (Mail)</h3>
                  <p className="text-xs text-muted-foreground">Restrict access to invited guests via email only.</p>
                </div>
              </div>
              <Switch checked={permissions.invite_only} onCheckedChange={(checked) => setPermissions({ ...permissions, invite_only: checked })} />
            </div>

            {permissions.invite_only && (
              <div className="p-4 rounded-lg bg-background/50 border">
                <Input placeholder="Guest email address..." className="mb-2" />
                <Button variant="outline" className="w-full">Send Invite</Button>
              </div>
            )}
          </div>

          {/* Event Details Form */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Event Details</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Name</label>
                <Input value={event?.name || ''} onChange={e => setEvent({ ...event, name: e.target.value })} placeholder="Event name" />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input value={event?.location || ''} onChange={e => setEvent({ ...event, location: e.target.value })} placeholder="Event location" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={event?.description || ''} onChange={e => setEvent({ ...event, description: e.target.value })} placeholder="Event description" rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={event?.status || 'active'} onChange={e => setEvent({ ...event, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <Button type="submit" className="w-full">Save Event Settings</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
