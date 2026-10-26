'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setEmailSwitch } from '@/app/actions/settings';

/**
 * A toggle that turns one kind of e-mail on/off right where the admin works
 * (messages, comments, tickets). It writes the same setting as
 * Settings -> e-mails. `items` = [{ key, label, description, initial }].
 */
export default function EmailSwitches({ title = 'ارسال ایمیل', items }) {
    const [values, setValues] = useState(() => Object.fromEntries(items.map((i) => [i.key, Boolean(i.initial)])));
    const [busy, setBusy] = useState(null);

    async function toggle(key) {
        const next = !values[key];
        setValues((prev) => ({ ...prev, [key]: next })); // optimistic
        setBusy(key);
        try {
            const result = await setEmailSwitch(key, next);
            if (result.ok) {
                toast.success(result.message);
            } else {
                setValues((prev) => ({ ...prev, [key]: !next }));
                toast.error(result.message);
            }
        } catch {
            setValues((prev) => ({ ...prev, [key]: !next }));
            toast.error('مشکلی پیش آمد. دوباره تلاش کنید.');
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                {title}
            </p>
            <div className="divide-y divide-border">
                {items.map((item) => {
                    const on = values[item.key];
                    return (
                        <div key={item.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">{item.label}</p>
                                {item.description && <p className="mt-0.5 text-xs leading-6 text-muted-foreground">{item.description}</p>}
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={on}
                                aria-label={item.label}
                                disabled={busy === item.key}
                                onClick={() => toggle(item.key)}
                                className={cn(
                                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60',
                                    on ? 'bg-primary' : 'bg-muted-foreground/30',
                                )}
                            >
                                {busy === item.key ? (
                                    <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin text-white" />
                                ) : (
                                    <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', on ? '-translate-x-5' : '-translate-x-0.5')} />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
