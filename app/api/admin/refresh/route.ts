import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const refreshTargets = [
  { path: '/', label: 'Homepage' },
  { path: '/about', label: 'About page' },
  { path: '/services', label: 'Services page' },
  { path: '/portfolio', label: 'Portfolio/events list' },
  { path: '/pricing', label: 'Pricing page' },
  { path: '/contact', label: 'Contact page' },
  { path: '/gallery/[slug]', type: 'page' as const, label: 'Gallery pages' },
];

const allowedRefreshRoles = new Set(['admin', 'photographer']);

function getSupabaseClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (accessToken) {
      const supabase = getSupabaseClient(accessToken);
      const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

      if (userError || !userData.user) {
        return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profileError || !allowedRefreshRoles.has(profile?.role ?? '')) {
        return NextResponse.json({ error: 'Workspace access required.' }, { status: 403 });
      }
    }

    refreshTargets.forEach(({ path, type }) => revalidatePath(path, type));

    return NextResponse.json({
      ok: true,
      refreshedPaths: refreshTargets.map(({ path }) => path),
      refreshedLabels: refreshTargets.map(({ label }) => label),
      note: 'Most app data is fetched in the browser from Supabase, so this clears Next.js route caches while client-side reads continue to load fresh data directly.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'System refresh failed.' },
      { status: 500 }
    );
  }
}
