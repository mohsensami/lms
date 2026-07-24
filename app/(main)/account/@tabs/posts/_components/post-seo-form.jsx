'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updatePost } from '@/app/actions/post';
import { SITE_URL } from '@/lib/seo';

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
                <div
                    className={cn('h-full transition-all', color)}
                    style={{ width: `${Math.min(100, (length / max) * 100)}%` }}
                />
            </div>
            <span className="w-16 shrink-0 text-left text-xs text-muted-foreground">
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

export const PostSeoForm = ({ initialData, postId }) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
    const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
    const [focusKeyword, setFocusKeyword] = useState(initialData?.focusKeyword || '');

    const effectiveTitle = metaTitle || initialData?.title || '';
    const effectiveDescription = metaDescription || '';

    const checklist = useMemo(() => {
        const keyword = focusKeyword.trim().toLowerCase();
        const title = (initialData?.title || '').toLowerCase();
        const content = (initialData?.content || '').toLowerCase();
        const slug = (initialData?.slug || '').toLowerCase();
        const wordCount = (initialData?.content || '').trim().split(/\s+/).filter(Boolean).length;

        const items = [];

        if (!keyword) {
            items.push({ ok: false, warn: true, label: 'یک کلمه‌ی کلیدی فوکوس تعیین کنید تا بقیه‌ی موارد بررسی شوند.' });
            return items;
        }

        items.push({
            ok: title.includes(keyword),
            label: 'کلمه‌ی کلیدی در عنوان پست وجود دارد.',
        });
        items.push({
            ok: effectiveDescription.toLowerCase().includes(keyword),
            label: 'کلمه‌ی کلیدی در توضیحات متا (meta description) وجود دارد.',
        });
        items.push({
            ok: content.includes(keyword),
            label: 'کلمه‌ی کلیدی حداقل یک‌بار در متن پست آمده است.',
        });
        items.push({
            ok: slug.includes(keyword.replace(/\s+/g, '-')) || slug.includes(keyword.replace(/\s+/g, '')),
            label: 'کلمه‌ی کلیدی در آدرس (slug) پست وجود دارد.',
        });
        items.push({
            ok: wordCount >= MIN_WORDS,
            warn: wordCount >= MIN_WORDS / 2,
            label: `طول محتوا کافی است (حداقل ${MIN_WORDS} کلمه، فعلاً ${wordCount} کلمه).`,
        });
        items.push({
            ok: effectiveTitle.length >= TITLE_MIN && effectiveTitle.length <= TITLE_MAX,
            warn: effectiveTitle.length > 0,
            label: `طول عنوان متا بین ${TITLE_MIN} تا ${TITLE_MAX} کاراکتر باشد.`,
        });
        items.push({
            ok: effectiveDescription.length >= DESC_MIN && effectiveDescription.length <= DESC_MAX,
            warn: effectiveDescription.length > 0,
            label: `طول توضیحات متا بین ${DESC_MIN} تا ${DESC_MAX} کاراکتر باشد.`,
        });

        return items;
    }, [focusKeyword, effectiveDescription, effectiveTitle, initialData]);

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await updatePost(postId, {
                metaTitle: metaTitle || null,
                metaDescription: metaDescription || null,
                focusKeyword: focusKeyword || null,
            });
            toast.success('اطلاعات سئو ذخیره شد');
            router.refresh();
        } catch (error) {
            toast.error('مشکلی پیش آمد');
        } finally {
            setIsSubmitting(false);
        }
    };

    const previewUrl = `${SITE_URL}/blog/${initialData?.slug || ''}`;

    return (
        <div className="mt-6 border bg-gray-50 rounded-md p-4">
            <div className="font-medium">سئوی پست (شبیه Yoast)</div>

            {/* Google SERP preview */}
            <div className="mt-4 rounded-md border bg-white p-4">
                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                    {previewUrl}
                </p>
                <p className="mt-1 truncate text-lg text-[#1a0dab]">{effectiveTitle || 'عنوان پست'}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">
                    {effectiveDescription || 'توضیحات متا را وارد کنید تا اینجا نمایش داده شود.'}
                </p>
            </div>

            <div className="mt-4 space-y-4">
                <div>
                    <Label>عنوان متا (Meta Title)</Label>
                    <Input
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder={initialData?.title}
                        disabled={isSubmitting}
                    />
                    <CounterBar length={metaTitle.length} min={TITLE_MIN} max={TITLE_MAX} />
                </div>

                <div>
                    <Label>توضیحات متا (Meta Description)</Label>
                    <Textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        rows={3}
                        disabled={isSubmitting}
                    />
                    <CounterBar length={metaDescription.length} min={DESC_MIN} max={DESC_MAX} />
                </div>

                <div>
                    <Label>کلمه‌ی کلیدی فوکوس</Label>
                    <Input
                        value={focusKeyword}
                        onChange={(e) => setFocusKeyword(e.target.value)}
                        placeholder="مثلا: آموزش ری‌اکت"
                        disabled={isSubmitting}
                    />
                </div>

                <Button onClick={handleSave} disabled={isSubmitting} size="sm">
                    ذخیره اطلاعات سئو
                </Button>
            </div>

            <div className="mt-6">
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
};
