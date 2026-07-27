import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  adminCookieOptions,
} from '@/lib/admin-session';

type LoginAttempt = {
  failures: number;
  lockedUntil: number;
};

const attempts = new Map<string, LoginAttempt>();
const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function getSupabase(accessToken?: string, useServiceRole = false) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getClientIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function getAttemptKey(request: Request, email: string) {
  return `${getClientIp(request)}:${email.toLowerCase()}`;
}

function registerFailure(key: string) {
  const current = attempts.get(key) ?? { failures: 0, lockedUntil: 0 };
  const failures = current.failures + 1;

  attempts.set(key, {
    failures,
    lockedUntil: failures >= MAX_FAILURES ? Date.now() + LOCKOUT_MS : 0,
  });
}

async function logAdminLoginAttempt({
  request,
  email,
  success,
  userId,
  reason,
}: {
  request: Request;
  email: string;
  success: boolean;
  userId?: string;
  reason?: string;
}) {
  const payload = {
    email,
    user_id: userId ?? null,
    success,
    reason: reason ?? null,
    ip_address: getClientIp(request),
    user_agent: request.headers.get('user-agent'),
  };

  console.info('admin_login_attempt', payload);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  try {
    await getSupabase(undefined, true).from('admin_login_attempts').insert(payload);
  } catch {
    // Console logging above is the guaranteed lightweight audit trail.
  }
}

export async function POST(request: Request) {
  let email = '';

  try {
    const body = await request.json();
    email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const attemptKey = getAttemptKey(request, email);
    const attempt = attempts.get(attemptKey);

    if (!email || !password) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
    }

    if (attempt?.lockedUntil && attempt.lockedUntil > Date.now()) {
      await logAdminLoginAttempt({ request, email, success: false, reason: 'rate_limited' });
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.' },
        { status: 429 },
      );
    }

    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      registerFailure(attemptKey);
      await logAdminLoginAttempt({ request, email, success: false, reason: 'invalid_credentials' });
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await getSupabase(data.session.access_token)
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      registerFailure(attemptKey);
      await logAdminLoginAttempt({
        request,
        email,
        success: false,
        userId: data.user.id,
        reason: 'not_admin',
      });
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    attempts.delete(attemptKey);
    await logAdminLoginAttempt({ request, email, success: true, userId: data.user.id });

    const response = NextResponse.json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      redirectTo: '/dashboard/admin',
    });

    response.cookies.set(ADMIN_ACCESS_COOKIE, data.session.access_token, {
      ...adminCookieOptions,
      maxAge: data.session.expires_in,
    });
    response.cookies.set(ADMIN_REFRESH_COOKIE, data.session.refresh_token, {
      ...adminCookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    await logAdminLoginAttempt({
      request,
      email,
      success: false,
      reason: error instanceof Error ? error.message : 'unknown_error',
    });
    return NextResponse.json({ error: 'Unable to sign in.' }, { status: 500 });
  }
}
