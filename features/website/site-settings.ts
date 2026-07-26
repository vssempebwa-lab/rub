import { supabase } from '@/lib/supabase';
import { deepMerge } from './utils/merge-content';
import type { CSSProperties } from 'react';

export const SITE_CUSTOMIZATION_KEY = 'site_customization';
const SITE_CONTENT_FALLBACK_KEY = 'settings';

function isMissingSiteSettingsTable(error: { message?: string; code?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? '';
  return error?.code === '42P01' || message.includes('site_settings');
}

export type ThemeColors = {
  primary: string;
  accent: string;
  secondary: string;
  ring: string;
};

export type BrandingSettings = {
  logoUrl: string;
  faviconUrl: string;
  headingFont: string;
  bodyFont: string;
};

export type SeoSettings = {
  siteTitle: string;
  metaDescription: string;
  openGraphImage: string;
};

export type FeatureToggles = {
  bookingInquiryForm: boolean;
  homepageTestimonials: boolean;
  publicPortfolioHighlights: boolean;
  watermarkedPreviews: boolean;
};

export type WatermarkingSettings = {
  enabled: boolean;
  text: string;
  logoUrl: string;
};

export type AdjustableImageSettings = {
  imageFit: 'cover' | 'contain';
  imagePosition:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'left top'
    | 'right top'
    | 'left bottom'
    | 'right bottom';
};

export type SiteCustomizationSettings = {
  themeColors: ThemeColors;
  branding: BrandingSettings;
  seo: SeoSettings;
  featureToggles: FeatureToggles;
  watermarking: WatermarkingSettings;
  serviceCategoryImages: Record<string, AdjustableImageSettings>;
};

export const fontOptions = [
  'Inter',
  'Playfair Display',
  'Lora',
  'Cormorant Garamond',
  'Montserrat',
  'Source Sans 3',
] as const;

export const defaultSiteSettings: SiteCustomizationSettings = {
  themeColors: {
    primary: '#a65f2d',
    accent: '#f3ede6',
    secondary: '#ebe5dd',
    ring: '#a65f2d',
  },
  branding: {
    logoUrl: '',
    faviconUrl: '',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
  },
  seo: {
    siteTitle: 'Rub Shoots Photography | Professional Photography Services',
    metaDescription:
      'Wedding, portrait, graduation, corporate, and event photography. Book your session today.',
    openGraphImage: '',
  },
  featureToggles: {
    bookingInquiryForm: true,
    homepageTestimonials: true,
    publicPortfolioHighlights: true,
    watermarkedPreviews: false,
  },
  watermarking: {
    enabled: false,
    text: 'Rub Shoots',
    logoUrl: '',
  },
  serviceCategoryImages: {},
};

export function hexToHslToken(hex: string): string | null {
  const normalized = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function themeStyleFromColors(colors: ThemeColors): CSSProperties {
  const primary = hexToHslToken(colors.primary);
  const accent = hexToHslToken(colors.accent);
  const secondary = hexToHslToken(colors.secondary);
  const ring = hexToHslToken(colors.ring);

  return {
    ...(primary ? { '--primary': primary, '--chart-1': primary } : {}),
    ...(accent ? { '--accent': accent } : {}),
    ...(secondary ? { '--secondary': secondary } : {}),
    ...(ring ? { '--ring': ring } : {}),
  } as CSSProperties;
}

export async function fetchSiteSettings(): Promise<SiteCustomizationSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', SITE_CUSTOMIZATION_KEY)
    .maybeSingle();

  if (isMissingSiteSettingsTable(error)) {
    const { data: fallbackData } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', SITE_CONTENT_FALLBACK_KEY)
      .maybeSingle();

    return deepMerge(
      defaultSiteSettings as unknown as Record<string, unknown>,
      (fallbackData?.value as Partial<Record<string, unknown>>) ?? null,
    ) as unknown as SiteCustomizationSettings;
  }

  return deepMerge(
    defaultSiteSettings as unknown as Record<string, unknown>,
    (data?.value as Partial<Record<string, unknown>>) ?? null,
  ) as unknown as SiteCustomizationSettings;
}

export async function saveSiteSettings(
  settings: SiteCustomizationSettings,
  userId?: string | null,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('site_settings').upsert(
    {
      key: SITE_CUSTOMIZATION_KEY,
      value: settings as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
      updated_by: userId ?? null,
    },
    { onConflict: 'key' },
  );

  if (!isMissingSiteSettingsTable(error)) {
    return { error: error?.message ?? null };
  }

  const { error: fallbackError } = await supabase.from('site_content').upsert(
    {
      key: SITE_CONTENT_FALLBACK_KEY,
      value: settings as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  );

  return { error: fallbackError?.message ?? null };
}
