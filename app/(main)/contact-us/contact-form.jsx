'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { sendContactMessage } from '@/app/actions/contact';

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' };

export default function ContactForm() {
    const [values, setValues] = useState(EMPTY);
    const [sent, setSent] = useState(false);
    const [isPending, startTransition] = useTransition();

    const set = (name) => (event) => setValues((prev) => ({ ...prev, [name]: event.target.value }));

    function handleSubmit(event) {
        event.preventDefault();
        startTransition(async () => {
            const result = await sendContactMessage(values);
            if (result.ok) {
                toast.success(result.message);
                setValues(EMPTY);
                setSent(true);
            } else {
                toast.error(result.message);
            }
        });
    }

    if (sent) {
        return (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
                <CheckCircle2 className="h-14 w-14 text-success" />
                <h3 className="text-lg font-bold text-foreground">پیام شما ارسال شد</h3>
                <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                    ممنون که با ما در تماس بودید. یک ایمیل تأیید برایتان فرستادیم و به‌زودی پاسخ می‌دهیم.
                </p>
                <Button type="button" variant="outline" onClick={() => setSent(false)}>
                    ارسال پیام جدید
                </Button>
            </div>
        );
    }

    return (
        <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="name">نام و نام خانوادگی</Label>
                    <Input id="name" name="name" placeholder="مثلاً علی محمدی" value={values.name} onChange={set('name')} required maxLength={80} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">ایمیل</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={values.email}
                        onChange={set('email')}
                        required
                        maxLength={120}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="subject">موضوع</Label>
                <Input id="subject" name="subject" placeholder="موضوع پیام شما" value={values.subject} onChange={set('subject')} required maxLength={120} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="message">پیام</Label>
                <Textarea
                    id="message"
                    name="message"
                    placeholder="پیام خودتون رو اینجا بنویسید..."
                    className="min-h-[140px]"
                    value={values.message}
                    onChange={set('message')}
                    required
                    maxLength={3000}
                />
            </div>

            {/* honeypot: hidden from people, filled in by bots */}
            <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={values.website}
                onChange={set('website')}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            <Button type="submit" size="lg" disabled={isPending} className="mt-2 w-full gap-2 rounded-xl font-bold shadow-lg shadow-primary/25">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isPending ? 'در حال ارسال...' : 'ارسال پیام'}
            </Button>
        </form>
    );
}
