'use client';

import { useEffect } from 'react';
import { fetchSiteSettings, themeStyleFromColors } from '@/features/website/site-settings';
import type { CSSProperties } from 'react';

function setRootTheme(style: CSSProperties) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(style)) {
    root.style.setProperty(key, String(value));
  }
}

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetchSiteSettings().then((settings) => {
      setRootTheme(themeStyleFromColors(settings.themeColors));
      document.documentElement.style.setProperty(
        '--font-playfair',
        `${settings.branding.headingFont}, Georgia, "Times New Roman", serif`,
      );
      document.documentElement.style.setProperty(
        '--font-inter',
        `${settings.branding.bodyFont}, ui-sans-serif, system-ui, sans-serif`,
      );

      if (settings.branding.faviconUrl) {
        let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.rel = 'icon';
          document.head.appendChild(favicon);
        }
        favicon.href = settings.branding.faviconUrl;
      }
    });
  }, []);

  return <>{children}</>;
}
