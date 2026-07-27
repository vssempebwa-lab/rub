import { getServerSupabase } from '@/lib/gallery-access';
import {
  defaultSiteSettings,
  type SiteCustomizationSettings,
} from '@/features/website/site-settings';

export function computeGalleryLinkExpiryDate(days: number) {
  const expiry = new Date();
  expiry.setUTCDate(expiry.getUTCDate() + days);
  expiry.setUTCHours(23, 59, 59, 999);
  return expiry.toISOString();
}

export async function getDefaultGalleryLinkExpiryDays() {
  const supabase = getServerSupabase(true);
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'site_customization')
    .maybeSingle();

  if (error) throw error;

  const settings = (data?.value ?? null) as SiteCustomizationSettings | null;
  return settings?.galleryAccess?.defaultLinkExpiryDays ?? defaultSiteSettings.galleryAccess.defaultLinkExpiryDays;
}
