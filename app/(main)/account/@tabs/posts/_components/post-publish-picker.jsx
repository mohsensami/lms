'use client';

import { JalaliDateTimePicker } from '@/components/jalali-datetime-picker';
import { formatJalaliDateTime } from '@/lib/jalali';
import { cn } from '@/lib/utils';

const MODES = [
    { value: 'now', label: 'انتشار فوری', hint: 'همین حالا برای همه نمایش داده می‌شود' },
    { value: 'schedule', label: 'زمان‌بندی', hint: 'در تاریخ و ساعتی که انتخاب می‌کنید منتشر می‌شود' },
    { value: 'draft', label: 'پیش‌نویس', hint: 'فقط برای شما قابل مشاهده است' },
];

const isFuture = (d) => !!d && new Date(d).getTime() > Date.now();

/** Default schedule time: the next full hour, at least 30 min from now. */
export function defaultScheduleDate() {
    const d = new Date(Date.now() + 30 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
}

/**
 * Controlled picker for the WordPress-style publish options.
 * value: { mode: 'now' | 'schedule' | 'draft', date: Date | null }
 */
export function PostPublishPicker({ value, onChange, disabled, liveSince }) {
    const { mode, date } = value;
    const isPast = mode === 'schedule' && date && new Date(date).getTime() <= Date.now();

    return (
        <div className="space-y-3">
            <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
                {MODES.map((m) => (
                    <button
                        key={m.value}
                        type="button"
                        role="radio"
                        aria-checked={mode === m.value}
                        disabled={disabled}
                        onClick={() =>
                            onChange({
                                mode: m.value,
                                date: m.value === 'schedule' ? (isFuture(date) ? date : defaultScheduleDate()) : date,
                            })
                        }
                        className={cn(
                            'rounded-md border bg-white p-3 text-start transition disabled:opacity-60',
                            mode === m.value ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/40',
                        )}
                    >
                        <span className="block text-sm font-semibold">{m.label}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{m.hint}</span>
                    </button>
                ))}
            </div>

            {mode === 'now' && liveSince && (
                <p className="text-xs text-muted-foreground">این مقاله از {formatJalaliDateTime(liveSince)} منتشر شده است.</p>
            )}

            {mode === 'schedule' && (
                <div className="space-y-2">
                    <JalaliDateTimePicker value={date} onChange={(d) => onChange({ mode, date: d })} disabled={disabled} />
                    {date && (
                        <p className="text-xs text-muted-foreground">
                            زمان انتشار: <span className="font-semibold text-foreground">{formatJalaliDateTime(date)}</span>
                            {isPast && ' — این زمان گذشته است و مقاله بلافاصله با همین تاریخ منتشر می‌شود.'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
