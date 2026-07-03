'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart, Download, MessageSquare, X, ChevronLeft, ChevronRight,
  Grid3X3, Maximize2, Share2, Camera, Lock, Eye, Image as ImageIcon, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { MarketingPage } from '@/components/layout/marketing-page';
import { toast } from '@/hooks/use-toast';

type AccessStep = 'register' | 'otp' | 'password' | 'gallery';

interface Photo {
  id: string;
  url: string;
  thumbnail_url: string | null;
  filename: string | null;
}

interface EventData {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  location: string | null;
  allow_favorites: boolean;
  allow_downloads: boolean;
  allow_comments: boolean;
  password: string | null;
  status: string;
}

interface Comment {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
}

export default function GalleryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [accessStep, setAccessStep] = useState<AccessStep>('register');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [commentForm, setCommentForm] = useState({ author_name: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (slug) loadGallery();
  }, [slug]);

  async function loadGallery() {
    setLoading(true);
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .or(`gallery_url.eq.${slug},id.eq.${slug}`)
      .maybeSingle();

    if (eventData) {
      setEvent(eventData);
      if (!eventData.password) setAuthenticated(true);
      if (!eventData.password) setAccessStep('gallery');

      const [{ data: photosData }, { data: favData }, { data: commentsData }] = await Promise.all([
        supabase.from('photos').select('*').eq('event_id', eventData.id).order('created_at'),
        supabase.from('favorites').select('photo_id').eq('event_id', eventData.id),
        supabase.from('comments').select('*').eq('event_id', eventData.id).order('created_at', { ascending: false }),
      ]);

      if (photosData) setPhotos(photosData);
      if (favData) setFavorites(new Set(favData.map(f => f.photo_id)));
      if (commentsData) setComments(commentsData);
    }

    if (!eventData?.password) {
      setAccessStep('gallery');
    }

    setLoading(false);
  }

  function checkPassword() {
    if (event?.password && password === event.password) {
      setAuthenticated(true);
      setAccessStep('gallery');
    } else {
      toast({ title: 'Incorrect Password', description: 'Please try again.', variant: 'destructive' });
    }
  }

  async function sendOtp() {
    if (!visitorName.trim() || !visitorPhone.trim()) {
      toast({ title: 'Missing info', description: 'Enter full name and WhatsApp number.', variant: 'destructive' });
      return;
    }

    if (!event) return;

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(generatedOtp);
    setOtpSent(true);
    toast({ title: 'OTP sent', description: `Code ${generatedOtp} sent to ${visitorPhone}`, variant: 'default' });
    setAccessStep('otp');
  }

  function verifyOtp() {
    if (!enteredOtp.trim()) {
      toast({ title: 'Enter OTP', description: 'Please type the code you received.', variant: 'destructive' });
      return;
    }
    if (enteredOtp === otpCode) {
      setAccessStep('password');
      toast({ title: 'OTP verified', description: 'Now enter the event password to unlock.', variant: 'default' });
    } else {
      toast({ title: 'Invalid OTP', description: 'Please check the code and try again.', variant: 'destructive' });
    }
  }

  const visiblePhotos = photos.filter(photo => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    const filename = (photo.filename || '').toLowerCase();
    const url = (photo.url || '').toLowerCase();
    return filename.includes(query) || url.includes(query);
  });

  async function toggleFavorite(photoId: string) {
    if (!event) return;
    const newFavs = new Set(favorites);
    if (newFavs.has(photoId)) {
      newFavs.delete(photoId);
      await supabase.from('favorites').delete().eq('photo_id', photoId).eq('event_id', event.id);
    } else {
      newFavs.add(photoId);
      await supabase.from('favorites').insert([{ photo_id: photoId, event_id: event.id }]);
    }
    setFavorites(newFavs);
  }

  async function addComment() {
    if (!event || !commentForm.content.trim()) return;
    const { error } = await supabase.from('comments').insert([{
      event_id: event.id,
      photo_id: selectedPhoto !== null ? photos[selectedPhoto]?.id : null,
      author_name: commentForm.author_name || 'Anonymous',
      content: commentForm.content,
    }]);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Comment Added', description: 'Your comment has been posted.' });
      setCommentForm({ author_name: '', content: '' });
      const { data } = await supabase.from('comments').select('*').eq('event_id', event.id).order('created_at', { ascending: false });
      if (data) setComments(data);
    }
  }

  async function trackDownload(photoId: string) {
    if (!event) return;
    await supabase.from('downloads').insert([{
      photo_id: photoId,
      event_id: event.id,
    }]);
  }

  function showRegistrationStep() {
    if (event?.password && accessStep === 'register') {
      return true;
    }
    return false;
  }

  function showOtpStep() {
    return event?.password ? accessStep === 'otp' : false;
  }

  function showPasswordStep() {
    return event?.password ? accessStep === 'password' : !event?.password;
  }

  function downloadPhoto(url: string, photoId: string) {
    trackDownload(photoId);
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.target = '_blank';
    a.click();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Gallery Not Found</h2>
          <p className="text-muted-foreground">This gallery does not exist or has been removed.</p>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (event.password && !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md text-center">
          <Lock className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Private Gallery</h2>
          <p className="text-muted-foreground mb-6">This gallery requires event access before viewing photos.</p>

          {accessStep === 'register' && (
            <div className="space-y-4 text-left bg-white rounded-3xl border p-6 shadow-lg">
              <div className="space-y-2">
                <p className="text-sm font-medium">Visitor Registration</p>
                <p className="text-sm text-muted-foreground">Enter your name and WhatsApp number to request an OTP code.</p>
              </div>
              <Input placeholder="Full name" value={visitorName} onChange={e => setVisitorName(e.target.value)} />
              <Input placeholder="WhatsApp phone" value={visitorPhone} onChange={e => setVisitorPhone(e.target.value)} />
              <Button onClick={sendOtp} className="w-full">Send OTP via WhatsApp</Button>
            </div>
          )}

          {accessStep === 'otp' && (
            <div className="space-y-4 text-left bg-white rounded-3xl border p-6 shadow-lg">
              <div className="space-y-2">
                <p className="text-sm font-medium">Enter OTP Code</p>
                <p className="text-sm text-muted-foreground">We sent a one-time code to your WhatsApp number.</p>
              </div>
              <Input placeholder="Enter OTP" value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)} />
              <Button onClick={verifyOtp} className="w-full">Verify OTP</Button>
              <Button variant="outline" className="w-full" onClick={() => setAccessStep('register')}>Change Info</Button>
            </div>
          )}

          {accessStep === 'password' && (
            <div className="space-y-4 text-left bg-white rounded-3xl border p-6 shadow-lg">
              <div className="space-y-2">
                <p className="text-sm font-medium">Enter Event Password</p>
                <p className="text-sm text-muted-foreground">Use the password provided by the photographer to unlock the gallery.</p>
              </div>
              <Input type="password" placeholder="Event password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkPassword()} />
              <Button onClick={checkPassword} className="w-full">Unlock Event</Button>
            </div>
          )}

          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mt-6 inline-block">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <MarketingPage showNav={false} showFooter={false}>

      {/* Gallery Info */}
      <section className="py-8 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mb-3">{event.name}</h1>
          {event.description && <p className="text-muted-foreground max-w-2xl mx-auto mb-4">{event.description}</p>}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            {event.event_date && <span>{new Date(event.event_date).toLocaleDateString()}</span>}
            {event.location && <span>&bull; {event.location}</span>}
            <span>&bull; {photos.length} photos</span>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Client Gallery</h2>
              <p className="text-sm text-muted-foreground">Search and preview photos instantly before downloading.</p>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search photos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No photos uploaded yet.</p>
            </div>
          ) : visiblePhotos.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No photos match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {visiblePhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(index)}
                  className="relative aspect-square rounded-lg overflow-hidden group bg-muted"
                >
                  <img
                    src={photo.thumbnail_url || photo.url}
                    alt={photo.filename || ''}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedPhoto !== null && visiblePhotos[selectedPhoto] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4">
            <div className="text-white/70 text-sm">
              {selectedPhoto + 1} / {photos.length}
            </div>
            <div className="flex items-center gap-2">
              {event.allow_favorites && (
                <button
                  onClick={() => toggleFavorite(visiblePhotos[selectedPhoto].id)}
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <Heart className={`h-5 w-5 ${favorites.has(visiblePhotos[selectedPhoto].id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              )}
              {event.allow_downloads && (
                <button
                  onClick={() => downloadPhoto(visiblePhotos[selectedPhoto].url, visiblePhotos[selectedPhoto].id)}
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center relative px-4">
            <button
              onClick={() => setSelectedPhoto(prev => prev !== null && prev > 0 ? prev - 1 : prev)}
              className="absolute left-4 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30"
              disabled={selectedPhoto === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <img
              src={visiblePhotos[selectedPhoto].url}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
            <button
              onClick={() => setSelectedPhoto(prev => prev !== null && prev < visiblePhotos.length - 1 ? prev + 1 : prev)}
              className="absolute right-4 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30"
              disabled={selectedPhoto === visiblePhotos.length - 1}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Comments */}
          {event.allow_comments && (
            <div className="p-4 bg-black/50 border-t border-white/10">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <MessageSquare className="mr-2 h-4 w-4" /> Comments ({comments.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Comments</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
                    {comments.map(c => (
                      <div key={c.id} className="border-b pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{c.author_name || 'Anonymous'}</span>
                          <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm">{c.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 mt-6 pt-4 border-t">
                    <Input placeholder="Your name" value={commentForm.author_name} onChange={e => setCommentForm({ ...commentForm, author_name: e.target.value })} />
                    <Textarea placeholder="Write a comment..." value={commentForm.content} onChange={e => setCommentForm({ ...commentForm, content: e.target.value })} />
                    <Button onClick={addComment} className="w-full">Post Comment</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      )}
    </MarketingPage>
  );
}
