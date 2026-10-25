'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendTestEmailAction } from '@/app/actions/settings';

export default function EmailTestCard({ configured, hasFrom, defaultTo }) {
    const [to, setTo] = useState(defaultTo || '');
    const [sending, setSending] = useState(false);

    async function handleSend() {
        setSending(true);
        try {
            const result = await sendTestEmailAction(to);
            if (result.ok) toast.success(result.message, { duration: 8000 });
            else toast.error(result.message, { duration: 9000 });
        } catch {
            toast.error('مشکلی پیش آمد. دوباره تلاش کنید.');
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h5 className="font-semibold text-foreground">اتصال به Resend</h5>
            <p className="mt-1 text-sm text-muted-foreground">
                ایمیل‌ها با سرویس Resend ارسال می‌شوند. کلید و آدرس فرستنده را در فایل env بگذارید و با دکمه‌ی زیر آزمایش کنید.
            </p>

            <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                    {configured ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    <code dir="ltr">RESEND_API_KEY</code>
                    <span className={configured ? 'text-emerald-700' : 'text-amber-700'}>{configured ? 'تنظیم شده' : 'تنظیم نشده'}</span>
                </li>
                <li className="flex items-center gap-2">
                    {hasFrom ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    <code dir="ltr">EMAIL_FROM</code>
                    <span className={hasFrom ? 'text-emerald-700' : 'text-amber-700'}>
                        {hasFrom ? 'تنظیم شده' : 'تنظیم نشده (پیش‌فرض Resend فقط برای تست است)'}
                    </span>
                </li>
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-2">
                <Input
                    dir="ltr"
                    type="email"
                    placeholder="you@example.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="max-w-xs"
                    disabled={sending}
                />
                <Button type="button" onClick={handleSend} disabled={sending || !to.trim()}>
                    {sending ? <Loader2 className="ml-1.5 h-4 w-4 animate-spin" /> : <Send className="ml-1.5 h-4 w-4" />}
                    ارسال ایمیل آزمایشی
                </Button>
            </div>
        </div>
    );
}
