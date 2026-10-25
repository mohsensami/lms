'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';
import { resetSiteSection, saveSiteSection } from '@/app/actions/settings';

// --------------------------------------------------------------- image field

function ImageField({ value, onChange, disabled }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const { startUpload } = useUploadThing('siteImageUploader', {
        onUploadError: (error) => toast.error(`خطا در آپلود: ${error.message}`),
    });

    async function handleFile(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('فقط فایل تصویری مجاز است');
            return;
        }
        setUploading(true);
        try {
            const result = await startUpload([file]);
            const url = result?.[0]?.ufsUrl ?? result?.[0]?.url;
            if (url) onChange(url);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50">
                {value ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={value} alt="" className="h-full w-full object-contain" />
                ) : (
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2">
                <Input
                    dir="ltr"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://..."
                    disabled={disabled || uploading}
                />
                <div className="flex gap-2">
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={disabled || uploading}
                        onClick={() => inputRef.current?.click()}
                    >
                        {uploading ? <Loader2 className="ml-1.5 h-4 w-4 animate-spin" /> : <ImagePlus className="ml-1.5 h-4 w-4" />}
                        {uploading ? 'در حال آپلود...' : 'آپلود تصویر'}
                    </Button>
                    {value && (
                        <Button type="button" size="sm" variant="ghost" disabled={disabled || uploading} onClick={() => onChange('')}>
                            <X className="ml-1.5 h-4 w-4" />
                            حذف
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------- simple fields

function Control({ field, value, onChange, disabled }) {
    if (field.type === 'textarea') {
        return (
            <Textarea
                dir={field.dir}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                rows={3}
                className="min-h-[80px]"
            />
        );
    }
    if (field.type === 'image') {
        return <ImageField value={value ?? ''} onChange={onChange} disabled={disabled} />;
    }
    return (
        <Input
            dir={field.dir}
            value={value ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        />
    );
}

function SwitchField({ field, value, onChange, disabled }) {
    return (
        <label className="flex cursor-pointer items-center gap-3">
            <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={Boolean(value)}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <span className="text-sm font-medium text-foreground">{field.label}</span>
        </label>
    );
}

// ------------------------------------------------------------------ list field

function ListField({ field, value, onChange, disabled }) {
    const rows = Array.isArray(value) ? value : [];
    const max = field.max ?? 20;
    const empty = Object.fromEntries(field.itemFields.map((f) => [f.name, '']));

    const update = (index, name, next) => onChange(rows.map((row, i) => (i === index ? { ...row, [name]: next } : row)));
    const remove = (index) => onChange(rows.filter((_, i) => i !== index));
    const move = (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= rows.length) return;
        const copy = [...rows];
        [copy[index], copy[target]] = [copy[target], copy[index]];
        onChange(copy);
    };

    return (
        <div className="space-y-3">
            {rows.map((row, index) => (
                <div key={index} className="flex gap-2 rounded-xl border border-border bg-muted/30 p-3">
                    <div className="grid flex-1 gap-2 sm:grid-cols-2">
                        {field.itemFields.map((item) => (
                            <div key={item.name} className={cn('space-y-1', item.type === 'textarea' && 'sm:col-span-2')}>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <Control
                                    field={item}
                                    value={row[item.name]}
                                    onChange={(next) => update(index, item.name, next)}
                                    disabled={disabled}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8" disabled={disabled || index === 0} onClick={() => move(index, -1)} aria-label="بالا">
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8" disabled={disabled || index === rows.length - 1} onClick={() => move(index, 1)} aria-label="پایین">
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" disabled={disabled} onClick={() => remove(index)} aria-label="حذف">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
            {rows.length === 0 && <p className="text-xs text-muted-foreground">موردی ثبت نشده است.</p>}
            <Button type="button" size="sm" variant="outline" disabled={disabled || rows.length >= max} onClick={() => onChange([...rows, { ...empty }])}>
                <Plus className="ml-1.5 h-4 w-4" />
                {field.addLabel || 'افزودن'}
            </Button>
        </div>
    );
}

// ------------------------------------------------------------------- the form

export default function SiteSectionForm({ section, title, description, fields, initial }) {
    const router = useRouter();
    const [saved, setSaved] = useState(initial);
    const [values, setValues] = useState(initial);
    const [isSaving, startSaving] = useTransition();
    const [isResetting, startResetting] = useTransition();

    const dirty = JSON.stringify(values) !== JSON.stringify(saved);
    const busy = isSaving || isResetting;
    const set = (name, next) => setValues((prev) => ({ ...prev, [name]: next }));

    function handleSave() {
        startSaving(async () => {
            const result = await saveSiteSection(section, values);
            if (result.ok) {
                toast.success(result.message);
                setSaved(result.values);
                setValues(result.values);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    }

    function handleReset() {
        if (!window.confirm('همه‌ی مقدارهای این بخش به حالت پیش‌فرض برگردد؟')) return;
        startResetting(async () => {
            const result = await resetSiteSection(section);
            if (result.ok) {
                toast.success(result.message);
                setSaved(result.values);
                setValues(result.values);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h5 className="font-semibold text-foreground">{title}</h5>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}

            <div className="mt-5 space-y-5">
                {fields.map((field) =>
                    field.type === 'switch' ? (
                        <SwitchField key={field.name} field={field} value={values[field.name]} onChange={(v) => set(field.name, v)} disabled={busy} />
                    ) : (
                        <div key={field.name} className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{field.label}</label>
                            {field.type === 'list' ? (
                                <ListField field={field} value={values[field.name]} onChange={(v) => set(field.name, v)} disabled={busy} />
                            ) : (
                                <Control field={field} value={values[field.name]} onChange={(v) => set(field.name, v)} disabled={busy} />
                            )}
                            {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
                        </div>
                    ),
                )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button type="button" onClick={handleSave} disabled={!dirty || busy}>
                    {isSaving && <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />}
                    ذخیره‌ی تغییرات
                </Button>
                <Button type="button" variant="ghost" onClick={handleReset} disabled={busy}>
                    {isResetting ? <Loader2 className="ml-1.5 h-4 w-4 animate-spin" /> : <RotateCcw className="ml-1.5 h-4 w-4" />}
                    بازگشت به پیش‌فرض
                </Button>
                {dirty && <span className="text-xs text-amber-700">تغییرات ذخیره‌نشده دارید</span>}
            </div>
        </div>
    );
}
