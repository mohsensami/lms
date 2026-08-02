'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Timer } from 'lucide-react';

import { toPersianDigits } from '@/lib/utils';

function getRemaining(endsAt) {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds };
}

function Unit({ value, label }) {
    return (
        <div className="flex flex-col items-center">
            <span className="min-w-[1.75rem] rounded-md bg-destructive/10 px-1.5 py-0.5 text-center text-sm font-bold text-destructive">
                {toPersianDigits(String(value).padStart(2, '0'))}
            </span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">{label}</span>
        </div>
    );
}

export function DiscountCountdown({ endsAt, className = '' }) {
    const router = useRouter();
    const [remaining, setRemaining] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setRemaining(getRemaining(endsAt));

        if (!endsAt) return undefined;

        const interval = setInterval(() => {
            const next = getRemaining(endsAt);
            setRemaining(next);
            if (!next) {
                clearInterval(interval);
                // The discount just expired — refresh so the server
                // re-renders with the normal (non-discounted) price.
                router.refresh();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endsAt, router]);

    if (!mounted || !endsAt || !remaining) return null;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Timer className="h-3.5 w-3.5 shrink-0 text-destructive" />
            <span className="text-xs text-muted-foreground">پایان تخفیف:</span>
            <div className="flex items-center gap-1.5">
                {remaining.days > 0 && <Unit value={remaining.days} label="روز" />}
                <Unit value={remaining.hours} label="ساعت" />
                <Unit value={remaining.minutes} label="دقیقه" />
                <Unit value={remaining.seconds} label="ثانیه" />
            </div>
        </div>
    );
}
