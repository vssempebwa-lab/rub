export const ADMIN_ACCESS_COOKIE = 'rub_admin_access_token';
export const ADMIN_REFRESH_COOKIE = 'rub_admin_refresh_token';

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export const clearedAdminCookieOptions = {
  ...adminCookieOptions,
  maxAge: 0,
};
