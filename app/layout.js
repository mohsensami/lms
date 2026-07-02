// import localFont from "next/font/local";
// import { Inter } from "next/font/google";
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { dbConnect } from '@/service/mongo';
import { ProgressProvider } from '@/components/providers/progress-provider';
import localFont from 'next/font/local';

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
    title: 'Easy Learning Academy - Best Online Professional Courses',
    description: 'Best Online Professional Courses',
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
    await dbConnect();

    return (
        <html lang="fa" dir="rtl" className={cn(`antialiased, ${IranSans.variable}`)}>
            <body className={cn(`antialiased, poppins.className`)}>
                <ProgressProvider>{children}</ProgressProvider>
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
}
