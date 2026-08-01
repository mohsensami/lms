'use client';

import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toJalali, fromJalali, jalaliMonthName, jalaliDaysInMonth } from '@/lib/jalali';

/**
 * value: a JS Date (or ISO string) or null/undefined
 * onChange: (Date | null) => void
 */
export function JalaliDateTimePicker({ value, onChange, disabled }) {
    const initial = useMemo(() => (value ? toJalali(value) : null), [value]);
    const initialDate = value ? new Date(value) : null;

    const currentJalaliYear = toJalali(new Date()).year;

    const [year, setYear] = useState(initial?.year ?? currentJalaliYear);
    const [month, setMonth] = useState(initial?.month ?? 1);
    const [day, setDay] = useState(initial?.day ?? 1);
    const [time, setTime] = useState(
        initialDate
            ? `${String(initialDate.getHours()).padStart(2, '0')}:${String(initialDate.getMinutes()).padStart(2, '0')}`
            : '23:59',
    );

    const daysInMonth = jalaliDaysInMonth(year, month);
    const years = Array.from({ length: 6 }, (_, i) => currentJalaliYear + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    function commit(nextYear, nextMonth, nextDay, nextTime) {
        const [h, m] = (nextTime || '23:59').split(':').map(Number);
        const safeDay = Math.min(nextDay, jalaliDaysInMonth(nextYear, nextMonth));
        const date = fromJalali(nextYear, nextMonth, safeDay, h || 0, m || 0);
        onChange?.(date);
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Select
                disabled={disabled}
                value={String(year)}
                onValueChange={(v) => {
                    const y = Number(v);
                    setYear(y);
                    commit(y, month, day, time);
                }}
            >
                <SelectTrigger className="w-[90px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                disabled={disabled}
                value={String(month)}
                onValueChange={(v) => {
                    const m = Number(v);
                    setMonth(m);
                    commit(year, m, day, time);
                }}
            >
                <SelectTrigger className="w-[110px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {months.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                            {jalaliMonthName(m)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                disabled={disabled}
                value={String(day)}
                onValueChange={(v) => {
                    const d = Number(v);
                    setDay(d);
                    commit(year, month, d, time);
                }}
            >
                <SelectTrigger className="w-[80px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {days.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                            {d}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                type="time"
                dir="ltr"
                disabled={disabled}
                value={time}
                onChange={(e) => {
                    setTime(e.target.value);
                    commit(year, month, day, e.target.value);
                }}
                className="w-[110px]"
            />
        </div>
    );
}
