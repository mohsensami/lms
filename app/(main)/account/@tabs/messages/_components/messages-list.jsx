'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Inbox, Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { deleteContactMessage, deleteReadContactMessages, setContactMessageStatus } from '@/app/actions/contact';

const formatDate = (iso) =>
    new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

const FILTERS = [
    { id: 'all', label: 'همه' },
    { id: 'new', label: 'خوانده‌نشده' },
    { id: 'read', label: 'خوانده‌شده' },
];

export default function MessagesList({ initialItems }) {
    const router = useRouter();
    const [items, setItems] = useState(initialItems);
    const [filter, setFilter] = useState('all');
    const [openId, setOpenId] = useState(null);
    const [, startTransition] = useTransition();

    const unread = items.filter((m) => m.status === 'new').length;
    const visible = useMemo(() => items.filter((m) => filter === 'all' || m.status === filter), [items, filter]);
    const selected = items.find((m) => m.id === openId) || null;

    function patch(id, changes) {
        setItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)));
    }

    async function setStatus(id, status) {
        patch(id, { status });
        const result = await setContactMessageStatus(id, status);
        if (!result.ok) {
            toast.error(result.message);
            router.refresh();
        }
    }

    function open(message) {
        setOpenId(message.id);
        if (message.status === 'new') setStatus(message.id, 'read'); // opening = reading
    }

    function remove(message) {
        if (!window.confirm('این پیام برای همیشه حذف شود؟')) return;
        startTransition(async () => {
            const result = await deleteContactMessage(message.id);
            if (result.ok) {
                setItems((prev) => prev.filter((m) => m.id !== message.id));
                setOpenId(null);
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }

    function removeRead() {
        if (!window.confirm('همه‌ی پیام‌های خوانده‌شده حذف شوند؟')) return;
        startTransition(async () => {
            const result = await deleteReadContactMessages();
            if (result.ok) {
                setItems((prev) => prev.filter((m) => m.status !== 'read'));
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setFilter(f.id)}
                            className={cn(
                                'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
                                filter === f.id
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-primary',
                            )}
                        >
                            {f.label}
                            {f.id === 'new' && unread > 0 && <span className="mr-1.5 text-xs opacity-80">{unread.toLocaleString('fa-IR')}</span>}
                        </button>
                    ))}
                </div>
                {items.some((m) => m.status === 'read') && (
                    <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={removeRead}>
                        <Trash2 className="ml-1.5 h-4 w-4" />
                        حذف همه‌ی خوانده‌شده‌ها
                    </Button>
                )}
            </div>

            {visible.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-muted-foreground">
                    <Inbox className="h-10 w-10" />
                    <p className="text-sm">{items.length === 0 ? 'هنوز پیامی دریافت نشده است.' : 'پیامی در این دسته نیست.'}</p>
                </div>
            ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    {visible.map((m) => (
                        <li key={m.id}>
                            <button
                                type="button"
                                data-keep-radius
                                onClick={() => open(m)}
                                className={cn(
                                    'flex w-full items-start gap-3 p-4 text-start transition-colors hover:bg-muted/50',
                                    m.status === 'new' && 'bg-primary/5',
                                )}
                            >
                                <span className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', m.status === 'new' ? 'bg-primary' : 'bg-transparent')} />
                                <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center justify-between gap-2">
                                        <span className={cn('truncate text-sm', m.status === 'new' ? 'font-bold text-foreground' : 'font-medium text-foreground/80')}>
                                            {m.name}
                                            <span className="mr-2 text-xs font-normal text-muted-foreground" dir="ltr">
                                                {m.email}
                                            </span>
                                        </span>
                                        <span className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
                                    </span>
                                    <span className="mt-1 block truncate text-sm font-semibold text-foreground">{m.subject}</span>
                                    <span className="mt-0.5 block truncate text-sm text-muted-foreground">{m.message}</span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog open={Boolean(selected)} onOpenChange={(next) => !next && setOpenId(null)}>
                <DialogContent className="max-w-2xl">
                    {selected && (
                        <>
                            <DialogHeader className="text-start">
                                <DialogTitle className="pe-6 leading-7">{selected.subject}</DialogTitle>
                                <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span>{selected.name}</span>
                                    <a href={`mailto:${selected.email}`} dir="ltr" className="text-primary hover:underline">
                                        {selected.email}
                                    </a>
                                    <span>{formatDate(selected.createdAt)}</span>
                                    <Badge variant={selected.status === 'new' ? 'default' : 'secondary'}>
                                        {selected.status === 'new' ? 'خوانده‌نشده' : 'خوانده‌شده'}
                                    </Badge>
                                </DialogDescription>
                            </DialogHeader>

                            {/* React escapes the text; whitespace-pre-wrap keeps the sender's line breaks */}
                            <div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-4 text-sm leading-8 text-foreground">
                                {selected.message}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button asChild>
                                    <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}>
                                        <Reply className="ml-1.5 h-4 w-4" />
                                        پاسخ با ایمیل
                                    </a>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStatus(selected.id, selected.status === 'new' ? 'read' : 'new')}
                                >
                                    {selected.status === 'new' ? <MailOpen className="ml-1.5 h-4 w-4" /> : <Mail className="ml-1.5 h-4 w-4" />}
                                    {selected.status === 'new' ? 'علامت‌گذاری به‌عنوان خوانده‌شده' : 'علامت‌گذاری به‌عنوان خوانده‌نشده'}
                                </Button>
                                <Button type="button" variant="ghost" className="text-destructive" onClick={() => remove(selected)}>
                                    <Trash2 className="ml-1.5 h-4 w-4" />
                                    حذف
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
