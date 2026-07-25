'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { approvePostComment, rejectPostComment, deletePostCommentAction } from '@/app/actions/post-comment';

function PostCommentModerationActions({ commentId, status }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handle = (action, successMessage, confirmMessage) => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;

        startTransition(async () => {
            try {
                await action(commentId);
                toast.success(successMessage);
                router.refresh();
            } catch (error) {
                toast.error('مشکلی پیش آمد');
            }
        });
    };

    return (
        <div className="flex flex-wrap gap-2">
            {status === 'pending' && (
                <>
                    <Button size="sm" disabled={isPending} onClick={() => handle(approvePostComment, 'دیدگاه تایید شد')}>
                        تایید
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => handle(rejectPostComment, 'دیدگاه رد شد')}
                    >
                        رد کردن
                    </Button>
                </>
            )}
            <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() =>
                    handle(
                        deletePostCommentAction,
                        'دیدگاه حذف شد',
                        'آیا از حذف کامل این دیدگاه مطمئن هستید؟ این عملیات قابل بازگشت نیست.',
                    )
                }
            >
                حذف
            </Button>
        </div>
    );
}

export default PostCommentModerationActions;
