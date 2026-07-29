'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { grantCourseAccess } from '@/app/actions/users';

function GrantAccessButton({ courseId, studentId }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            try {
                await grantCourseAccess(courseId, studentId);
                toast.success('دسترسی دانشجو به دوره فعال شد');
                router.refresh();
            } catch (error) {
                toast.error(error?.message || 'مشکلی پیش آمد');
            }
        });
    };

    return (
        <Button size="sm" variant="destructive" disabled={isPending} onClick={handleClick}>
            فعال‌سازی دسترسی
        </Button>
    );
}

export default GrantAccessButton;
