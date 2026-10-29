'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deleteExam, toggleExamPublish } from '@/app/actions/exam';

export function ExamRowActions({ examId, active }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const run = (fn, okMsg, confirmMsg) => {
        if (confirmMsg && !window.confirm(confirmMsg)) return;
        startTransition(async () => {
            const res = await fn(examId);
            if (!res?.ok) return toast.error(res?.error || 'مشکلی پیش آمد');
            toast.success(okMsg);
            router.refresh();
        });
    };

    return (
        <div className="flex items-center justify-end gap-1">
            <Button asChild size="icon" variant="ghost" title="ویرایش">
                <Link href={`/account/exams/${examId}`}>
                    <Pencil />
                </Link>
            </Button>
            <Button
                size="icon"
                variant="ghost"
                disabled={pending}
                title={active ? 'لغو انتشار' : 'انتشار'}
                onClick={() => run(toggleExamPublish, active ? 'انتشار لغو شد' : 'آزمون منتشر شد')}
            >
                {active ? <EyeOff /> : <Eye />}
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={pending}
                title="حذف"
                onClick={() => run(deleteExam, 'آزمون حذف شد', 'این آزمون و همه‌ی تلاش‌های دانشجوها حذف شود؟')}
            >
                <Trash2 />
            </Button>
        </div>
    );
}
