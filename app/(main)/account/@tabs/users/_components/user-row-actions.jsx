'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { setUserActive, deleteUser } from '@/app/actions/users';

function UserRowActions({ userId, isActive }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleToggleActive = () => {
        startTransition(async () => {
            try {
                await setUserActive(userId, !isActive);
                toast.success(isActive ? 'حساب کاربر غیرفعال شد' : 'حساب کاربر فعال شد');
                router.refresh();
            } catch (error) {
                toast.error(error?.message || 'مشکلی پیش آمد');
            }
        });
    };

    const handleDelete = () => {
        if (
            !window.confirm(
                'آیا از حذف کامل این کاربر مطمئن هستید؟ این عملیات قابل بازگشت نیست (سوابق مالی و دیدگاه‌های او حفظ می‌شوند اما بدون نام کاربر).',
            )
        )
            return;

        startTransition(async () => {
            try {
                await deleteUser(userId);
                toast.success('کاربر حذف شد');
                router.refresh();
            } catch (error) {
                toast.error(error?.message || 'مشکلی پیش آمد');
            }
        });
    };

    return (
        <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" disabled={isPending} onClick={handleToggleActive}>
                {isActive ? 'غیرفعال کردن' : 'فعال کردن'}
            </Button>
            <Button size="sm" variant="destructive" disabled={isPending} onClick={handleDelete}>
                حذف کاربر
            </Button>
        </div>
    );
}

export default UserRowActions;
