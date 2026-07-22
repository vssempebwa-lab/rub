'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Image as ImageIcon, Check, Loader2, QrCode, Copy, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface Event {
  id: string;
  name: string;
}

export default function PhotoUploadPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('events').select('id, name').eq('photographer_id', session.user.id).order('created_at', { ascending: false });
    if (data) setEvents(data);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...dropped]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      setFiles(prev => [...prev, ...selected]);
    }
  };

  async function handleUpload() {
    if (!selectedEvent) {
      toast({ title: 'Select Event', description: 'Please select an event first.', variant: 'destructive' });
      return;
    }
    if (files.length === 0) {
      toast({ title: 'No Files', description: 'Please select at least one image.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const total = files.length;
      let completed = 0;

      for (const file of files) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${file.name.split('.').pop()}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
        const publicUrl = urlData?.publicUrl || '';

        // Create photo record
        await supabase.from('photos').insert([{
          event_id: selectedEvent,
          url: publicUrl,
          thumbnail_url: publicUrl,
          filename: file.name,
          file_size: file.size,
          mime_type: file.type,
        }]);

        completed++;
        setProgress(Math.round((completed / total) * 100));
      }

      toast({ title: 'Upload Complete', description: `${completed} of ${total} photos uploaded.` });
      setFiles([]);
      setProgress(0);
    } catch (err: any) {
      toast({ title: 'Upload Error', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function activateClientDelivery() {
    if (!selectedEvent) {
      toast({ title: 'Select Event', description: 'Choose an event before activating delivery.', variant: 'destructive' });
      return;
    }

    setShareLoading(true);
    try {
      const { data, error } = await supabase.from('events').update({
        is_public: true,
        allow_downloads: true,
        allow_favorites: true,
        allow_comments: true,
      }).eq('id', selectedEvent).select('id, gallery_url').single();

      if (error) throw error;

      const slug = data?.gallery_url || data?.id;
      const fullUrl = `${window.location.origin}/gallery/${slug}`;
      setShareUrl(fullUrl);
      setShareDialogOpen(true);
      toast({ title: 'Client delivery enabled', description: 'Share the gallery link or QR code with your client.' });
    } catch (err: any) {
      toast({ title: 'Unable to enable delivery', description: err.message, variant: 'destructive' });
    } finally {
      setShareLoading(false);
    }
  }

  async function copyShareLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Photos</h2>
        <p className="text-muted-foreground">Upload photos to your events</p>
      </div>

      <div className="max-w-xl">
        <label className="text-sm font-medium mb-1.5 block">Select Event</label>
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an event..." />
          </SelectTrigger>
          <SelectContent>
            {events.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={activateClientDelivery} disabled={!selectedEvent || shareLoading}>
          {shareLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
          Activate Client Delivery
        </Button>
      </div>

      <Card
        className={`border-2 border-dashed ${files.length > 0 ? 'border-primary/30' : 'border-muted-foreground/20'}`}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Drag & drop photos here</h3>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>Select Files</span>
            </Button>
          </label>
        </CardContent>
      </Card>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Client Delivery Ready</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">Clients can scan this QR code or open the link below to view and download their photos instantly.</p>
            <div className="flex justify-center rounded-xl border bg-white p-4">
              {shareUrl ? <QRCodeSVG value={shareUrl} size={220} level="H" /> : null}
            </div>
            <div className="rounded-lg border bg-muted/40 p-3 text-sm break-all">{shareUrl}</div>
            <div className="flex gap-2">
              <Button onClick={copyShareLink} className="flex-1">
                {copiedLink ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copiedLink ? 'Copied' : 'Copy Link'}
              </Button>
              <Button variant="outline" onClick={() => window.open(shareUrl, '_blank')}>
                <LinkIcon className="mr-2 h-4 w-4" /> Open Gallery
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{files.length} file(s) selected</h3>
            <Button variant="ghost" size="sm" onClick={() => setFiles([])}>Clear All</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {files.map((file, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          {uploading && (
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-muted-foreground text-center">{progress}% uploaded</p>
            </div>
          )}
          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="mr-2 h-4 w-4" /> Upload {files.length} Photos</>}
          </Button>
        </div>
      )}
    </div>
  );
}
