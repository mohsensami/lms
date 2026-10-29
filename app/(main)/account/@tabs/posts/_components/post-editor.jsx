'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ExternalLink, ImageIcon, Loader2, Maximize2, Minimize2, Trash, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { createPost, deletePost, updatePost } from '@/app/actions/post';
import { getSlug } from '@/lib/convertData';
import { buildPublishPayload, getPostState, isPostLive, POST_STATE_LABEL } from '@/lib/post-status';
import { PostContentField } from './post-content-field';
import { PostPublishPicker } from './post-publish-picker';
import { PostCategorySelect } from './post-category-select';
import { PostImageUploader } from './post-image-uploader';
import { PostSeoPanel } from './post-seo-panel';
import { cn } from '@/lib/utils';

const STATE_VARIANT = { draft: 'outline', scheduled: 'secondary', published: 'success' };
const SLUG_RE = /^[a-z0-9\u0600-\u06FF-]+$/i;

const initialPublish = (post) => {
    if (!post) return { mode: 'now', date: null };
    const state = getPostState(post);
    if (state === 'draft') return { mode: 'draft', date: null };
    if (state === 'scheduled') return { mode: 'schedule', date: new Date(post.publishedAt) };
    return { mode: 'now', date: null };
};

const errorMessage = (error) =>
    String(error?.message || '').includes('Unique constraint')
        ? 'این نامک (slug) قبلاً برای پست دیگری استفاده شده است. لطفاً نامک دیگری انتخاب کنید.'
        : error?.message === 'تاریخ و ساعت انتشار معتبر نیست'
          ? error.message
          : 'مشکلی پیش آمد';

/**
 * WordPress-style post editor, used for both "add" and "edit":
 * a wide main column (title, permalink, body, SEO) and a sidebar
 * (publish, category, featured image). Everything is saved with ONE button.
 * The "تمام‌صفحه" button makes the editor cover the whole window.
 */
