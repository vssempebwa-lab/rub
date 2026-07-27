import { NextResponse } from 'next/server';
import {
  GALLERY_ACCESS_COOKIE,
  GALLERY_SESSION_HOURS,
  generateAccessToken,
  getCookieOptions,
  getServerSupabase,
  hashSecret,
} from '@/lib/gallery-access';

async function sendWelcomeMessage(phoneNumber: string, eventName: string, viewUrl: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const templateName = process.env.WHATSAPP_WELCOME_TEMPLATE_NAME;

  if (!phoneNumberId || !accessToken || !templateName) {
    console.warn('WhatsApp welcome template is not configured; message not sent.', {
      phoneNumber,
      eventName,
      viewUrl,
    });
    return { configured: false };
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phoneNumber.replace('+', ''),
      type: 'template',
      template: {
        name: templateName,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: 'Rub Shoots Photography' },
              { type: 'text', text: eventName },
              { type: 'text', text: viewUrl },
            ],
          },
        ],
      },
    }),
  });

  if (!response.ok) throw new Error(`WhatsApp welcome failed: ${await response.text()}`);
  return { configured: true };
}

export async function POST(request: Request) {
  const { otpId, otp, shareToken } = await request.json();
  if (!otpId || !otp || !shareToken) {
    return NextResponse.json({ error: 'Missing verification details.' }, { status: 400 });
  }

  const supabase = getServerSupabase(true);
  const { data: row, error } = await supabase
    .from('gallery_access_otps')
    .select('id,event_id,phone_number,full_name,otp_code_hash,expires_at,verified_at,events(name,share_token,gallery_url,is_public)')
    .eq('id', otpId)
    .single();

  if (error || !row || row.verified_at) {
    return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
  }

  const event = Array.isArray(row.events) ? row.events[0] : row.events;
  if (!event?.is_public || (event.share_token && event.share_token !== shareToken && event.gallery_url !== shareToken)) {
    return NextResponse.json({ error: 'Invalid gallery access.' }, { status: 403 });
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: 'This OTP has expired. Please request a new one.' }, { status: 400 });
  }

  const expectedHash = hashSecret(`${row.event_id}:${row.phone_number}:${String(otp).trim()}`);
  if (expectedHash !== row.otp_code_hash) {
    return NextResponse.json({ error: 'Incorrect OTP code.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  await supabase.from('gallery_access_otps').update({ verified_at: now }).eq('id', row.id);

  const token = generateAccessToken();
  const expiresAt = new Date(Date.now() + GALLERY_SESSION_HOURS * 60 * 60 * 1000).toISOString();
  await supabase.from('gallery_access_sessions').insert({
    event_id: row.event_id,
    otp_id: row.id,
    access_token_hash: hashSecret(token),
    full_name: row.full_name,
    phone_number: row.phone_number,
    expires_at: expiresAt,
  });

  const origin = new URL(request.url).origin;
  const viewUrl = `${origin}/e/${shareToken}`;
  const whatsapp = await sendWelcomeMessage(row.phone_number, event.name, viewUrl);

  const response = NextResponse.json({
    ok: true,
    expiresAt,
    whatsappConfigured: whatsapp.configured,
  });
  response.cookies.set(
    GALLERY_ACCESS_COOKIE,
    token,
    getCookieOptions(GALLERY_SESSION_HOURS * 60 * 60),
  );

  return response;
}
