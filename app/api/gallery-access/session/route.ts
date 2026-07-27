import { NextResponse } from 'next/server';
import { GALLERY_ACCESS_COOKIE, verifyGallerySession } from '@/lib/gallery-access';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shareToken = url.searchParams.get('shareToken') || '';
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${GALLERY_ACCESS_COOKIE}=`))
    ?.split('=')[1];

  const event = await verifyGallerySession(shareToken, cookie);
  return NextResponse.json({ verified: Boolean(event), event });
}
