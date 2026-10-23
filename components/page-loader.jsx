import { cn } from '@/lib/utils';

const MESSAGES = [
    'در حال آماده‌سازی کلاس درس شما…',
    'صفحه‌های کتاب دارند ورق می‌خورند…',
    'یادگیری یک قدم دیگر نزدیک‌تر شد ✨',
];

/**
 * Educational loading screen: an open book whose pages keep turning (right to
 * left, the way a Persian book opens), a graduation cap and a few sparks.
 *
 * Pure CSS (see ".edu-loader" in globals.css) and a server component, so it
 * paints instantly with no JavaScript and respects "reduce motion".
 */
export default function PageLoader({ fullScreen = true, className }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                'relative flex w-full items-center justify-center overflow-hidden bg-background px-6',
                fullScreen ? 'min-h-screen' : 'min-h-[60vh]',
                className,
            )}
        >
            {/* soft background glow */}
            <div className="edu-glow" aria-hidden="true" />

            <div className="edu-loader">
                <div className="edu-scene" aria-hidden="true">
                    {/* floating sparks */}
                    <span className="edu-spark edu-spark--1" />
                    <span className="edu-spark edu-spark--2" />
                    <span className="edu-spark edu-spark--3" />

                    {/* graduation cap */}
                    <svg className="edu-cap" viewBox="0 0 64 40" fill="none">
                        <path d="M32 3 3 15l29 12 29-12L32 3Z" fill="currentColor" />
                        <path
                            d="M15 22v9c0 3.5 7.6 7 17 7s17-3.5 17-7v-9L32 30 15 22Z"
                            fill="currentColor"
                            opacity=".72"
                        />
                        <path d="M58 17v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="58" cy="33" r="3" fill="currentColor" />
                    </svg>

                    {/* open book */}
                    <div className="edu-book">
                        <div className="edu-book__cover" />
                        <div className="edu-book__pages">
                            <div className="edu-book__half edu-book__half--start" />
                            <div className="edu-book__half edu-book__half--end" />
                        </div>
                        <div className="edu-book__spine" />
                        <div className="edu-page edu-page--1" />
                        <div className="edu-page edu-page--2" />
                        <div className="edu-page edu-page--3" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-foreground">لطفاً چند لحظه صبر کنید</h2>

                    <div className="edu-msgs text-sm text-muted-foreground">
                        {MESSAGES.map((message, index) => (
                            <span key={message} className={`edu-msg edu-msg--${index + 1}`}>
                                {message}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="edu-bar" aria-hidden="true" />
                <span className="sr-only">در حال بارگذاری…</span>
            </div>
        </div>
    );
}
