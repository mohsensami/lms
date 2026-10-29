'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DEFAULT_PRIMARY, THEME_PRESETS, buildThemeVars, normalizeHex } from '@/lib/theme';
import { resetThemeColor, saveThemeColor } from '@/app/actions/settings';

const PREVIEW_ID = 'theme-live-preview';

/** Applies the colour to the whole page immediately (preview only, not saved). */
function applyPreview(hex) {
    const { light, dark } = buildThemeVars(hex);
    let style = document.getElementById(PREVIEW_ID);
    if (!style) {
        style = document.createElement('style');
        style.id = PREVIEW_ID;
        document.head.appendChild(style);
    }
    const toCss = (vars) =>
        Object.entries(vars)
            .map(([k, v]) => `${k}:${v}`)
            .join(';');
    style.textContent = `:root{${toCss(light)}}.dark{${toCss(dark)}}`;
}

function clearPreview() {
    document.getElementById(PREVIEW_ID)?.remove();
}

export default function ThemeSettingsForm({ savedColor }) {
    const router = useRouter();
    const [saved, setSaved] = useState(savedColor);
    const [color, setColor] = useState(savedColor);
    const [text, setText] = useState(savedColor);
    const [isSaving, startSaving] = useTransition();
    const [isResetting, startResetting] = useTransition();

    const valid = useMemo(() => normalizeHex(color), [color]);
    const dirty = valid && valid !== saved;

    // Live preview while picking; revert when leaving the page unsaved.
    useEffect(() => {
        if (valid && valid !== saved) applyPreview(valid);
        else clearPreview();
    }, [valid, saved]);
    useEffect(() => clearPreview, []);

    function pick(next) {
        const hex = normalizeHex(next);
        if (hex) {
            setColor(hex);
            setText(hex);
        }
    }

    function handleText(event) {
        const value = event.target.value;
        setText(value);
        const hex = normalizeHex(value);
        if (hex) setColor(hex);
    }

    function handleSave() {
        startSaving(async () => {
            const result = await saveThemeColor(color);
            if (result.ok) {
                toast.success(result.message);
                clearPreview();
                setSaved(result.color);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    }

    function handleReset() {
        startResetting(async () => {
            const result = await resetThemeColor();
            if (result.ok) {
                toast.success(result.message);
                clearPreview();
                setSaved(result.color);
                setColor(result.color);
                setText(result.color);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h5 className="font-semibold text-foreground">رنگ اصلی سایت</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                    دکمه‌ها، لینک‌ها، نشان‌ها و تأکیدهای سایت از این رنگ استفاده می‌کنند. تغییرات همین‌جا پیش‌نمایش داده
                    می‌شود و بعد از «ذخیره» برای همه‌ی بازدیدکنندگان اعمال می‌شود.
                </p>

                {/* picker */}
                <div className="mt-5 flex flex-wrap items-center gap-4">
                    <label
                        className="relative h-14 w-14 cursor-pointer overflow-hidden rounded-2xl border border-border shadow-sm"
                        title="انتخاب رنگ"
                    >
                        <input
                            type="color"
                            value={valid || DEFAULT_PRIMARY}
                            onChange={(e) => pick(e.target.value)}
                            className="absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] cursor-pointer border-0 bg-transparent p-0"
                            aria-label="انتخاب رنگ اصلی"
                        />
                    </label>

                    <div className="space-y-1">
                        <input
                            dir="ltr"
                            value={text}
                            onChange={handleText}
                            maxLength={7}
                            spellCheck={false}
                            placeholder="#4f46e5"
                            aria-label="کد رنگ"
                            className={cn(
                                'h-10 w-36 rounded-md border bg-transparent px-3 font-mono text-sm uppercase outline-none focus-visible:ring-1 focus-visible:ring-ring',
                                text && !normalizeHex(text) ? 'border-destructive' : 'border-input',
                            )}
                        />
                        {text && !normalizeHex(text) && (
                            <p className="text-xs text-destructive">کد رنگ معتبر نیست (مثال: #4f46e5)</p>
                        )}
                    </div>

                    {saved !== DEFAULT_PRIMARY && (
                        <Badge variant="secondary" className="h-fit">
                            رنگ فعلی سایت: <span dir="ltr" className="mr-1 font-mono">{saved}</span>
                        </Badge>
                    )}
                </div>

                {/* presets */}
                <div className="mt-5">
                    <p className="mb-2 text-xs text-muted-foreground">رنگ‌های آماده</p>
                    <div className="flex flex-wrap gap-2.5">
                        {THEME_PRESETS.map((preset) => {
                            const active = valid === preset.value;
                            return (
                                <button
                                    key={preset.value}
                                    type="button"
                                    data-keep-radius
                                    title={preset.name}
                                    aria-label={preset.name}
                                    onClick={() => pick(preset.value)}
                                    className={cn(
                                        'flex h-9 w-9 items-center justify-center rounded-full border-2 transition hover:scale-110',
                                        active ? 'border-foreground' : 'border-transparent',
                                    )}
                                    style={{ backgroundColor: preset.value }}
                                >
                                    {active && <Check className="h-4 w-4 text-white drop-shadow" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* live preview (uses the page's own tokens, so it reflects the picked colour) */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="mb-3 text-xs text-muted-foreground">پیش‌نمایش</p>
                <div className="flex flex-wrap items-center gap-3">
                    <Button type="button">دکمه‌ی اصلی</Button>
                    <Button type="button" variant="outline">
                        دکمه‌ی دوم
                    </Button>
                    <Button type="button" variant="secondary">
                        ثانویه
                    </Button>
                    <Badge>نشان</Badge>
                    <span className="text-sm font-semibold text-primary">لینک و تأکید</span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        برچسب
                    </span>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-primary/15">
                    <div className="h-full w-2/3 rounded-full bg-primary" />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button type="button" onClick={handleSave} disabled={!dirty || isSaving || isResetting}>
                    {isSaving && <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />}
                    ذخیره‌ی رنگ
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSaving || isResetting || saved === DEFAULT_PRIMARY}
                >
                    {isResetting ? (
                        <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />
                    ) : (
                        <RotateCcw className="ml-1.5 h-4 w-4" />
                    )}
                    بازگردانی رنگ پیش‌فرض
                </Button>
            </div>
        </div>
    );
}
