'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, CreditCard, Loader2, PlugZap, Webhook, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { registerBaleWebhook, savePaymentGateways, testBaleConnection } from '@/app/actions/settings';

const ICONS = { zarinpal: CreditCard, bale: Wallet };

export default function PaymentSettingsForm({ gateways, savedIds, zarinpalSandbox, baleMode, baleTestToken }) {
    const [saved, setSaved] = useState(savedIds);
    const [selected, setSelected] = useState(savedIds);
    const [busy, setBusy] = useState(null);
    const [isSaving, startSaving] = useTransition();

    const dirty = selected.length !== saved.length || selected.some((id) => !saved.includes(id));

    function notify(result) {
        if (result.ok) toast.success(result.message, { duration: 7000 });
        else toast.error(result.message, { duration: 9000 });
    }

    function toggle(id) {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    function handleSave() {
        startSaving(async () => {
            const result = await savePaymentGateways(selected);
            notify(result);
            if (result.ok) setSaved(selected);
        });
    }

    async function run(name, fn) {
        setBusy(name);
        try {
            notify(await fn());
        } catch {
            toast.error('مشکلی پیش آمد. دوباره تلاش کنید.');
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                هر تعداد درگاه که می‌خواهید فعال کنید. اگر بیش از یک درگاه فعال باشد، کاربر هنگام پرداخت یکی را انتخاب می‌کند.
                فقط درگاه‌هایی که کلیدهایشان در فایل env تنظیم شده قابل فعال‌سازی هستند.
            </p>

            {gateways.map((gateway) => {
                const Icon = ICONS[gateway.id] || CreditCard;
                const checked = selected.includes(gateway.id);

                return (
                    <div
                        key={gateway.id}
                        className={cn(
                            'rounded-2xl border bg-card p-5 shadow-sm transition-colors',
                            checked ? 'border-primary ring-1 ring-primary/30' : 'border-border',
                            !gateway.configured && 'opacity-95',
                        )}
                    >
                        <label
                            className={cn('flex items-start gap-3', gateway.configured ? 'cursor-pointer' : 'cursor-not-allowed')}
                        >
                            <input
                                type="checkbox"
                                className="mt-2 h-4 w-4 accent-primary"
                                checked={checked}
                                disabled={!gateway.configured}
                                onChange={() => toggle(gateway.id)}
                            />
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Icon className="h-5 w-5" />
                            </span>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-foreground">{gateway.label}</span>
                                    {saved.includes(gateway.id) && <Badge variant="success">فعال برای کاربران</Badge>}
                                    {gateway.configured ? (
                                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            پیکربندی شده
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-amber-600">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            نیاز به تنظیم در فایل env
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{gateway.description}</p>

                                {!gateway.configured && (
                                    <div className="mt-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                                        <p className="mb-1.5">این متغیرها هنوز تنظیم نشده‌اند:</p>
                                        <div className="flex flex-wrap gap-1.5" dir="ltr">
                                            {gateway.missing.map((name) => (
                                                <code key={name} className="rounded bg-background px-1.5 py-0.5">
                                                    {name}
                                                </code>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {gateway.id === 'zarinpal' && gateway.configured && zarinpalSandbox && (
                                    <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        زرین‌پال در حالت آزمایشی (Sandbox) است و پول واقعی دریافت نمی‌شود. برای پرداخت واقعی{' '}
                                        <code dir="ltr">ZARINPAL_SANDBOX=false</code> را در env بگذارید.
                                    </p>
                                )}

                                {gateway.id === 'bale' && gateway.configured && (
                                    <div className="mt-3 space-y-3">
                                        <p className="text-xs text-muted-foreground">
                                            حالت پرداخت: <strong>{baleMode === 'link' ? 'لینک فاکتور' : 'گفتگو با بازو'}</strong>
                                            {baleTestToken && (
                                                <span className="mr-2 text-amber-700">
                                                    · توکن آزمایشی است (پول واقعی جابه‌جا نمی‌شود)
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                disabled={busy !== null}
                                                onClick={() => run('bale-test', testBaleConnection)}
                                            >
                                                {busy === 'bale-test' ? (
                                                    <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <PlugZap className="ml-1.5 h-4 w-4" />
                                                )}
                                                تست اتصال به بله
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                disabled={busy !== null}
                                                onClick={() => run('bale-hook', registerBaleWebhook)}
                                            >
                                                {busy === 'bale-hook' ? (
                                                    <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Webhook className="ml-1.5 h-4 w-4" />
                                                )}
                                                ثبت وب‌هوک در بله
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            بعد از اولین راه‌اندازی (و هر بار که دامنه یا BALE_WEBHOOK_SECRET عوض شد) یک‌بار «ثبت
                                            وب‌هوک» را بزنید؛ بدون آن بله نمی‌تواند پرداخت‌ها را به سایت اطلاع دهد.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>
                );
            })}

            <div className="flex items-center gap-3 pt-2">
                <Button type="button" onClick={handleSave} disabled={isSaving || !dirty || selected.length === 0}>
                    {isSaving && <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />}
                    ذخیره‌ی درگاه‌ها
                </Button>
                {selected.length === 0 && (
                    <p className="text-xs text-destructive">حداقل یک درگاه باید فعال باشد.</p>
                )}
            </div>
        </div>
    );
}
