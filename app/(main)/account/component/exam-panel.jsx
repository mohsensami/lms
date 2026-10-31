import Link from 'next/link';
import { CheckCircle2, Lock } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatFaDate } from '@/lib/date';
import { EXAM_RETRY_LOCK_DAYS } from '@/lib/exam-constants';
import { DownloadCertificate } from './download-certificate';

const fa = (n) => Number(n).toLocaleString('fa-IR');

/**
 * The exam block of a course on «آزمون‌ها و مدارک». The exam itself is taken
 * on its own full page (/exam/[courseId]); this panel only shows the state
 * and links there.
 */
export function ExamPanel({ courseId, examState, certificateStatus }) {
    const { state, exam } = examState;

    let body;
    if (state === 'no_exam') {
        body = <p className="text-sm text-muted-foreground">برای این دوره هنوز آزمونی منتشر نشده است.</p>;
    } else if (state === 'locked') {
        const daysLeft = Math.max(1, Math.ceil((new Date(examState.lockedUntil).getTime() - Date.now()) / 86400000));
        body = (
            <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertTitle>{examState.attempt?.timedOut ? 'زمان آزمون تمام شد' : 'در آزمون قبول نشدید'}</AlertTitle>
                <AlertDescription>
                    شما به حداقل تعداد پاسخ درست نرسیدید، بنابراین شرکت دوباره در آزمون و ارسال درخواست مدرک تا{' '}
                    <b>{formatFaDate(examState.lockedUntil)}</b> ({fa(daysLeft)} روز دیگر) قفل است.
                </AlertDescription>
            </Alert>
        );
    } else if (state === 'passed') {
        body = (
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span>
                        در آزمون قبول شدید ({fa(examState.attempt.correctCount)} از {fa(examState.attempt.totalQuestions)} پاسخ درست)
                    </span>
                </div>
                <DownloadCertificate courseId={courseId} requestStatus={certificateStatus} />
            </div>
        );
    } else {
        // available | in_progress
        body = (
            <div className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">{fa(exam.questionCount)} سوال ۴ گزینه‌ای</Badge>
                    <Badge variant="secondary">{fa(exam.durationMinutes)} دقیقه</Badge>
                    <Badge variant="secondary">حداقل {fa(exam.requiredCorrect)} پاسخ درست</Badge>
                </div>
                {exam.description && <p className="text-sm text-muted-foreground">{exam.description}</p>}
                <p className="text-xs text-muted-foreground">
                    اگر در زمان مقرر به تعداد لازم پاسخ درست ندهید، {fa(EXAM_RETRY_LOCK_DAYS)} روز امکان شرکت دوباره و درخواست مدرک را ندارید.
                </p>
                <Button asChild size="sm">
                    <Link href={`/exam/${courseId}`}>{state === 'in_progress' ? 'ادامه‌ی آزمون' : 'ورود به آزمون'}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div>
            <h6 className="mb-3 text-sm font-semibold text-foreground">{exam?.title ? `آزمون: ${exam.title}` : 'آزمون پایان دوره'}</h6>
            {body}
        </div>
    );
}
