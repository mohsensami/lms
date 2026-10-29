'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, LockKeyhole, LockKeyholeOpen, Send, ShieldCheck, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { deleteTicket, replyToTicket, setTicketPriority, setTicketStatus } from '@/app/actions/ticket';
import { PRIORITY_META, PriorityBadge, STATUS_META, StatusBadge } from './ticket-badges';

const formatDate = (iso) => new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

export default function TicketThread({ ticket, isAdmin }) {
    const router = useRouter();
    const [body, setBody] = useState('');
    const [isPending, startTransition] = useTransition();

    const closed = ticket.status === 'closed';

    function run(task, { onOk } = {}) {
        startTransition(async () => {
            const result = await task();
            if (result.ok) {
                if (result.message) toast.success(result.message);
                onOk?.();
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <div className="space-y-5">
            {/* header */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">تیکت شماره‌ی {ticket.number.toLocaleString('fa-IR')}</p>
                        <h4 className="mt-1 text-lg font-bold leading-8 text-foreground">{ticket.subject}</h4>
                        {isAdmin && ticket.user && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {ticket.user.firstName} {ticket.user.lastName}
                                <span className="mr-2 text-xs" dir="ltr">
                                    {ticket.user.email}
                                </span>
                            </p>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={ticket.priority} />
                        <StatusBadge status={ticket.status} />
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    {closed ? (
                        <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => run(() => setTicketStatus(ticket.id, 'open'))}>
                            <LockKeyholeOpen className="ml-1.5 h-4 w-4" />
                            باز کردن مجدد تیکت
                        </Button>
                    ) : (
                        <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => run(() => setTicketStatus(ticket.id, 'closed'))}>
                            <LockKeyhole className="ml-1.5 h-4 w-4" />
                            بستن تیکت
                        </Button>
                    )}

                    {isAdmin && (
                        <>
                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                اولویت:
                                <select
                                    value={ticket.priority}
                                    disabled={isPending}
                                    onChange={(e) => run(() => setTicketPriority(ticket.id, e.target.value))}
                                    className="h-9 rounded-[8px] border border-input bg-background px-2 text-sm text-foreground"
                                >
                                    {Object.entries(PRIORITY_META).map(([id, meta]) => (
                                        <option key={id} value={id}>
                                            {meta.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="me-auto text-destructive"
                                disabled={isPending}
                                onClick={() => {
                                    if (window.confirm('این تیکت و همه‌ی پیام‌هایش برای همیشه حذف شود؟')) {
                                        run(() => deleteTicket(ticket.id), { onOk: () => router.push('/account/tickets') });
                                    }
                                }}
                            >
                                <Trash2 className="ml-1.5 h-4 w-4" />
                                حذف تیکت
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* conversation */}
            <ul className="space-y-4">
                {ticket.messages.map((m) => {
                    const staff = m.isStaff;
                    // From the viewer's point of view: their own messages sit on the right (start in RTL).
                    const mine = isAdmin ? staff : !staff;
                    return (
                        <li key={m.id} className={cn('flex gap-3', mine ? 'flex-row' : 'flex-row-reverse')}>
                            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', staff ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground/70')}>
                                {staff ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </span>
                            <div className={cn('max-w-[85%] rounded-2xl border p-4', staff ? 'border-primary/20 bg-primary/5' : 'border-border bg-card')}>
                                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground">
                                        {staff ? `پشتیبانی${m.author ? ` — ${m.author.firstName} ${m.author.lastName}` : ''}` : m.author ? `${m.author.firstName} ${m.author.lastName}` : 'کاربر'}
                                    </span>
                                    <span>{formatDate(m.createdAt)}</span>
                                </div>
                                {/* React escapes the text; pre-wrap keeps the author's line breaks */}
                                <p className="whitespace-pre-wrap text-sm leading-8 text-foreground">{m.body}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* reply box */}
            {closed ? (
                <div className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                    این تیکت بسته شده است. برای ادامه‌ی گفتگو آن را دوباره باز کنید.
                </div>
            ) : (
                <form
                    className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
                    onSubmit={(event) => {
                        event.preventDefault();
                        run(() => replyToTicket(ticket.id, body), { onOk: () => setBody('') });
                    }}
                >
                    <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={isAdmin ? 'پاسخ پشتیبانی را بنویسید...' : 'پیام خود را بنویسید...'}
                        className="min-h-[120px]"
                        maxLength={5000}
                        disabled={isPending}
                    />
                    <div className="flex items-center justify-between gap-3">
                        <Button type="submit" disabled={isPending || body.trim().length < 2}>
                            {isPending ? <Loader2 className="ml-1.5 h-4 w-4 animate-spin" /> : <Send className="ml-1.5 h-4 w-4" />}
                            {isAdmin ? 'ارسال پاسخ' : 'ارسال پیام'}
                        </Button>
                        {isAdmin && <span className="text-xs text-muted-foreground">با ارسال پاسخ، وضعیت «{STATUS_META.answered.short}» می‌شود.</span>}
                    </div>
                </form>
            )}
        </div>
    );
}
