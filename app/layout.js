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

export const metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'آکادمی آموزشی - آموزش متلب',
        template: '%s | آکادمی آموزشی',
    },
    description: 'بهترین آموزشگاه',
};

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

    return (
        <html lang="fa" dir="rtl" className={cn('antialiased', IranSans.variable)}>
            <head>
                {primaryColor !== DEFAULT_PRIMARY && (
                    <style id="site-theme" dangerouslySetInnerHTML={{ __html: buildThemeCss(primaryColor) }} />
                )}
            </head>
            <body className="antialiased">
                <DirectionProvider dir="rtl">
                    <ProgressProvider>{children}</ProgressProvider>
                    <Toaster richColors position="top-center" dir="rtl" />
                </DirectionProvider>
            </body>
        </html>
    );
}
