'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const toFa = (text) => String(text).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

export function formatClock(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hh = Math.floor(s / 3600);
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return toFa(hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`);
}

/**
 * Circular countdown. The ring empties as time runs out and changes colour:
 * brand colour -> amber (last 25%) -> red (last 10% / last minute), with a
 * soft pulse during the final seconds.
 */
export function ExamTimer({ remaining, total, size = 132, className }) {
    const stroke = 9;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const ratio = total > 0 ? Math.min(1, Math.max(0, remaining / total)) : 0;

    const critical = remaining <= 60 || ratio <= 0.1;
    const warning = !critical && ratio <= 0.25;
    const finalSeconds = remaining <= 10;

    const ringColor = critical ? 'stroke-destructive' : warning ? 'stroke-amber-500' : 'stroke-primary';
    const textColor = critical ? 'text-destructive' : warning ? 'text-amber-600' : 'text-foreground';

    return (
        <div
            role="timer"
            aria-label="زمان باقی‌مانده"
            className={cn('relative shrink-0', finalSeconds && 'animate-pulse', className)}
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    className="stroke-muted"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - ratio)}
                    className={cn('transition-[stroke-dashoffset,stroke] duration-1000 ease-linear', ringColor)}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Clock className={cn('mb-0.5 h-4 w-4 opacity-70', textColor)} />
                <span className={cn('text-2xl font-extrabold tabular-nums leading-none', textColor)} dir="ltr">
                    {formatClock(remaining)}
                </span>
                <span className="mt-1 text-[10px] text-muted-foreground">باقی‌مانده</span>
            </div>
        </div>
    );
}
