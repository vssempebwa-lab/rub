'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Check, Copy, Link as LinkIcon, Loader2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EventSelector } from './EventSelector';
import { PhotoGrid } from './PhotoGrid';
import { PhotoLightbox } from './PhotoLightbox';
import { SelectionToolbar } from './SelectionToolbar';
import { UploadDropzone } from './UploadDropzone';
import {
  PHOTO_BUCKET,
  PHOTO_PAGE_SIZE,
  buildStoragePath,
  getPhotoStoragePath,
  validateUploadFiles,
} from './photo-utils';
import type { DeleteRequest, EventOption, Photo, QueuedUpload, RejectedUpload } from './types';

type State = {
  events: EventOption[];
  selectedEvent: string;
  queue: QueuedUpload[];
  rejectedFiles: RejectedUpload[];
  photos: Photo[];
  selectedPhotoIds: Set<string>;
  galleryLoading: boolean;
  galleryLoadingMore: boolean;
  galleryError: string | null;
  hasMorePhotos: boolean;
  photoPage: number;
  uploading: boolean;
  deleting: boolean;
};

type Action =
  | { type: 'patch'; patch: Partial<State> }
  | { type: 'selectEvent'; eventId: string }
  | { type: 'addQueue'; queue: QueuedUpload[]; rejectedFiles: RejectedUpload[] }
  | { type: 'removeQueueItem'; id: string }
  | { type: 'clearQueue' }
  | { type: 'updateQueueItem'; id: string; patch: Partial<QueuedUpload> }
  | { type: 'setPhotos'; photos: Photo[]; page: number; hasMore: boolean }
  | { type: 'appendPhotos'; photos: Photo[]; page: number; hasMore: boolean }
  | { type: 'addUploadedPhoto'; photo: Photo }
  | { type: 'toggleSelected'; photoId: string }
  | { type: 'selectAll' }
  | { type: 'deselectAll' }
  | { type: 'removePhotos'; ids: string[] };

const initialState: State = {
  events: [],
  selectedEvent: '',
  queue: [],
  rejectedFiles: [],
  photos: [],
  selectedPhotoIds: new Set(),
  galleryLoading: false,
  galleryLoadingMore: false,
  galleryError: null,
  hasMorePhotos: false,
  photoPage: 0,
  uploading: false,
  deleting: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.patch };
    case 'selectEvent':
      return {
        ...state,
        selectedEvent: action.eventId,
        photos: [],
        selectedPhotoIds: new Set(),
        galleryError: null,
        hasMorePhotos: false,
        photoPage: 0,
      };
    case 'addQueue':
      return {
        ...state,
        queue: [...state.queue, ...action.queue],
        rejectedFiles: action.rejectedFiles,
      };
    case 'removeQueueItem': {
      const item = state.queue.find((queued) => queued.id === action.id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return { ...state, queue: state.queue.filter((queued) => queued.id !== action.id) };
    }
    case 'clearQueue':
      state.queue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return { ...state, queue: [], rejectedFiles: [] };
    case 'updateQueueItem':
      return {
        ...state,
        queue: state.queue.map((item) =>
          item.id === action.id ? { ...item, ...action.patch } : item
        ),
      };
    case 'setPhotos':
      return {
        ...state,
        photos: action.photos,
        photoPage: action.page,
        hasMorePhotos: action.hasMore,
        selectedPhotoIds: new Set(),
      };
    case 'appendPhotos':
      return {
        ...state,
        photos: [...state.photos, ...action.photos],
        photoPage: action.page,
        hasMorePhotos: action.hasMore,
      };
    case 'addUploadedPhoto':
      return { ...state, photos: [action.photo, ...state.photos] };
    case 'toggleSelected': {
      const selectedPhotoIds = new Set(state.selectedPhotoIds);
      if (selectedPhotoIds.has(action.photoId)) selectedPhotoIds.delete(action.photoId);
      else selectedPhotoIds.add(action.photoId);
      return { ...state, selectedPhotoIds };
    }
    case 'selectAll':
      return { ...state, selectedPhotoIds: new Set(state.photos.map((photo) => photo.id)) };
    case 'deselectAll':
      return { ...state, selectedPhotoIds: new Set() };
    case 'removePhotos': {
      const removeIds = new Set(action.ids);
      const selectedPhotoIds = new Set(state.selectedPhotoIds);
      action.ids.forEach((id) => selectedPhotoIds.delete(id));
      return {
        ...state,
        photos: state.photos.filter((photo) => !removeIds.has(photo.id)),
        selectedPhotoIds,
      };
    }
    default:
      return state;
  }
}

