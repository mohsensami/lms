// import localFont from "next/font/local";
// import { Inter } from "next/font/google";
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { ProgressProvider } from '@/components/providers/progress-provider';
import { DirectionProvider } from '@/components/providers/direction-provider';
import localFont from 'next/font/local';
import { SITE_URL } from '@/lib/seo';
import { getPrimaryColor } from '@/lib/site-theme';
import { getSiteSettings } from '@/lib/site-settings';
import { getSiteStatus } from '@/lib/site-status';
import MaintenanceBanner from '@/components/maintenance-banner';
import { buildThemeCss, DEFAULT_PRIMARY } from '@/lib/theme';

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// Name, description, icon and share image come from Settings -> site info.
export async function generateMetadata() {
    const { general } = await getSiteSettings();
    const defaultTitle = general.tagline ? `${general.name} - ${general.tagline}` : general.name;

    return {
        metadataBase: new URL(SITE_URL),
        applicationName: general.name,
        title: {
            default: defaultTitle,
            template: `%s | ${general.name}`,
        },
        description: general.description,
        ...(general.keywords ? { keywords: general.keywords.split(/[,،]/).map((k) => k.trim()).filter(Boolean) } : {}),
        icons: { icon: general.faviconUrl || '/favicon.ico', apple: general.faviconUrl || undefined },
        openGraph: {
            siteName: general.name,
            title: defaultTitle,
            description: general.description,
            type: 'website',
            locale: 'fa_IR',
            ...(general.ogImageUrl ? { images: [{ url: general.ogImageUrl }] } : {}),
        },
        twitter: {
            card: general.ogImageUrl ? 'summary_large_image' : 'summary',
            ...(general.ogImageUrl ? { images: [general.ogImageUrl] } : {}),
        },
    };
}

// const poppins = Inter({ subsets: ["latin"], variable: "--font-poppins" });

const IranSans = localFont({
    src: [
        {
            path: '../public/fonts/IranSansX/Woff2/IRANSansXFaNum-Light.woff2',
            // path: '../../public/fonts/IranSansX/Woff2/IRANSansXFaNum-Medium.woff2',
            weight: '300',
            style: 'normal',
        },
        {
            path: '../public/fonts/IranSansX/Woff2/IRANSansXFaNum-Regular.woff2',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../public/fonts/IranSansX/Woff2/IRANSansXFaNum-Bold.woff2',
            weight: '700',
            style: 'normal',
        },
    ],
    variable: '--font-sans',
    display: 'swap',
});

export default async function RootLayout({ children }) {
    // Brand colour chosen by the admin (Settings -> Appearance). Injected as
    // CSS variables so every component that uses the `primary` token follows it.
    const primaryColor = await getPrimaryColor();
    const { maintenance } = await getSiteStatus();

    return (
        <html lang="fa" dir="rtl" className={cn('antialiased', IranSans.variable)}>
            <head>
                {primaryColor !== DEFAULT_PRIMARY && (
                    <style id="site-theme" dangerouslySetInnerHTML={{ __html: buildThemeCss(primaryColor) }} />
                )}
                {/* Reserve room for the fixed maintenance bar before it measures itself (avoids a jump). */}
                {maintenance.enabled && <style id="maintenance-offset" dangerouslySetInnerHTML={{ __html: ':root{--banner-h:2.5rem}' }} />}
            </head>
            <body className="antialiased" style={{ paddingTop: 'var(--banner-h, 0px)' }}>
                {maintenance.enabled && <MaintenanceBanner message={maintenance.message} />}
                <DirectionProvider dir="rtl">
                    <ProgressProvider>{children}</ProgressProvider>
                    <Toaster richColors position="top-center" dir="rtl" />
                </DirectionProvider>
            </body>
        </html>
    );
}
