'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createTicket } from '@/app/actions/ticket';
import { PRIORITY_META } from './ticket-badges';

const PRIORITY_HINTS = {
    low: 'سوال عمومی، نیازی به پاسخ فوری نیست',
    medium: 'مشکل یا سوالی که در یادگیری شما اختلال ایجاد می‌کند',
    high: 'مشکل جدی یا فوری (مثلاً پرداخت یا دسترسی به دوره)',
};

export default function NewTicketForm() {
    const router = useRouter();
    const [subject, setSubject] = useState('');
    const [priority, setPriority] = useState('medium');
    const [message, setMessage] = useState('');
    const [isPending, startTransition] = useTransition();

    function handleSubmit(event) {
        event.preventDefault();
        startTransition(async () => {
            const result = await createTicket({ subject, priority, message });
            if (result.ok) {
                toast.success(result.message);
                router.push(`/account/tickets/${result.id}`);
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="grid gap-2">
                <Label htmlFor="subject">موضوع</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="مثلاً: مشکل در پخش ویدیوی درس سوم" maxLength={120} required disabled={isPending} />
            </div>

            <div className="grid gap-2">
                <Label>اولویت</Label>
                <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="اولویت">
                    {Object.entries(PRIORITY_META).map(([id, meta]) => {
                        const active = priority === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                disabled={isPending}
                                onClick={() => setPriority(id)}
                                className={cn(
                                    'rounded-xl border p-3 text-start transition-colors',
                                    active ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:border-primary/40',
                                )}
                            >
                                <span className={cn('inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold', meta.className)}>{meta.label}</span>
                                <span className="mt-2 block text-xs leading-6 text-muted-foreground">{PRIORITY_HINTS[id]}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="message">شرح مشکل یا سوال</Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[180px]" placeholder="هر چه جزئیات بیشتری بنویسید، سریع‌تر پاسخ می‌گیرید..." maxLength={5000} required disabled={isPending} />
            </div>

            <Button type="submit" disabled={isPending || !subject.trim() || !message.trim()}>
                {isPending ? <Loader2 className="ml-1.5 h-4 w-4 animate-spin" /> : <Send className="ml-1.5 h-4 w-4" />}
                ثبت تیکت
            </Button>
        </form>
    );
}
