'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { approveComment, rejectComment, deleteComment } from '@/app/actions/review';

function CommentModerationActions({ testimonialId, status }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handle = (action, successMessage, confirmMessage) => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;

        startTransition(async () => {
            try {
                await action(testimonialId);
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
                    <Button size="sm" disabled={isPending} onClick={() => handle(approveComment, 'دیدگاه تایید شد')}>
                        تایید
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => handle(rejectComment, 'دیدگاه رد شد')}
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
                    handle(deleteComment, 'دیدگاه حذف شد', 'آیا از حذف کامل این دیدگاه مطمئن هستید؟ این عملیات قابل بازگشت نیست.')
                }
            >
                حذف
            </Button>
        </div>
    );
}

export default CommentModerationActions;
