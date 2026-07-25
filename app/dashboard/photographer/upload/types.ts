export type EventOption = {
  id: string;
  name: string;
  event_type: 'coverage' | 'photoshoot' | null;
  photoshoot_category: string | null;
};

export type Photo = {
  id: string;
  event_id: string;
  url: string;
  thumbnail_url: string | null;
  filename: string | null;
  file_size: number | null;
  mime_type: string | null;
  sort_order: number;
  created_at: string;
};

export type QueuedUpload = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'queued' | 'uploading' | 'complete' | 'error';
  error?: string;
};

export type RejectedUpload = {
  id: string;
  filename: string;
  reason: string;
};

export type DeleteRequest = {
  photos: Photo[];
  source: 'single' | 'bulk' | 'lightbox';
};
