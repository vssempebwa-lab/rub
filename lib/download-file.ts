export function getFilenameFromDisposition(header: string | null, fallback: string) {
  if (!header) return fallback;
  const match = header.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  return match?.[1] ? decodeURIComponent(match[1].replace(/"/g, '')) : fallback;
}

export async function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function downloadFromResponse(response: Response, fallbackFilename: string) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Download failed.');
  }

  const blob = await response.blob();
  const filename = getFilenameFromDisposition(
    response.headers.get('content-disposition'),
    fallbackFilename,
  );
  await triggerBlobDownload(blob, filename);
}
