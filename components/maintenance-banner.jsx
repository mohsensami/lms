'use client';

import { useEffect, useRef } from 'react';
import { TriangleAlert } from 'lucide-react';

/**
 * Fixed alert bar shown at the very top of every page while the admin has
 * "حالت تعمیر" switched on. It publishes its real height as the CSS variable
 * --banner-h, which pushes the page (and the fixed header) down so nothing is
 * hidden behind it, even when the text wraps onto several lines.
 */
export default function MaintenanceBanner({ message }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const root = document.documentElement;
        const update = () => root.style.setProperty('--banner-h', `${el.offsetHeight}px`);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => {
            observer.disconnect();
            root.style.removeProperty('--banner-h');
        };
    }, [message]);

    return (
        <div
            ref={ref}
            role="alert"
            className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-amber-950 shadow-md"
        >
            <TriangleAlert className="h-4 w-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
}
