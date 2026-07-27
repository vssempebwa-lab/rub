import { NextResponse } from 'next/server';
import {
  findPublicGalleryEvent,
  generateOtp,
  hashSecret,
  normalizePhone,
  getServerSupabase,
} from '@/lib/gallery-access';

const OTP_TTL_MINUTES = 10;
const RATE_WINDOW_MINUTES = 10;
const MAX_REQUESTS = 3;

async function sendWhatsAppTemplate(phoneNumber: string, templateName: string, bodyParams: string[]) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken || !templateName) {
    console.warn('WhatsApp Business API is not configured; message not sent.', {
      phoneNumber,
      templateName,
      bodyParams,
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
            parameters: bodyParams.map((text) => ({ type: 'text', text })),
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`WhatsApp send failed: ${message}`);
  }

  return { configured: true };
}

export async function POST(request: Request) {
  const body = await request.json();
  const shareToken = String(body.shareToken ?? '');
  const fullName = String(body.fullName ?? '').trim();
  const phoneNumber = normalizePhone(
    String(body.countryCode ?? '+256'),
    String(body.phoneNumber ?? ''),
  );

  if (!shareToken || fullName.length < 2 || !phoneNumber) {
    return NextResponse.json({ error: 'Enter a valid name and WhatsApp number.' }, { status: 400 });
  }

  const event = await findPublicGalleryEvent(shareToken);
  if (!event) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });

  const supabase = getServerSupabase(true);
  const since = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from('gallery_access_otps')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('phone_number', phoneNumber)
    .gte('created_at', since);

  if (countError) throw countError;
  if ((count ?? 0) >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many OTP requests. Please wait a few minutes before trying again.' },
      { status: 429 },
    );
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('gallery_access_otps')
    .insert({
      event_id: event.id,
      phone_number: phoneNumber,
      full_name: fullName,
      otp_code_hash: hashSecret(`${event.id}:${phoneNumber}:${otp}`),
      expires_at: expiresAt,
    })
    .select('id,expires_at')
    .single();

  if (error) throw error;

  const whatsapp = await sendWhatsAppTemplate(
    phoneNumber,
    process.env.WHATSAPP_OTP_TEMPLATE_NAME || '',
    [otp, event.name, `${OTP_TTL_MINUTES}`],
  );

  return NextResponse.json({
    otpId: data.id,
    expiresAt: data.expires_at,
    whatsappConfigured: whatsapp.configured,
    devOtp: whatsapp.configured || process.env.NODE_ENV === 'production' ? undefined : otp,
  });
}