export function UploadPhotosPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const queueRef = useRef<QueuedUpload[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null);

  const selectedPhotos = useMemo(
    () => state.photos.filter((photo) => state.selectedPhotoIds.has(photo.id)),
    [state.photos, state.selectedPhotoIds]
  );

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (!state.selectedEvent) return;
    loadPhotos(state.selectedEvent, 0);
  }, [state.selectedEvent]);

  useEffect(() => {
    queueRef.current = state.queue;
  }, [state.queue]);

  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  async function loadEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, event_type, photoshoot_category')
        .order('created_at', { ascending: false });
      if (error) throw error;
      dispatch({ type: 'patch', patch: { events: data ?? [] } });
    } catch (error: any) {
      toast({ title: 'Unable to load events', description: error.message, variant: 'destructive' });
    }
  }

  async function loadPhotos(eventId: string, page: number) {
    const from = page * PHOTO_PAGE_SIZE;
    const to = from + PHOTO_PAGE_SIZE - 1;
    dispatch({
      type: 'patch',
      patch: page === 0 ? { galleryLoading: true, galleryError: null } : { galleryLoadingMore: true },
    });

    try {
      const { data, error } = await supabase
        .from('photos')
        .select('id,event_id,url,thumbnail_url,filename,file_size,mime_type,sort_order,created_at')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const photos = (data ?? []) as Photo[];
      dispatch({
        type: page === 0 ? 'setPhotos' : 'appendPhotos',
        photos,
        page,
        hasMore: photos.length === PHOTO_PAGE_SIZE,
      });
    } catch (error: any) {
      dispatch({ type: 'patch', patch: { galleryError: error.message } });
    } finally {
      dispatch({ type: 'patch', patch: { galleryLoading: false, galleryLoadingMore: false } });
    }
  }

  function handleFilesAdded(files: File[]) {
    const { accepted, rejected } = validateUploadFiles(files);
    dispatch({ type: 'addQueue', queue: accepted, rejectedFiles: rejected });
  }

  async function handleUpload() {
    if (!state.selectedEvent) {
      toast({ title: 'Select Event', description: 'Please select an event first.', variant: 'destructive' });
      return;
    }

    if (state.queue.length === 0) {
      toast({ title: 'No Files', description: 'Please select at least one image.', variant: 'destructive' });
      return;
    }

    dispatch({ type: 'patch', patch: { uploading: true } });
    let completed = 0;

    try {
      for (const item of state.queue) {
        dispatch({ type: 'updateQueueItem', id: item.id, patch: { status: 'uploading', progress: 15 } });

        try {
          const storagePath = buildStoragePath(state.selectedEvent, item.file);
          const { error: uploadError } = await supabase.storage
            .from(PHOTO_BUCKET)
            .upload(storagePath, item.file, {
              upsert: false,
              contentType: item.file.type || undefined,
            });

          if (uploadError) throw uploadError;
          dispatch({ type: 'updateQueueItem', id: item.id, patch: { progress: 70 } });

          const { data: urlData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath);
          const publicUrl = urlData?.publicUrl || '';

          const { data: photo, error: insertError } = await supabase
            .from('photos')
            .insert([
              {
                event_id: state.selectedEvent,
                url: publicUrl,
                thumbnail_url: publicUrl,
                filename: item.file.name,
                file_size: item.file.size,
                mime_type: item.file.type,
              },
            ])
            .select('id,event_id,url,thumbnail_url,filename,file_size,mime_type,sort_order,created_at')
            .single();

          if (insertError) {
            await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
            throw insertError;
          }

          dispatch({ type: 'updateQueueItem', id: item.id, patch: { status: 'complete', progress: 100 } });
          dispatch({ type: 'addUploadedPhoto', photo: photo as Photo });
          completed++;
        } catch (error: any) {
          dispatch({
            type: 'updateQueueItem',
            id: item.id,
            patch: { status: 'error', progress: 100, error: error.message },
          });
        }
      }

      toast({
        title: 'Upload Complete',
        description: `${completed} of ${state.queue.length} photos uploaded.`,
      });

      if (completed === state.queue.length) dispatch({ type: 'clearQueue' });
    } catch (error: any) {
      toast({ title: 'Upload Error', description: error.message, variant: 'destructive' });
    } finally {
      dispatch({ type: 'patch', patch: { uploading: false } });
    }
  }

  function requestDelete(photos: Photo[], source: DeleteRequest['source']) {
    if (photos.length === 0) return;
    setDeleteRequest({ photos, source });
  }

  async function confirmDelete() {
    if (!deleteRequest) return;

    const photosToDelete = deleteRequest.photos;
    const ids = photosToDelete.map((photo) => photo.id);
    const storagePaths = photosToDelete.map(getPhotoStoragePath).filter(Boolean);
    const previousPhotos = state.photos;

    dispatch({ type: 'patch', patch: { deleting: true } });
    dispatch({ type: 'removePhotos', ids });

    try {
      if (storagePaths.length !== photosToDelete.length) {
        throw new Error('One or more photos are missing a storage path.');
      }

      const { error: storageError } = await supabase.storage.from(PHOTO_BUCKET).remove(storagePaths);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from('photos').delete().in('id', ids);
      if (dbError) {
        throw new Error(
          `Storage delete succeeded, but database delete failed: ${dbError.message}. The gallery rows may now point to missing storage objects.`
        );
      }

      if (lightboxPhoto && ids.includes(lightboxPhoto.id)) setLightboxPhoto(null);
      setDeleteRequest(null);
      toast({
        title: 'Photos deleted',
        description: `${photosToDelete.length} photo(s) removed from storage and the gallery.`,
      });
    } catch (error: any) {
      dispatch({ type: 'setPhotos', photos: previousPhotos, page: state.photoPage, hasMore: state.hasMorePhotos });
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } finally {
      dispatch({ type: 'patch', patch: { deleting: false } });
    }
  }

  async function activateClientDelivery() {
    if (!state.selectedEvent || state.photos.length === 0) {
      toast({
        title: 'Upload photos first',
        description: 'Choose an event with at least one uploaded photo before activating delivery.',
        variant: 'destructive',
      });
      return;
    }

    setShareLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          is_public: true,
          allow_downloads: true,
          allow_favorites: true,
          allow_comments: true,
        })
        .eq('id', state.selectedEvent)
        .select('id, gallery_url')
        .single();

      if (error) throw error;

      const slug = data?.gallery_url || data?.id;
      const fullUrl = `${window.location.origin}/gallery/${slug}`;
      setShareUrl(fullUrl);
      setShareDialogOpen(true);
      toast({
        title: 'Client delivery enabled',
        description: 'Share the gallery link or QR code with your client.',
      });
    } catch (error: any) {
      toast({ title: 'Unable to enable delivery', description: error.message, variant: 'destructive' });
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

      <EventSelector
        events={state.events}
        value={state.selectedEvent}
        onChange={(eventId) => dispatch({ type: 'selectEvent', eventId })}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={activateClientDelivery}
          disabled={!state.selectedEvent || state.photos.length === 0 || shareLoading}
          title={
            !state.selectedEvent
              ? 'Select an event first'
              : state.photos.length === 0
                ? 'Upload at least one photo before activating delivery'
                : undefined
          }
        >
          {shareLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
          Activate Client Delivery
        </Button>
        {state.selectedEvent && state.photos.length === 0 && (
          <p className="text-sm text-muted-foreground">Upload at least one photo to enable client delivery.</p>
        )}
      </div>

      <UploadDropzone
        queue={state.queue}
        rejectedFiles={state.rejectedFiles}
        disabled={!state.selectedEvent}
        uploading={state.uploading}
        onFilesAdded={handleFilesAdded}
        onRemoveFile={(id) => dispatch({ type: 'removeQueueItem', id })}
        onClearQueue={() => dispatch({ type: 'clearQueue' })}
        onUpload={handleUpload}
      />

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Uploaded Photos</h3>
            <p className="text-sm text-muted-foreground">
              Review, preview, select, and clean up photos for the selected event.
            </p>
          </div>
          {state.selectedEvent && state.photos.length > 0 && (
            <p className="text-sm text-muted-foreground">{state.photos.length} loaded</p>
          )}
        </div>

        <PhotoGrid
          selectedEventId={state.selectedEvent}
          photos={state.photos}
          selectedPhotoIds={state.selectedPhotoIds}
          loading={state.galleryLoading}
          error={state.galleryError}
          hasMore={state.hasMorePhotos}
          loadingMore={state.galleryLoadingMore}
          onLoadMore={() => loadPhotos(state.selectedEvent, state.photoPage + 1)}
          onToggleSelected={(photoId) => dispatch({ type: 'toggleSelected', photoId })}
          onPreview={(photo) => setLightboxPhoto(photo)}
          onDelete={(photo) => requestDelete([photo], 'single')}
        />
      </section>

      <SelectionToolbar
        selectedCount={state.selectedPhotoIds.size}
        totalCount={state.photos.length}
        deleting={state.deleting}
        onSelectAll={() => dispatch({ type: 'selectAll' })}
        onDeselectAll={() => dispatch({ type: 'deselectAll' })}
        onDeleteSelected={() => requestDelete(selectedPhotos, 'bulk')}
      />

      <PhotoLightbox
        photos={state.photos}
        photo={lightboxPhoto}
        open={Boolean(lightboxPhoto)}
        onOpenChange={(open) => {
          if (!open) setLightboxPhoto(null);
        }}
        onChangePhoto={setLightboxPhoto}
        onDelete={(photo) => requestDelete([photo], 'lightbox')}
      />

      <DeleteConfirmModal
        open={Boolean(deleteRequest)}
        count={deleteRequest?.photos.length ?? 0}
        deleting={state.deleting}
        onOpenChange={(open) => {
          if (!open && !state.deleting) setDeleteRequest(null);
        }}
        onConfirm={confirmDelete}
      />

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Client Delivery Ready</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <p className="text-sm text-muted-foreground">
              Clients can scan this QR code or open the link below to view and download their photos instantly.
            </p>
            <div className="flex justify-center rounded-xl border bg-white p-4">
              {shareUrl ? <QRCodeSVG value={shareUrl} size={220} level="H" /> : null}
            </div>
            <div className="break-all rounded-lg border bg-muted/40 p-3 text-sm">{shareUrl}</div>
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
    </div>
  );
}
