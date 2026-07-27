import { NextResponse } from 'next/server';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  clearedAdminCookieOptions,
} from '@/lib/admin-session';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_ACCESS_COOKIE, '', clearedAdminCookieOptions);
  response.cookies.set(ADMIN_REFRESH_COOKIE, '', clearedAdminCookieOptions);
  return response;
}
