'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

function DeleteOwnCommentButton({ commentId, onDelete }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!window.confirm('آیا از حذف این دیدگاه مطمئن هستید؟')) return;

        startTransition(async () => {
            try {
                await onDelete(commentId);
                toast.success('دیدگاه حذف شد');
                router.refresh();
            } catch (error) {
                toast.error(error?.message || 'مشکلی پیش آمد');
            }
        });
    };

    return (
        <Button size="sm" variant="ghost" className="text-destructive" disabled={isPending} onClick={handleDelete}>
            <Trash className="h-3.5 w-3.5 ml-1.5" />
            حذف دیدگاه
        </Button>
    );
}

export default DeleteOwnCommentButton;
