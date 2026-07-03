import { supabase } from '@/lib/supabase';
import { defaultSiteContent } from '../defaults';
import { deepMerge } from '../utils/merge-content';
import type { SiteContentKey, SiteContentMap, TeamMember, SiteFaq } from '../types';

export async function fetchSiteContent<K extends SiteContentKey>(key: K): Promise<SiteContentMap[K]> {
  const { data } = await supabase.from('site_content').select('value').eq('key', key).maybeSingle();
  return deepMerge(defaultSiteContent[key], (data?.value as Partial<SiteContentMap[K]>) ?? null);
}

export async function fetchAllSiteContent(): Promise<SiteContentMap> {
  const { data } = await supabase.from('site_content').select('key, value');
  const content: SiteContentMap = { ...defaultSiteContent };

  for (const row of data ?? []) {
    const key = row.key as SiteContentKey;
    if (!(key in defaultSiteContent)) continue;
    (content as Record<SiteContentKey, SiteContentMap[SiteContentKey]>)[key] = deepMerge(
      defaultSiteContent[key],
      row.value as Partial<SiteContentMap[typeof key]>,
    ) as SiteContentMap[typeof key];
  }

  return content;
}

export async function saveSiteContent<K extends SiteContentKey>(
  key: K,
  value: SiteContentMap[K],
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('site_content').upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  );

  return { error: error?.message ?? null };
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  return (data as TeamMember[]) ?? [];
}

export async function fetchAllTeamMembers(): Promise<TeamMember[]> {
  const { data } = await supabase.from('team_members').select('*').order('sort_order');
  return (data as TeamMember[]) ?? [];
}

export async function fetchSiteFaqs(page = 'pricing'): Promise<SiteFaq[]> {
  const { data } = await supabase
    .from('site_faqs')
    .select('*')
    .eq('page', page)
    .eq('is_active', true)
    .order('sort_order');

  return (data as SiteFaq[]) ?? [];
}

export async function fetchAllSiteFaqs(): Promise<SiteFaq[]> {
  const { data } = await supabase.from('site_faqs').select('*').order('sort_order');
  return (data as SiteFaq[]) ?? [];
}