export function PostEditor({ post, categories = [] }) {
    const router = useRouter();
    const isEdit = Boolean(post?.id);

    const [title, setTitle] = useState(post?.title || '');
    const [slug, setSlug] = useState(post?.slug || '');
    // Until the admin edits the slug by hand, a NEW post's slug follows its title.
    const [slugTouched, setSlugTouched] = useState(isEdit);
    const [content, setContent] = useState(post?.content || '');
    const [seo, setSeo] = useState({
        metaTitle: post?.metaTitle || '',
        metaDescription: post?.metaDescription || '',
        focusKeyword: post?.focusKeyword || '',
    });
    const [thumbnail, setThumbnail] = useState(post?.thumbnail || null);
    const [categoryId, setCategoryId] = useState(post?.categoryId || '');
    const [publish, setPublish] = useState(() => initialPublish(post));

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [thumbUploading, setThumbUploading] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    const state = post ? getPostState(post) : null;
    const isLive = post ? isPostLive(post) : false;

    // Esc leaves fullscreen; the page behind doesn't scroll while it's open.
    useEffect(() => {
        if (!fullscreen) return undefined;
        const onKey = (e) => e.key === 'Escape' && setFullscreen(false);
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = previous;
        };
    }, [fullscreen]);

    const onTitleChange = (e) => {
        const value = e.target.value;
        setTitle(value);
        if (!slugTouched) setSlug(getSlug(value) || '');
    };

    const validate = () => {
        if (!title.trim()) return 'عنوان الزامی است';
        if (!slug.trim()) return 'نامک (slug) الزامی است';
        if (!SLUG_RE.test(slug)) return 'نامک فقط می‌تواند شامل حروف، عدد و خط تیره باشد (بدون فاصله)';
        if (!content.trim()) return 'متن پست الزامی است';
        return null;
    };

    const onSave = async () => {
        const problem = validate();
        if (problem) {
            toast.error(problem);
            return;
        }

        setSaving(true);
        try {
            const data = {
                title: title.trim(),
                slug: getSlug(slug),
                content,
                thumbnail: thumbnail || null,
                categoryId: categoryId || null,
                metaTitle: seo.metaTitle || null,
                metaDescription: seo.metaDescription || null,
                focusKeyword: seo.focusKeyword || null,
                // A live post keeps its original publish date while it stays live.
                ...buildPublishPayload(publish, { keepPublishedAt: isLive ? post.publishedAt : null }),
            };

            if (isEdit) {
                await updatePost(post.id, data);
                toast.success('تغییرات ذخیره شد');
                router.refresh();
            } else {
                const created = await createPost(data);
                toast.success('پست ایجاد شد');
                router.push(`/account/posts/${created?._id ?? created?.id}`);
            }
        } catch (error) {
            toast.error(errorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (!window.confirm('آیا از حذف این پست مطمئن هستید؟ این عملیات قابل بازگشت نیست.')) return;
        setDeleting(true);
        try {
            await deletePost(post.id);
            toast.success('پست حذف شد');
            router.push('/account/posts');
        } catch {
            toast.error('مشکلی در حذف پست پیش آمد');
            setDeleting(false);
        }
    };

    const busy = saving || deleting;
    const saveLabel = saving
        ? 'در حال ذخیره...'
        : isEdit
          ? 'به‌روزرسانی'
          : publish.mode === 'draft'
            ? 'ذخیره‌ی پیش‌نویس'
            : publish.mode === 'schedule'
              ? 'زمان‌بندی انتشار'
              : 'انتشار';

    return (
        <div
            className={cn(
                fullscreen ? 'fixed inset-0 z-[60] overflow-y-auto bg-background p-4 lg:p-6' : 'p-4 lg:p-6',
            )}
        >
            {/* Top bar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold">{isEdit ? 'ویرایش مقاله' : 'افزودن مقاله'}</h1>
                    {state && <Badge variant={STATE_VARIANT[state]}>{POST_STATE_LABEL[state]}</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {isEdit && (
                        <Button asChild type="button" variant="outline" size="sm">
                            <Link href={`/blog/${post.slug}`} target="_blank">
                                <ExternalLink className="ml-1.5 h-4 w-4" />
                                مشاهده
                            </Link>
                        </Button>
                    )}
                    <Button type="button" variant="outline" size="sm" onClick={() => setFullscreen((v) => !v)}>
                        {fullscreen ? <Minimize2 className="ml-1.5 h-4 w-4" /> : <Maximize2 className="ml-1.5 h-4 w-4" />}
                        {fullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}
                    </Button>
                </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* Main column */}
                <div className="min-w-0 space-y-5">
                    <Input
                        value={title}
                        onChange={onTitleChange}
                        disabled={busy}
                        placeholder="عنوان مقاله را اینجا بنویسید"
                        className="h-14 bg-white text-2xl font-bold"
                    />

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium text-muted-foreground">پیوند یکتا:</span>
                        <span dir="ltr" className="text-muted-foreground">
                            /blog/
                        </span>
                        <Input
                            dir="ltr"
                            value={slug}
                            disabled={busy}
                            onChange={(e) => {
                                setSlugTouched(true);
                                setSlug(e.target.value);
                            }}
                            placeholder="my-first-post"
                            className="h-8 max-w-xs flex-1 bg-white font-mono text-sm"
                        />
                    </div>

                    <PostContentField field={{ value: content, onChange: setContent }} disabled={busy} rows={26} />

                    <Card>
                        <Accordion type="single" collapsible defaultValue="seo">
                            <AccordionItem value="seo" className="border-b-0">
                                <AccordionTrigger className="px-5 py-4 text-base font-semibold hover:no-underline">
                                    سئوی مقاله (شبیه Yoast)
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-5">
                                    <PostSeoPanel
                                        values={seo}
                                        onChange={setSeo}
                                        title={title}
                                        slug={slug}
                                        content={content}
                                        disabled={busy}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </Card>
                </div>

                {/* Sidebar */}
                <aside className="space-y-4 lg:sticky lg:top-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">انتشار</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <PostPublishPicker
                                compact
                                value={publish}
                                onChange={setPublish}
                                disabled={busy}
                                liveSince={isLive ? post.publishedAt : null}
                            />
                            <div className="flex items-center justify-between gap-2 border-t pt-4">
                                {isEdit ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        disabled={busy}
                                        onClick={onDelete}
                                    >
                                        <Trash className="ml-1.5 h-4 w-4" />
                                        حذف
                                    </Button>
                                ) : (
                                    <Button asChild type="button" variant="ghost" size="sm">
                                        <Link href="/account/posts">انصراف</Link>
                                    </Button>
                                )}
                                <Button type="button" onClick={onSave} disabled={busy}>
                                    {saving && <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />}
                                    {saveLabel}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">دسته‌بندی</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PostCategorySelect
                                categories={categories}
                                value={categoryId}
                                onChange={setCategoryId}
                                disabled={busy}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">تصویر شاخص</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-md bg-slate-200">
                                {thumbnail ? (
                                    <Image alt="تصویر شاخص" fill className="object-cover" src={thumbnail} />
                                ) : (
                                    <ImageIcon className="h-10 w-10 text-slate-500" />
                                )}
                                {thumbUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                                    </div>
                                )}
                            </div>

                            <Label className="text-xs text-muted-foreground">محل ذخیره‌ی تصویر را انتخاب کنید و آپلود بزنید:</Label>
                            <PostImageUploader
                                endpoint="postImageUploader"
                                label={thumbnail ? 'تغییر تصویر' : 'آپلود تصویر'}
                                disabled={busy}
                                onUploadingChange={setThumbUploading}
                                onUploaded={(files) => {
                                    setThumbnail(files[0].url);
                                    toast.success('تصویر شاخص انتخاب شد؛ برای ثبت نهایی ذخیره کنید');
                                }}
                            />
                            {thumbnail && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground"
                                    disabled={busy}
                                    onClick={() => setThumbnail(null)}
                                >
                                    <X className="ml-1.5 h-4 w-4" />
                                    حذف تصویر
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
