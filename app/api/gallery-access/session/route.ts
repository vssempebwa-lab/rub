import { NextResponse } from 'next/server';
import { resolveGalleryAccess } from '@/lib/gallery-access';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shareToken = url.searchParams.get('shareToken') || '';
  const event = await resolveGalleryAccess(request, shareToken);
  return NextResponse.json({ verified: Boolean(event), event });
}
