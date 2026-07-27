import { NextResponse } from 'next/server';
import { findPublicGalleryEvent } from '@/lib/gallery-access';

export async function GET(request: Request) {
  const shareToken = new URL(request.url).searchParams.get('shareToken') || '';
  if (!shareToken) return NextResponse.json({ error: 'Missing share token.' }, { status: 400 });

  const event = await findPublicGalleryEvent(shareToken);
  if (!event) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });

  return NextResponse.json({ event });
}
