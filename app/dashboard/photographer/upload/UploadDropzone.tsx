'use client';

import { useCallback } from 'react';
import { AlertCircle, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { QueuedUpload, RejectedUpload } from './types';
import { MAX_UPLOAD_SIZE_MB } from './photo-utils';

type UploadDropzoneProps = {
  queue: QueuedUpload[];
  rejectedFiles: RejectedUpload[];
  disabled?: boolean;
  uploading?: boolean;
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onClearQueue: () => void;
  onUpload: () => void;
};

export function UploadDropzone({
  queue,
  rejectedFiles,
  disabled = false,
  uploading = false,
  onFilesAdded,
  onRemoveFile,
  onClearQueue,
  onUpload,
}: UploadDropzoneProps) {
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (disabled || uploading) return;
      onFilesAdded(Array.from(event.dataTransfer.files));
    },
    [disabled, onFilesAdded, uploading]
  );

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    onFilesAdded(Array.from(event.target.files));
    event.target.value = '';
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed ${
          queue.length > 0 ? 'border-orange-500/40' : 'border-muted-foreground/20'
        } ${disabled ? 'opacity-60' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <Upload className="h-8 w-8 text-orange-700" />
          </div>
          <h3 className="mb-2 font-semibold">Drag & drop photos here</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            JPEG, PNG, HEIC, and WebP up to {MAX_UPLOAD_SIZE_MB}MB each
          </p>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/heic,image/heif,image/webp,.jpg,.jpeg,.png,.heic,.heif,.webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />
          <label htmlFor="file-input">
            <Button variant="outline" className="cursor-pointer" disabled={disabled || uploading} asChild>
              <span>Select Files</span>
            </Button>
          </label>
        </CardContent>
      </Card>

      {rejectedFiles.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4" />
            Some files were not added
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {rejectedFiles.map((file) => (
              <li key={file.id}>
                <span className="font-medium text-foreground">{file.filename}</span>: {file.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {queue.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{queue.length} file(s) ready</h3>
            <Button variant="ghost" size="sm" onClick={onClearQueue} disabled={uploading}>
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {queue.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-lg border bg-muted">
                <div className="relative aspect-square">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveFile(item.id)}
                    disabled={uploading}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-2 p-2">
                  <p className="truncate text-xs font-medium">{item.file.name}</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-background">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.status === 'error' ? 'bg-destructive' : 'bg-orange-600'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.status === 'uploading' && 'Uploading...'}
                    {item.status === 'queued' && 'Queued'}
                    {item.status === 'complete' && 'Complete'}
                    {item.status === 'error' && (item.error || 'Upload failed')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={onUpload} disabled={uploading || disabled} className="w-full bg-orange-700 hover:bg-orange-800">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload {queue.length} Photos
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
