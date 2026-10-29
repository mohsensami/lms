import Link from 'next/link';
import { Plus, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getLoggedInUser } from '@/lib/loggedin-user';
import { getSiteSettings } from '@/lib/site-settings';
import { getAllTickets, getTicketsForUser } from '@/queries/tickets';
import EmailSwitches from '../../component/email-switch';
import { PriorityBadge, STATUS_META, StatusBadge } from './_components/ticket-badges';

export const dynamic = 'force-dynamic';

const formatDate = (iso) => new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

const STATUS_FILTERS = [
    { id: 'all', label: 'همه' },
    { id: 'open', label: 'در انتظار پاسخ' },
    { id: 'answered', label: STATUS_META.answered.short },
    { id: 'closed', label: 'بسته‌شده' },
];
const PRIORITY_FILTERS = [
    { id: 'all', label: 'همه‌ی اولویت‌ها' },
    { id: 'high', label: 'زیاد' },
    { id: 'medium', label: 'متوسط' },
    { id: 'low', label: 'کم' },
];

const TicketsPage = async ({ searchParams }) => {
    const user = await getLoggedInUser();
    const isAdmin = user?.role === 'admin';
    const { status = 'all', priority = 'all' } = (await searchParams) || {};

    const [all, { email }] = await Promise.all([isAdmin ? getAllTickets() : getTicketsForUser(user.id), getSiteSettings()]);

    const counts = { open: 0, answered: 0, closed: 0 };
    all.forEach((t) => (counts[t.status] += 1));

    const tickets = all.filter((t) => (status === 'all' || t.status === status) && (priority === 'all' || t.priority === priority));

    const href = (next) => {
        const params = new URLSearchParams();
        const s = next.status ?? status;
        const p = next.priority ?? priority;
        if (s !== 'all') params.set('status', s);
        if (p !== 'all') params.set('priority', p);
        const qs = params.toString();
        return `/account/tickets${qs ? `?${qs}` : ''}`;
    };

    const chip = (active) =>
        cn(
            'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
            active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-primary',
        );

    return (
        <div className="space-y-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h4 className="text-xl font-bold text-foreground">{isAdmin ? 'تیکت‌های پشتیبانی' : 'تیکت‌های من'}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isAdmin ? 'تیکت‌های همه‌ی دانشجوها؛ تیکت‌های فوری و بی‌پاسخ بالاتر هستند.' : 'برای هر مشکل یا سوال یک تیکت ثبت کنید تا پشتیبانی پاسخ دهد.'}
                    </p>
                </div>
                {!isAdmin && (
                    <Button asChild>
                        <Link href="/account/tickets/new">
                            <Plus className="ml-1.5 h-4 w-4" />
                            تیکت جدید
                        </Link>
                    </Button>
                )}
            </div>

            {isAdmin && (
                <EmailSwitches
                    title="ایمیل تیکت‌ها"
                    items={[
                        {
                            key: 'ticketEnabled',
                            label: 'ارسال ایمیل به دانشجو (ثبت تیکت، پاسخ و بسته‌شدن)',
                            description: 'اگر خاموش باشد، پاسخ شما فقط داخل سایت دیده می‌شود.',
                            initial: email.ticketEnabled,
                        },
                        {
                            key: 'adminNotifyEnabled',
                            label: 'اعلان ایمیلی به مدیر برای تیکت و پیام جدید',
                            description: 'گیرنده را در تنظیمات ← ایمیل‌ها مشخص کنید.',
                            initial: email.adminNotifyEnabled,
                        },
                    ]}
                />
            )}

            <div className="flex flex-wrap items-center gap-2">
                {STATUS_FILTERS.map((f) => (
                    <Link key={f.id} href={href({ status: f.id })} className={chip(status === f.id)}>
                        {f.label}
                        {f.id !== 'all' && <span className="mr-1.5 text-xs opacity-75">{counts[f.id].toLocaleString('fa-IR')}</span>}
                    </Link>
                ))}
                <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
                {PRIORITY_FILTERS.map((f) => (
                    <Link key={f.id} href={href({ priority: f.id })} className={chip(priority === f.id)}>
                        {f.label}
                    </Link>
                ))}
            </div>

            {tickets.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-muted-foreground">
                    <Ticket className="h-10 w-10" />
                    <p className="text-sm">{all.length === 0 ? 'هنوز تیکتی ثبت نشده است.' : 'تیکتی با این فیلتر پیدا نشد.'}</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead className="bg-muted/50 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-start font-semibold">شماره</th>
                                <th className="px-4 py-3 text-start font-semibold">موضوع</th>
                                {isAdmin && <th className="px-4 py-3 text-start font-semibold">دانشجو</th>}
                                <th className="px-4 py-3 text-start font-semibold">اولویت</th>
                                <th className="px-4 py-3 text-start font-semibold">وضعیت</th>
                                <th className="px-4 py-3 text-start font-semibold">آخرین به‌روزرسانی</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {tickets.map((t) => (
                                <tr key={t.id} className="transition-colors hover:bg-muted/40">
                                    <td className="px-4 py-3 text-muted-foreground">#{t.number.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-3">
                                        <Link href={`/account/tickets/${t.id}`} className="font-semibold text-foreground hover:text-primary">
                                            {t.subject}
                                        </Link>
                                        <span className="mr-2 text-xs text-muted-foreground">({(t.messageCount ?? 0).toLocaleString('fa-IR')} پیام)</span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {t.user?.firstName} {t.user?.lastName}
                                        </td>
                                    )}
                                    <td className="px-4 py-3">
                                        <PriorityBadge priority={t.priority} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={t.status} />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(t.updatedAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TicketsPage;
