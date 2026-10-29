'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Lock, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { startExamAttempt, submitExamAttempt } from '@/app/actions/exam';
import { EXAM_OPTION_LABELS } from '@/lib/exam-constants';
import { formatFaDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { DownloadCertificate } from './download-certificate';

const fa = (n) => Number(n).toLocaleString('fa-IR');

function formatClock(totalSeconds) {
    const s = Math.max(0, totalSeconds);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

export function ExamPanel({ courseId, examState, certificateStatus }) {
    const router = useRouter();
    const { state, exam } = examState;

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState(null); // { attemptId, deadlineMs, offsetMs, questions }
    const [answers, setAnswers] = useState({});
    const [index, setIndex] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const submittedRef = useRef(false);

    const reset = () => {
        setSession(null);
        setAnswers({});
        setIndex(0);
        setResult(null);
        submittedRef.current = false;
    };

    async function handleStart() {
        setLoading(true);
        const res = await startExamAttempt(courseId);
        setLoading(false);
        if (!res?.ok) {
            toast.error(res?.error || 'مشکلی پیش آمد');
            router.refresh();
            return;
        }
        reset();
        const deadlineMs = new Date(res.deadline).getTime();
        const offsetMs = new Date(res.serverNow).getTime() - Date.now(); // server clock - browser clock
        setSession({ attemptId: res.attemptId, deadlineMs, offsetMs, questions: res.questions });
        setRemaining(Math.max(0, Math.round((deadlineMs - (Date.now() + offsetMs)) / 1000)));
        setOpen(true);
    }

    const handleSubmit = useCallback(
        async (auto = false) => {
            if (!session || submittedRef.current) return;
            submittedRef.current = true;
            setSubmitting(true);
            const res = await submitExamAttempt(session.attemptId, answers);
            setSubmitting(false);
            if (!res?.ok) {
                submittedRef.current = false;
                toast.error(res?.error || 'ثبت آزمون با مشکل مواجه شد');
                return;
            }
            setResult({ ...res.result, auto });
        },
        [session, answers],
    );

    // countdown (based on the server's deadline)
    useEffect(() => {
        if (!session || result) return;
        const tick = () => {
            const left = Math.round((session.deadlineMs - (Date.now() + session.offsetMs)) / 1000);
            setRemaining(Math.max(0, left));
            if (left <= 0) handleSubmit(true);
        };
        tick();
        const timer = setInterval(tick, 500);
        return () => clearInterval(timer);
    }, [session, result, handleSubmit]);

    const closeDialog = () => {
        if (session && !result) {
            const ok = window.confirm('آزمون هنوز تمام نشده و زمان در حال گذشت است. خارج می‌شوید؟ (تا پایان زمان می‌توانید ادامه دهید)');
            if (!ok) return;
        }
        setOpen(false);
        if (result) {
            reset();
            router.refresh();
        }
    };

    const questions = session?.questions ?? [];
    const current = questions[index];
    const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
    const totalSeconds = (exam?.durationMinutes ?? 1) * 60;
    const lowTime = remaining <= 60;

    /* ---------------- panel (outside the dialog) ---------------- */

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
                    اگر در زمان مقرر به تعداد لازم پاسخ درست ندهید، ۷ روز امکان شرکت دوباره و درخواست مدرک را ندارید.
                </p>
                <Button onClick={handleStart} disabled={loading} size="sm">
                    {loading ? 'در حال آماده‌سازی...' : state === 'in_progress' ? 'ادامه‌ی آزمون' : 'شروع آزمون'}
                </Button>
            </div>
        );
    }

    return (
        <>
            <div>
                <h6 className="mb-3 text-sm font-semibold text-foreground">{exam?.title ? `آزمون: ${exam.title}` : 'آزمون پایان دوره'}</h6>
                {body}
            </div>

            <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : closeDialog())}>
                <DialogContent
                    className="max-h-[95vh] overflow-y-auto sm:max-w-2xl"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    {result ? (
                        <div className="flex flex-col items-center gap-4 py-6 text-center">
                            <DialogHeader className="items-center">
                                {result.passed ? (
                                    <CheckCircle2 className="h-14 w-14 text-success" />
                                ) : (
                                    <XCircle className="h-14 w-14 text-destructive" />
                                )}
                                <DialogTitle className="text-xl">
                                    {result.passed ? 'تبریک! در آزمون قبول شدید' : result.timedOut ? 'زمان آزمون تمام شد' : 'متأسفانه قبول نشدید'}
                                </DialogTitle>
                                <DialogDescription>
                                    {result.timedOut
                                        ? 'پاسخ‌های شما در مهلت مقرر ثبت نشد.'
                                        : `${fa(result.correctCount)} پاسخ درست از ${fa(result.totalQuestions)} سوال (حداقل لازم: ${fa(result.requiredCorrect)})`}
                                </DialogDescription>
                            </DialogHeader>
                            {result.passed ? (
                                <p className="text-sm text-muted-foreground">اکنون می‌توانید درخواست دریافت مدرک را ثبت کنید.</p>
                            ) : (
                                <Alert variant="destructive" className="text-start">
                                    <Lock className="h-4 w-4" />
                                    <AlertTitle>دسترسی به مدت ۷ روز قفل شد</AlertTitle>
                                    <AlertDescription>
                                        تا <b>{formatFaDate(result.lockedUntil)}</b> نمی‌توانید دوباره در آزمون شرکت کنید یا درخواست مدرک بدهید.
                                        در این مدت دوره را مرور کنید.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Button onClick={closeDialog}>بستن</Button>
                        </div>
                    ) : (
                        current && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center justify-between gap-3 text-base">
                                        <span>
                                            سوال {fa(index + 1)} از {fa(questions.length)}
                                        </span>
                                        <span
                                            className={cn(
                                                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm tabular-nums',
                                                lowTime ? 'border-destructive text-destructive' : 'border-border text-foreground',
                                            )}
                                        >
                                            <Clock className="h-4 w-4" /> {formatClock(remaining)}
                                        </span>
                                    </DialogTitle>
                                    <DialogDescription className="sr-only">آزمون ۴ گزینه‌ای</DialogDescription>
                                </DialogHeader>

                                <Progress value={(remaining / totalSeconds) * 100} className={cn('h-1.5', lowTime && '[&>div]:bg-destructive')} />

                                <h3 className="py-2 text-lg font-medium leading-8">{current.text}</h3>

                                <div className="grid gap-3">
                                    {current.options.map((option, optIndex) => {
                                        const selected = answers[current.id] === optIndex;
                                        return (
                                            <button
                                                key={optIndex}
                                                type="button"
                                                onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: optIndex }))}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-start text-sm transition-colors',
                                                    selected
                                                        ? 'border-primary bg-primary/10 font-semibold text-foreground'
                                                        : 'border-border hover:bg-muted',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs',
                                                        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                                                    )}
                                                >
                                                    {EXAM_OPTION_LABELS[optIndex]}
                                                </span>
                                                <span>{option}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {questions.map((q, i) => (
                                        <button
                                            key={q.id}
                                            type="button"
                                            onClick={() => setIndex(i)}
                                            className={cn(
                                                'h-8 w-8 rounded-md border text-xs transition-colors',
                                                i === index && 'ring-2 ring-primary',
                                                answers[q.id] !== undefined ? 'border-success bg-success/15' : 'border-border',
                                            )}
                                        >
                                            {fa(i + 1)}
                                        </button>
                                    ))}
                                </div>

                                <DialogFooter className="flex-row justify-between gap-3 pt-2 sm:justify-between">
                                    <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)} className="gap-2">
                                        <ArrowRight /> قبلی
                                    </Button>

                                    {index >= questions.length - 1 ? (
                                        <Button
                                            disabled={submitting}
                                            className="gap-2 bg-success text-success-foreground hover:bg-success/90"
                                            onClick={() => {
                                                if (answeredCount < questions.length) {
                                                    const ok = window.confirm(
                                                        `${fa(questions.length - answeredCount)} سوال بی‌پاسخ مانده است. آزمون ثبت نهایی شود؟`,
                                                    );
                                                    if (!ok) return;
                                                }
                                                handleSubmit(false);
                                            }}
                                        >
                                            {submitting ? 'در حال ثبت...' : 'ثبت نهایی'}
                                        </Button>
                                    ) : (
                                        <Button onClick={() => setIndex((i) => i + 1)} className="gap-2">
                                            بعدی <ArrowLeft />
                                        </Button>
                                    )}
                                </DialogFooter>
                            </>
                        )
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
