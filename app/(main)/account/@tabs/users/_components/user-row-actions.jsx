'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { setUserActive, deleteUser, changeUserRole } from '@/app/actions/users';

const ROLE_LABEL = {
    student: 'دانشجو',
    instructor: 'مدرس',
    admin: 'مدیر',
};

function UserRowActions({ userId, isActive, role }) {
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

    const handleRoleChange = (newRole) => {
        if (newRole === role) return;
        if (
            !window.confirm(
                `آیا از تغییر نقش این کاربر به «${ROLE_LABEL[newRole]}» مطمئن هستید؟`,
            )
        )
            return;

        startTransition(async () => {
            try {
                await changeUserRole(userId, newRole);
                toast.success('نقش کاربر تغییر کرد');
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
        <div className="flex flex-wrap items-center gap-2">
            <Select defaultValue={role} disabled={isPending} onValueChange={handleRoleChange}>
                <SelectTrigger className="h-9 w-[110px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="student">دانشجو</SelectItem>
                    <SelectItem value="instructor">مدرس</SelectItem>
                    <SelectItem value="admin">مدیر</SelectItem>
                </SelectContent>
            </Select>
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
