'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSlug } from '@/lib/convertData';
import { createPostCategory, deletePostCategory, updatePostCategory } from '@/app/actions/post-category';

const EMPTY = { name: '', slug: '', description: '' };

export default function CategoryManager({ categories }) {
    const router = useRouter();
    const [form, setForm] = useState(EMPTY);
    const [slugTouched, setSlugTouched] = useState(false);
    const [busy, setBusy] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState(EMPTY);

    async function run(task, onOk) {
        setBusy(true);
        try {
            const result = await task();
            if (result.ok) {
                toast.success(result.message);
                onOk?.();
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error('مشکلی پیش آمد');
        } finally {
            setBusy(false);
        }
    }

    function handleName(value) {
        setForm((prev) => ({ ...prev, name: value, slug: slugTouched ? prev.slug : getSlug(value) || '' }));
    }

    function startEdit(category) {
        setEditingId(category.id);
        setDraft({ name: category.name, slug: category.slug, description: category.description || '' });
    }

    return (
        <div className="space-y-8">
            {/* add */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h5 className="mb-4 font-semibold text-foreground">دسته‌بندی جدید</h5>
                <div className="grid gap-3 md:grid-cols-2">
                    <Input
                        placeholder="نام دسته‌بندی (مثلاً: آموزش متلب)"
                        value={form.name}
                        onChange={(e) => handleName(e.target.value)}
                        disabled={busy}
                    />
                    <Input
                        dir="ltr"
                        placeholder="slug (مثلاً: matlab-tutorials)"
                        value={form.slug}
                        onChange={(e) => {
                            setSlugTouched(true);
                            setForm((prev) => ({ ...prev, slug: e.target.value }));
                        }}
                        disabled={busy}
                    />
                    <Input
                        className="md:col-span-2"
                        placeholder="توضیح کوتاه (اختیاری)"
                        value={form.description}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                        disabled={busy}
                    />
                </div>
                <Button
                    className="mt-4"
                    disabled={busy || !form.name.trim()}
                    onClick={() =>
                        run(
                            () => createPostCategory(form),
                            () => {
                                setForm(EMPTY);
                                setSlugTouched(false);
                            },
                        )
                    }
                >
                    {busy ? <Loader2 className="ml-1.5 h-4 w-4 animate-spin" /> : <Plus className="ml-1.5 h-4 w-4" />}
                    افزودن
                </Button>
            </div>

            {/* list */}
            <div className="rounded-2xl border border-border bg-card shadow-sm">
                {categories.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">هنوز دسته‌بندی‌ای ساخته نشده است.</p>
                ) : (
                    <ul className="divide-y divide-border">
                        {categories.map((category) => (
                            <li key={category.id} className="p-4">
                                {editingId === category.id ? (
                                    <div className="space-y-3">
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <Input
                                                value={draft.name}
                                                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                                                disabled={busy}
                                            />
                                            <Input
                                                dir="ltr"
                                                value={draft.slug}
                                                onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))}
                                                disabled={busy}
                                            />
                                            <Input
                                                className="md:col-span-2"
                                                placeholder="توضیح کوتاه (اختیاری)"
                                                value={draft.description}
                                                onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                                                disabled={busy}
                                            />
                                        </div>
                                        <p className="text-xs text-amber-700">
                                            تغییر slug باعث می‌شود لینک فیلتر قبلی این دسته کار نکند.
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                disabled={busy || !draft.name.trim()}
                                                onClick={() =>
                                                    run(
                                                        () => updatePostCategory(category.id, draft),
                                                        () => setEditingId(null),
                                                    )
                                                }
                                            >
                                                <Check className="ml-1.5 h-4 w-4" />
                                                ذخیره
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} disabled={busy}>
                                                <X className="ml-1.5 h-4 w-4" />
                                                انصراف
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-foreground">
                                                {category.name}
                                                <span className="mr-2 text-xs font-normal text-muted-foreground">
                                                    ({category._count?.posts ?? 0} مقاله)
                                                </span>
                                            </p>
                                            <p className="text-xs text-muted-foreground" dir="ltr">
                                                /blog?category={category.slug}
                                            </p>
                                            {category.description && (
                                                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => startEdit(category)} disabled={busy}>
                                                <Pencil className="ml-1.5 h-4 w-4" />
                                                ویرایش
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive"
                                                disabled={busy}
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            `دسته‌بندی «${category.name}» حذف شود؟ مقالات آن بدون دسته‌بندی می‌مانند.`,
                                                        )
                                                    ) {
                                                        run(() => deletePostCategory(category.id));
                                                    }
                                                }}
                                            >
                                                <Trash2 className="ml-1.5 h-4 w-4" />
                                                حذف
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
