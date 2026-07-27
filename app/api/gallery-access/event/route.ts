import { NextResponse } from 'next/server';
import {
  findGalleryEventByShareToken,
  isGalleryLinkExpired,
} from '@/lib/gallery-access';

export async function GET(request: Request) {
  const shareToken = new URL(request.url).searchParams.get('shareToken') || '';
  if (!shareToken) return NextResponse.json({ error: 'Missing share token.' }, { status: 400 });

  const event = await findGalleryEventByShareToken(shareToken);
  if (!event) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });

  if (isGalleryLinkExpired(event.expiration_date)) {
    return NextResponse.json(
      {
        error: 'This gallery link has expired.',
        expired: true,
        expirationDate: event.expiration_date,
      },
      { status: 410 },
    );
  }

  return NextResponse.json({ event });
}
