'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Re-runs the server component every few seconds (used while a payment is pending). */
export default function AutoRefresh({ intervalMs = 4000, maxTries = 60 }) {
    const router = useRouter();

    useEffect(() => {
        let tries = 0;
        const timer = setInterval(() => {
            tries += 1;
            if (tries > maxTries) {
                clearInterval(timer);
                return;
            }
            router.refresh();
        }, intervalMs);
        return () => clearInterval(timer);
    }, [router, intervalMs, maxTries]);

    return null;
}
