'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { updatePost } from '@/app/actions/post';
import { PostCategorySelect } from './post-category-select';

export const PostCategoryForm = ({ initialData, postId, categories }) => {
    const router = useRouter();
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
    const [isSaving, setIsSaving] = useState(false);
    const dirty = categoryId !== (initialData?.categoryId || '');

    const onSave = async () => {
        try {
            setIsSaving(true);
            await updatePost(postId, { categoryId: categoryId || null });
            toast.success('دسته‌بندی مقاله ذخیره شد');
            router.refresh();
        } catch {
            toast.error('مشکلی پیش آمد');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-6 rounded-md border bg-gray-50 p-4">
            <div className="flex items-center justify-between font-medium">
                دسته‌بندی
                <Link href="/account/posts/categories" className="text-xs font-normal text-primary hover:underline">
                    مدیریت دسته‌بندی‌ها
                </Link>
            </div>
            <div className="mt-4">
                <PostCategorySelect categories={categories} value={categoryId} onChange={setCategoryId} disabled={isSaving} />
            </div>
            {categories.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">هنوز دسته‌بندی‌ای ساخته نشده است.</p>
            )}
            <div className="mt-4">
                <Button type="button" onClick={onSave} disabled={isSaving || !dirty}>
                    ذخیره دسته‌بندی
                </Button>
            </div>
        </div>
    );
};
