'use client';

import { useMemo } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { SITE_URL } from '@/lib/seo';
import { stripHtml } from '@/lib/post-content';

const TITLE_MIN = 40;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;
const MIN_WORDS = 300;

function CounterBar({ length, min, max }) {
    let color = 'bg-destructive';
    if (length >= min && length <= max) color = 'bg-success';
    else if (length > 0 && length < min + 20 && length <= max + 20) color = 'bg-yellow-500';

    return (
        <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className={cn('h-full transition-all', color)} style={{ width: `${Math.min(100, (length / max) * 100)}%` }} />
            </div>
            <span className="w-16 shrink-0 text-start text-xs text-muted-foreground">
                {length}/{max}
            </span>
        </div>
    );
}

function ChecklistItem({ ok, warn, children }) {
    const Icon = ok ? CheckCircle2 : warn ? AlertCircle : XCircle;
    const color = ok ? 'text-success' : warn ? 'text-yellow-500' : 'text-destructive';
    return (
        <li className="flex items-start gap-2 text-sm">
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', color)} />
            <span className="text-muted-foreground">{children}</span>
        </li>
    );
}

/**
 * Yoast-style SEO box. Fully controlled by the post editor: the checklist
 * reacts live to the title / slug / body being typed, and everything is saved
 * together with the post (there is no separate save button).
 */
export function PostSeoPanel({ values, onChange, title, slug, content, disabled }) {
    const { metaTitle, metaDescription, focusKeyword } = values;
    const effectiveTitle = metaTitle || title || '';

    const checklist = useMemo(() => {
        const keyword = focusKeyword.trim().toLowerCase();
        const plainContent = stripHtml(content || '');
        const lowerContent = plainContent.toLowerCase();
        const wordCount = plainContent.split(/\s+/).filter(Boolean).length;
        const lowerSlug = (slug || '').toLowerCase();

        if (!keyword) {
            return [{ ok: false, warn: true, label: 'یک کلمه‌ی کلیدی فوکوس تعیین کنید تا بقیه‌ی موارد بررسی شوند.' }];
        }

        return [
            { ok: (title || '').toLowerCase().includes(keyword), label: 'کلمه‌ی کلیدی در عنوان پست وجود دارد.' },
            {
                ok: metaDescription.toLowerCase().includes(keyword),
                label: 'کلمه‌ی کلیدی در توضیحات متا (meta description) وجود دارد.',
            },
            { ok: lowerContent.includes(keyword), label: 'کلمه‌ی کلیدی حداقل یک‌بار در متن پست آمده است.' },
            {
                ok: lowerSlug.includes(keyword.replace(/\s+/g, '-')) || lowerSlug.includes(keyword.replace(/\s+/g, '')),
                label: 'کلمه‌ی کلیدی در آدرس (slug) پست وجود دارد.',
            },
            {
                ok: wordCount >= MIN_WORDS,
                warn: wordCount >= MIN_WORDS / 2,
                label: `طول محتوا کافی است (حداقل ${MIN_WORDS} کلمه، فعلاً ${wordCount} کلمه).`,
            },
            {
                ok: effectiveTitle.length >= TITLE_MIN && effectiveTitle.length <= TITLE_MAX,
                warn: effectiveTitle.length > 0,
                label: `طول عنوان متا بین ${TITLE_MIN} تا ${TITLE_MAX} کاراکتر باشد.`,
            },
            {
                ok: metaDescription.length >= DESC_MIN && metaDescription.length <= DESC_MAX,
                warn: metaDescription.length > 0,
                label: `طول توضیحات متا بین ${DESC_MIN} تا ${DESC_MAX} کاراکتر باشد.`,
            },
        ];
    }, [focusKeyword, metaDescription, effectiveTitle, title, slug, content]);

    const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-white p-4">
                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                    {`${SITE_URL}/blog/${slug || ''}`}
                </p>
                <p className="mt-1 truncate text-lg text-[#1a0dab]">{effectiveTitle || 'عنوان پست'}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">
                    {metaDescription || 'توضیحات متا را وارد کنید تا اینجا نمایش داده شود.'}
                </p>
            </div>

            <div>
                <Label>عنوان متا (Meta Title)</Label>
                <Input value={metaTitle} onChange={set('metaTitle')} placeholder={title} disabled={disabled} />
                <CounterBar length={metaTitle.length} min={TITLE_MIN} max={TITLE_MAX} />
            </div>

            <div>
                <Label>توضیحات متا (Meta Description)</Label>
                <Textarea value={metaDescription} onChange={set('metaDescription')} rows={3} disabled={disabled} />
                <CounterBar length={metaDescription.length} min={DESC_MIN} max={DESC_MAX} />
            </div>

            <div>
                <Label>کلمه‌ی کلیدی فوکوس</Label>
                <Input value={focusKeyword} onChange={set('focusKeyword')} placeholder="مثلا: آموزش ری‌اکت" disabled={disabled} />
            </div>

            <div>
                <div className="mb-2 text-sm font-medium text-foreground">چک‌لیست سئو</div>
                <ul className="space-y-2">
                    {checklist.map((item, i) => (
                        <ChecklistItem key={i} ok={item.ok} warn={item.warn}>
                            {item.label}
                        </ChecklistItem>
                    ))}
                </ul>
            </div>
        </div>
    );
}
