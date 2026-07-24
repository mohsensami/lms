'use client';

import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { deletePost } from '@/app/actions/post';

export const PostActions = ({ postId }) => {
    const router = useRouter();

    const handleDelete = async () => {
        if (!window.confirm('آیا از حذف این پست مطمئن هستید؟ این عملیات قابل بازگشت نیست.')) {
            return;
        }

        try {
            await deletePost(postId);
            toast.success('پست حذف شد');
            router.push('/account/posts');
        } catch (error) {
            toast.error('مشکلی در حذف پست پیش آمد');
        }
    };

    return (
        <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash className="h-4 w-4 mr-2" />
            حذف پست
        </Button>
    );
};
