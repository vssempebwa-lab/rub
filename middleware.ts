import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  adminCookieOptions,
  clearedAdminCookieOptions,
} from '@/lib/admin-session';

function notFound() {
  return new NextResponse('Not Found', {
    status: 404,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

function getSupabase(accessToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
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

async function getValidAdminSession(request: NextRequest) {
  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;

  if (accessToken) {
    const { data, error } = await getSupabase(accessToken).auth.getUser(accessToken);

    if (!error && data.user) {
      return { accessToken, userId: data.user.id, refreshed: false };
    }
  }

  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const { data, error } = await getSupabase().auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) return null;

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in,
    userId: data.user.id,
    refreshed: true,
  };
}

export async function middleware(request: NextRequest) {
  try {
    const session = await getValidAdminSession(request);

    if (!session) {
      const response = notFound();
      response.cookies.set(ADMIN_ACCESS_COOKIE, '', clearedAdminCookieOptions);
      response.cookies.set(ADMIN_REFRESH_COOKIE, '', clearedAdminCookieOptions);
      return response;
    }

    const { data: profile, error } = await getSupabase(session.accessToken)
      .from('profiles')
      .select('role')
      .eq('id', session.userId)
      .single();

    if (error || profile?.role !== 'admin') {
      return notFound();
    }

    const response = NextResponse.next();
    response.headers.set('x-robots-tag', 'noindex, nofollow');

    if (session.refreshed && session.refreshToken) {
      response.cookies.set(ADMIN_ACCESS_COOKIE, session.accessToken, {
        ...adminCookieOptions,
        maxAge: session.expiresIn,
      });
      response.cookies.set(ADMIN_REFRESH_COOKIE, session.refreshToken, {
        ...adminCookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch {
    return notFound();
  }
}

export const config = {
  matcher: ['/dashboard/admin/:path*', '/api/admin/refresh/:path*'],
};
