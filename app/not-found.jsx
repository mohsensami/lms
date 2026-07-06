import React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <p className="text-6xl font-extrabold text-primary">۴۰۴</p>
            <h1 className="text-2xl font-bold text-foreground">صفحه مورد نظر پیدا نشد</h1>
            <p className="max-w-md text-muted-foreground">
                ممکنه آدرس اشتباه باشه یا این صفحه حذف شده باشه.
            </p>
            <Link href="/" className={cn(buttonVariants({ size: 'lg' }), 'mt-2 rounded-full font-semibold')}>
                بازگشت به صفحه اصلی
            </Link>
        </div>
    );
}
