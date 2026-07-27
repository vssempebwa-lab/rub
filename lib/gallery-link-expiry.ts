export function isGalleryLinkExpired(expirationDate: string | null | undefined) {
  if (!expirationDate) return false;

  const end = new Date(expirationDate);
  if (Number.isNaN(end.getTime())) return false;

  if (/^\d{4}-\d{2}-\d{2}$/.test(expirationDate.trim())) {
    end.setUTCHours(23, 59, 59, 999);
  }

  return Date.now() > end.getTime();
}

export function formatGalleryExpiryDate(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
