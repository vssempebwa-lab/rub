'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { CheckSquare, Download, Image as ImageIcon, Loader2, LockKeyhole, Phone, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { downloadFromResponse } from '@/lib/download-file';
import { supabase } from '@/lib/supabase';

type EventData = {
  id: string;
  name: string;
  event_date: string | null;
  location: string | null;
  description: string | null;
  cover_image_url: string | null;
  mobile_cover_image_url: string | null;
  allow_downloads: boolean;
  allow_favorites: boolean;
  allow_comments: boolean;
};

type GalleryPhoto = {
  id: string;
  url: string;
  display_url: string;
  thumbnail_display_url: string;
  filename: string | null;
};

const countryCodes = [
  { value: '+256', label: 'UG +256' },
  { value: '+254', label: 'KE +254' },
  { value: '+255', label: 'TZ +255' },
  { value: '+250', label: 'RW +250' },
  { value: '+1', label: 'US +1' },
  { value: '+44', label: 'UK +44' },
];

export default function EventAccessPage() {
  const params = useParams();
  const shareToken = params?.shareToken as string;
  const [event, setEvent] = useState<EventData | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState<'details' | 'otp' | 'gallery'>('details');
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+256');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    if (!shareToken) return;
    loadAccessState();
  }, [shareToken]);

  const visiblePhotos = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return photos;
    return photos.filter((photo) => (photo.filename || '').toLowerCase().includes(query));
  }, [photos, search]);

  async function loadAccessState() {
    setLoading(true);
    try {
      let sessionResponse = await fetch(`/api/gallery-access/session?shareToken=${shareToken}`);
      let session = await sessionResponse.json();

      if (!session.verified) {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (authSession?.access_token) {
          const staffResponse = await fetch('/api/gallery-access/staff-session', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization: `Bearer ${authSession.access_token}`,
            },
            body: JSON.stringify({ shareToken }),
            credentials: 'include',
          });

          if (staffResponse.ok) {
            sessionResponse = await fetch(`/api/gallery-access/session?shareToken=${shareToken}`, {
              credentials: 'include',
            });
            session = await sessionResponse.json();
          }
        }
      }

      if (session.verified) {
        setVerified(true);
        setEvent(session.event);
        setStep('gallery');
        await loadPhotos();
      } else {
        const eventResponse = await fetch(`/api/gallery-access/event?shareToken=${shareToken}`);
        const eventPayload = await eventResponse.json();
        if (!eventResponse.ok) throw new Error(eventPayload.error || 'Gallery not found.');
        setEvent(eventPayload.event);
      }
    } catch (error) {
      toast({
        title: 'Gallery unavailable',
        description: error instanceof Error ? error.message : 'Unable to load this event.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadPhotos() {
    const response = await fetch(`/api/gallery-access/photos?shareToken=${shareToken}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to load photos.');
    setEvent(payload.event);
    setPhotos(payload.photos || []);
  }

  async function requestOtp() {
    setSubmitting(true);
    try {
      const response = await fetch('/api/gallery-access/request-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shareToken, fullName, countryCode, phoneNumber }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to send OTP.');
      setOtpId(payload.otpId);
      setDevOtp(payload.devOtp || '');
      setStep('otp');
      toast({
        title: payload.whatsappConfigured ? 'OTP sent' : 'WhatsApp setup needed',
        description: payload.whatsappConfigured
          ? 'Check WhatsApp for your verification code.'
          : 'WhatsApp credentials/templates are not configured yet. Use the development code shown on screen.',
      });
    } catch (error) {
      toast({
        title: 'OTP not sent',
        description: error instanceof Error ? error.message : 'Please check the details and try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp() {
    setSubmitting(true);
    try {
      const response = await fetch('/api/gallery-access/verify-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shareToken, otpId, otp }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to verify OTP.');
      setVerified(true);
      setStep('gallery');
      await loadPhotos();
      toast({
        title: 'Access verified',
        description: payload.whatsappConfigured
          ? 'A welcome link was sent on WhatsApp.'
          : 'Welcome message pending WhatsApp Business setup.',
      });
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Check the OTP and try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  function toggleSelected(photoId: string) {
    const next = new Set(selectedIds);
    if (next.has(photoId)) next.delete(photoId);
    else next.add(photoId);
    setSelectedIds(next);
  }

  function toggleSelectAll() {
    if (selectedIds.size === visiblePhotos.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(visiblePhotos.map((photo) => photo.id)));
  }

  async function downloadSingle(photo: GalleryPhoto) {
    setSubmitting(true);
    try {
      const response = await fetch('/api/gallery-access/download', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shareToken, photoId: photo.id }),
      });
      await downloadFromResponse(response, photo.filename || 'rub-shoots-photo.jpg');
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function downloadZip() {
    if (!event?.allow_downloads || selectedIds.size === 0) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/gallery-access/download-zip', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shareToken, photoIds: Array.from(selectedIds) }),
      });
      await downloadFromResponse(response, `${event?.name || 'rub-gallery'}.zip`);
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
        <div className="text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Gallery unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">This event is not active for client delivery.</p>
        </div>
      </main>
    );
  }

  const bannerUrl = event.mobile_cover_image_url || event.cover_image_url || '/hero.jpg';

  return (
    <main className="min-h-screen bg-background">
      <section className="relative min-h-[360px] overflow-hidden bg-neutral-950 text-white">
        <Image src={bannerUrl} alt={event.name} fill className="object-cover opacity-70" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70" />
        <div className="relative mx-auto flex min-h-[360px] max-w-6xl flex-col justify-end px-5 pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Rub Shoots Photography</p>
          <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-6xl">{event.name}</h1>
          <p className="mt-3 text-white/80">
            {[event.event_date ? new Date(event.event_date).toLocaleDateString() : null, event.location]
              .filter(Boolean)
              .join(' - ')}
          </p>
        </div>
      </section>

      {step !== 'gallery' && (
        <section className="mx-auto max-w-md px-5 py-10">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                {step === 'details' ? <Phone className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
              </span>
              <div>
                <h2 className="text-lg font-semibold">
                  {step === 'details' ? 'Enter Your Details to Continue' : 'Enter WhatsApp OTP'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {step === 'details'
                    ? 'We will verify access before opening this private gallery.'
                    : 'The code expires 10 minutes after it is requested.'}
                </p>
              </div>
            </div>

            {step === 'details' ? (
              <div className="space-y-4">
                <Input placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Mobile number" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
                </div>
                <Button className="w-full" onClick={requestOtp} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send OTP via WhatsApp
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {devOtp && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    Development OTP: <span className="font-semibold">{devOtp}</span>
                  </div>
                )}
                <Input placeholder="6-digit OTP" value={otp} onChange={(event) => setOtp(event.target.value)} />
                <Button className="w-full" onClick={verifyOtp} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify and Open Gallery
                </Button>
                <Button variant="outline" className="w-full" onClick={requestOtp} disabled={submitting}>
                  Resend OTP
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {verified && step === 'gallery' && (
        <section className="mx-auto max-w-7xl px-5 py-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Online Gallery</h2>
              <p className="text-sm text-muted-foreground">{photos.length} photos available</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-10" placeholder="Search filename..." value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <Button variant="outline" onClick={toggleSelectAll}>
                <CheckSquare className="mr-2 h-4 w-4" />
                {selectedIds.size === visiblePhotos.length ? 'Clear All' : 'Select All'}
              </Button>
              {event.allow_downloads && (
                <Button onClick={downloadZip} disabled={selectedIds.size === 0 || submitting}>
                  <Download className="mr-2 h-4 w-4" />
                  Download ZIP
                </Button>
              )}
            </div>
          </div>

          {visiblePhotos.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              No photos match your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {visiblePhotos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <button type="button" className="h-full w-full" onClick={() => setActivePhoto(photo)}>
                    <img src={photo.thumbnail_display_url} alt={photo.filename || event.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  </button>
                  <div className="absolute left-2 top-2">
                    <Checkbox checked={selectedIds.has(photo.id)} onCheckedChange={() => toggleSelected(photo.id)} className="h-5 w-5 border-white bg-black/45 text-white" />
                  </div>
                  {event.allow_downloads && (
                    <button type="button" onClick={() => downloadSingle(photo)} className="absolute bottom-2 right-2 rounded-full bg-black/65 p-2 text-white opacity-100 transition hover:bg-black sm:opacity-0 sm:group-hover:opacity-100">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activePhoto && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 text-white">
          <div className="mb-3 flex items-center justify-between">
            <p className="truncate text-sm">{activePhoto.filename || event.name}</p>
            <button type="button" onClick={() => setActivePhoto(null)} className="rounded-md p-2 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <img src={activePhoto.display_url} alt={activePhoto.filename || event.name} className="max-h-full max-w-full object-contain" />
          </div>
        </div>
      )}
    </main>
  );
}
