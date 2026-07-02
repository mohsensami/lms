// import localFont from "next/font/local";
// import { Inter } from "next/font/google";
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { dbConnect } from '@/service/mongo';
import { ProgressProvider } from '@/components/providers/progress-provider';

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

export default async function RootLayout({ children }) {
    await dbConnect();

    return (
        <html lang="en">
            <body className={cn(`antialiased, poppins.className`)}>
                <ProgressProvider>{children}</ProgressProvider>
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
}
