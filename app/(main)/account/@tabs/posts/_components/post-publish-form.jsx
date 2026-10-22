'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { updatePost } from '@/app/actions/post';
import { buildPublishPayload, getPostState, isPostLive, POST_STATE_LABEL } from '@/lib/post-status';
import { PostPublishPicker } from './post-publish-picker';

const STATE_VARIANT = { draft: 'outline', scheduled: 'secondary', published: 'success' };

const initialValue = (post) => {
    const state = getPostState(post);
    if (state === 'draft') return { mode: 'draft', date: null };
    if (state === 'scheduled') return { mode: 'schedule', date: new Date(post.publishedAt) };
    return { mode: 'now', date: null };
};

export const PostPublishForm = ({ initialData, postId }) => {
    const router = useRouter();
    const [value, setValue] = useState(() => initialValue(initialData));
    const [isSaving, setIsSaving] = useState(false);

    const state = getPostState(initialData);
    const isLive = isPostLive(initialData);

    const onSave = async () => {
        try {
            setIsSaving(true);
            // A live post keeps its original publish date when it stays live.
            const payload = buildPublishPayload(value, { keepPublishedAt: isLive ? initialData.publishedAt : null });
            await updatePost(postId, payload);
            toast.success(
                value.mode === 'draft'
                    ? 'مقاله به پیش‌نویس برگشت'
                    : value.mode === 'schedule'
                      ? 'زمان انتشار ذخیره شد'
                      : 'مقاله منتشر شد',
            );
            router.refresh();
        } catch (error) {
            toast.error(error?.message === 'تاریخ و ساعت انتشار معتبر نیست' ? error.message : 'مشکلی پیش آمد');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-6 rounded-md border bg-gray-50 p-4">
            <div className="flex items-center justify-between font-medium">
                وضعیت انتشار
                <Badge variant={STATE_VARIANT[state]}>{POST_STATE_LABEL[state]}</Badge>
            </div>
            <div className="mt-4">
                <PostPublishPicker
                    value={value}
                    onChange={setValue}
                    disabled={isSaving}
                    liveSince={isLive ? initialData.publishedAt : null}
                />
            </div>
            <div className="mt-4">
                <Button type="button" onClick={onSave} disabled={isSaving}>
                    ذخیره وضعیت انتشار
                </Button>
            </div>
        </div>
    );
};
