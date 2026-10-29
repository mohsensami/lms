import MainNav from '@/components/main-nav';
import SiteFooter from '@/components/site-footer';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { getSiteSettings } from '@/lib/site-settings';

const MainLayout = async ({ children }) => {
    // Menu, logo and name come from Settings -> site info.
    const { general, header } = await getSiteSettings();
    const navLinks = header.links;

    return (
        <div className="flex min-h-screen flex-col">
            <header className="z-40 bg-background/70 backdrop-blur-md fixed top-[var(--banner-h,0px)] left-0 right-0 border-b border-border shadow-sm">
                <SessionProvider>
                    <div className="container flex h-20 items-center justify-between py-6">
                        <MainNav items={navLinks} logoUrl={general.logoUrl} siteName={general.name} />
                    </div>
                </SessionProvider>
            </header>

            <main className="flex-1 pt-20 flex flex-col"> {children} </main>
            <SiteFooter />
        </div>
    );
};

export default MainLayout;
