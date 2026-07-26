import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { SiteThemeProvider } from '@/features/website/components/site-theme-provider';
import { fetchSiteSettings } from '@/features/website/site-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const images = settings.seo.openGraphImage ? [settings.seo.openGraphImage] : undefined;

  return {
    title: settings.seo.siteTitle,
    description: settings.seo.metaDescription,
    openGraph: {
      title: settings.seo.siteTitle,
      description: settings.seo.metaDescription,
      images,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <SiteThemeProvider>{children}</SiteThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
