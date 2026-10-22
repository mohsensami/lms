'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, Loader2, PlugZap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { saveStorageProvider, testStorageConnection, applyStorageCors } from '@/app/actions/settings';

export default function StorageSettingsForm({ providers, activeProvider }) {
    const [saved, setSaved] = useState(activeProvider);
    const [selected, setSelected] = useState(activeProvider);
    const [busy, setBusy] = useState(null); // `${action}:${providerId}`
    const [isSaving, startSaving] = useTransition();

    function notify(result) {
        if (result.ok) toast.success(result.message);
        else toast.error(result.message);
    }

    function handleSave() {
        startSaving(async () => {
            const result = await saveStorageProvider(selected);
            notify(result);
            if (result.ok) setSaved(selected);
        });
    }

    async function run(action, providerId, fn) {
        setBusy(`${action}:${providerId}`);
        try {
            notify(await fn(providerId));
        } catch {
            toast.error('مشکلی پیش آمد. دوباره تلاش کنید.');
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="space-y-4">
            {providers.map((provider) => {
                const isSelected = selected === provider.id;
                const isActive = saved === provider.id;

                return (
                    <div
                        key={provider.id}
                        className={cn(
                            'rounded-2xl border bg-card p-5 shadow-sm transition-colors',
                            isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border',
                        )}
                    >
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="radio"
                                name="storage-provider"
                                className="mt-1.5 h-4 w-4 accent-primary"
                                checked={isSelected}
                                onChange={() => setSelected(provider.id)}
                            />
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-foreground">{provider.label}</span>
                                    {isActive && <Badge variant="success">فعال</Badge>}
                                    {provider.configured ? (
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
                                <p className="mt-1 text-sm text-muted-foreground">{provider.description}</p>

                                {!provider.configured && (
                                    <div className="mt-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                                        <p className="mb-1.5">این متغیرها هنوز تنظیم نشده‌اند:</p>
                                        <div className="flex flex-wrap gap-1.5" dir="ltr">
                                            {provider.missing.map((name) => (
                                                <code key={name} className="rounded bg-background px-1.5 py-0.5">
                                                    {name}
                                                </code>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </label>

                        {provider.configured && (
                            <div className="mt-4 flex flex-wrap gap-2 pr-7">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={busy !== null}
                                    onClick={() => run('test', provider.id, testStorageConnection)}
                                >
                                    {busy === `test:${provider.id}` ? (
                                        <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />
                                    ) : (
                                        <PlugZap className="ml-1.5 h-4 w-4" />
                                    )}
                                    تست اتصال
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={busy !== null}
                                    onClick={() => run('cors', provider.id, applyStorageCors)}
                                >
                                    {busy === `cors:${provider.id}` ? (
                                        <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="ml-1.5 h-4 w-4" />
                                    )}
                                    اعمال تنظیمات CORS
                                </Button>
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="flex items-center gap-3 pt-2">
                <Button type="button" onClick={handleSave} disabled={isSaving || selected === saved}>
                    {isSaving && <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />}
                    ذخیره‌ی تنظیمات
                </Button>
                <p className="text-xs text-muted-foreground">
                    قبل از اولین آپلود، یک‌بار «اعمال تنظیمات CORS» را بزنید تا مرورگر اجازه‌ی آپلود مستقیم داشته باشد.
                </p>
            </div>
        </div>
    );
}
