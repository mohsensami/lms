import { cn } from '@/lib/utils';

export const PRIORITY_META = {
    low: { label: 'کم', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    medium: { label: 'متوسط', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    high: { label: 'زیاد', className: 'bg-red-50 text-red-700 border-red-200' },
};

export const STATUS_META = {
    open: { label: 'در انتظار پاسخ پشتیبانی', short: 'باز', className: 'bg-sky-50 text-sky-700 border-sky-200' },
    answered: { label: 'پاسخ داده شده', short: 'پاسخ داده شده', className: 'bg-violet-50 text-violet-700 border-violet-200' },
    closed: { label: 'بسته شده', short: 'بسته', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
};

const pill = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap';

export function PriorityBadge({ priority, className }) {
    const meta = PRIORITY_META[priority] || PRIORITY_META.medium;
    return <span className={cn(pill, meta.className, className)}>اولویت {meta.label}</span>;
}

export function StatusBadge({ status, className }) {
    const meta = STATUS_META[status] || STATUS_META.open;
    return <span className={cn(pill, meta.className, className)}>{meta.short}</span>;
}
