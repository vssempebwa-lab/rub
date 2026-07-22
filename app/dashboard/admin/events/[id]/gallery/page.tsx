"use client";

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Upload, ArrowLeft, Image as ImageIcon, Check } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EventGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (eventError) {
        toast({ title: 'Error', description: eventError.message, variant: 'destructive' });
        return;
      }

      setEvent(eventData);

      // Fetch photos
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      if (!photosError && photosData) {
        setPhotos(photosData);
      }

      setLoading(false);
    })();
  }, [id]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !event) return;

    setUploading(true);
    const files = Array.from(e.target.files);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const file of files) {
        try {
          const ext = file.name.split('.').pop() || 'jpg';
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8);
          const fileName = `${event.id}/${timestamp}-${random}.${ext}`;

          console.log('Uploading file:', fileName);

          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('event-media')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            toast({ 
              title: 'Upload Error', 
              description: `${file.name}: ${uploadError.message}`, 
              variant: 'destructive' 
            });
            errorCount++;
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('event-media')
            .getPublicUrl(fileName);

          console.log('Public URL:', publicUrl);

          // Save to database
          const { data: dbData, error: dbError } = await supabase.from('photos').insert([{
            event_id: event.id,
            url: publicUrl,
          }]);

          if (dbError) {
            console.error('Database error:', dbError);
            toast({ 
              title: 'Database Error', 
              description: `${file.name}: ${dbError.message}`, 
              variant: 'destructive' 
            });
            errorCount++;
            continue;
          }

          successCount++;
          console.log('Successfully uploaded:', file.name);
        } catch (fileError: any) {
          console.error('File upload error:', fileError);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({ 
          title: 'Success', 
          description: `${successCount} photo(s) uploaded successfully` 
        });
      }

      if (errorCount > 0) {
        toast({ 
          title: 'Errors', 
          description: `${errorCount} file(s) failed to upload`, 
          variant: 'destructive' 
        });
      }
      
      // Refresh photos
      const { data: refreshedPhotos, error: refreshError } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      if (refreshError) {
        console.error('Refresh error:', refreshError);
      } else if (refreshedPhotos) {
        setPhotos(refreshedPhotos);
      }
    } catch (error: any) {
      console.error('General upload error:', error);
      toast({ 
        title: 'Error', 
        description: error?.message || 'Upload failed', 
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-1.5 hover:bg-muted rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">{event?.name}</h1>
                <p className="text-sm text-muted-foreground">{photos.length} Photos</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
              <label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Button asChild disabled={uploading} className="gap-2 cursor-pointer">
                  <span>
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Media'}
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all-media" className="w-full">
            <TabsList>
              <TabsTrigger value="all-media">All Media</TabsTrigger>
              <TabsTrigger value="upload-requests">Upload Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="all-media" className="mt-6">
              {photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="mb-4 p-4 rounded-full bg-blue-50">
                    <ImageIcon className="h-12 w-12 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Your event is waiting for its first story.
                  </h2>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Upload memories from your event to start organizing your collection.
                  </p>
                  <label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <Button asChild disabled={uploading} size="lg" className="gap-2 cursor-pointer">
                      <span>
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Start Uploading'}
                      </span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group cursor-pointer rounded-lg overflow-hidden bg-muted aspect-square"
                      onClick={() => togglePhotoSelection(photo.id)}
                    >
                      {photo.url && (
                        <Image
                          src={photo.url}
                          alt="Photo"
                          fill
                          className="object-cover group-hover:opacity-75 transition-opacity"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      
                      {selectedPhotos.has(photo.id) && (
                        <div className="absolute inset-0 bg-blue-600/50 flex items-center justify-center">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                      )}

                      <button
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePhotoSelection(photo.id);
                        }}
                      >
                        <Check className="h-4 w-4 text-gray-900" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload-requests" className="mt-6">
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 p-4 rounded-full bg-gray-50">
                  <Upload className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  No upload requests yet
                </h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Guests haven't requested photos yet. Share the event link to start receiving uploads.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
