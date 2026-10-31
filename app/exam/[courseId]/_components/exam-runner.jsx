'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, ListChecks, Lock, LogOut, Target, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExamTimer } from '@/components/exam-timer';
import { startExamAttempt, submitExamAttempt } from '@/app/actions/exam';
import { EXAM_OPTION_LABELS, EXAM_RETRY_LOCK_DAYS } from '@/lib/exam-constants';
import { formatFaDate } from '@/lib/date';
import { cn } from '@/lib/utils';

const fa = (n) => Number(n).toLocaleString('fa-IR');

function Shell({ children }) {
    return <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">{children}</div>;
}

function Stat({ icon: Icon, label, value }) {
    return (
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-background/60 px-3 py-4">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-lg font-extrabold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

export default function ExamRunner({ courseId, courseTitle, exam, resuming, backHref }) {
    const router = useRouter();

    const [phase, setPhase] = useState('intro'); // intro | running | result
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState(null); // { attemptId, deadlineMs, offsetMs, questions }
    const [answers, setAnswers] = useState({});
    const [index, setIndex] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const submittedRef = useRef(false);

    const totalSeconds = exam.durationMinutes * 60;

    async function handleStart() {
        setLoading(true);
        const res = await startExamAttempt(courseId);
        setLoading(false);
        if (!res?.ok) {
            toast.error(res?.error || 'مشکلی پیش آمد');
            router.refresh(); // e.g. locked meanwhile -> the page shows the lock notice
            return;
        }
        const deadlineMs = new Date(res.deadline).getTime();
        const offsetMs = new Date(res.serverNow).getTime() - Date.now(); // server clock - browser clock
        submittedRef.current = false;
        setAnswers({});
        setIndex(0);
        setSession({ attemptId: res.attemptId, deadlineMs, offsetMs, questions: res.questions });
        setRemaining(Math.max(0, Math.round((deadlineMs - (Date.now() + offsetMs)) / 1000)));
        setPhase('running');
        window.scrollTo({ top: 0 });
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
            setPhase('result');
            window.scrollTo({ top: 0 });
        },
        [session, answers],
    );

    // Countdown, driven by the server's deadline (not the browser clock).
    useEffect(() => {
        if (phase !== 'running' || !session) return undefined;
        const tick = () => {
            const left = Math.round((session.deadlineMs - (Date.now() + session.offsetMs)) / 1000);
            setRemaining(Math.max(0, left));
            if (left <= 0) handleSubmit(true);
        };
        tick();
        const timer = setInterval(tick, 500);
        return () => clearInterval(timer);
    }, [phase, session, handleSubmit]);

    // Warn before closing / reloading the tab mid-exam.
    useEffect(() => {
        if (phase !== 'running') return undefined;
        const warn = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [phase]);

    const questions = session?.questions ?? [];
    const current = questions[index];
    const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

    // Keys 1-4 pick an option.
    useEffect(() => {
        if (phase !== 'running' || !current) return undefined;
        const onKey = (e) => {
            if (e.target instanceof HTMLElement && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
            const n = Number(e.key.replace(/[۱۲۳۴]/g, (d) => '۱۲۳۴'.indexOf(d) + 1));
            if (n >= 1 && n <= current.options.length) setAnswers((prev) => ({ ...prev, [current.id]: n - 1 }));
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [phase, current]);

    const leave = () => {
        if (phase === 'running') {
            const ok = window.confirm('آزمون هنوز تمام نشده و زمان همچنان می‌گذرد. خارج می‌شوید؟ (تا پایان زمان می‌توانید دوباره وارد شوید و ادامه دهید)');
            if (!ok) return;
        }
        router.push(backHref);
        router.refresh();
    };

    /* ------------------------------ intro ------------------------------ */
    if (phase === 'intro') {
        return (
            <Shell>
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-10">
                        <p className="mb-1 text-center text-sm text-muted-foreground">{courseTitle}</p>
                        <h1 className="mb-2 text-center text-2xl font-extrabold text-foreground">{exam.title}</h1>
                        {exam.description && (
                            <p className="mb-6 text-center text-sm leading-7 text-muted-foreground">{exam.description}</p>
                        )}

                        <div className="my-6 grid grid-cols-3 gap-3">
                            <Stat icon={ListChecks} label="سوال ۴ گزینه‌ای" value={fa(exam.questionCount)} />
                            <Stat icon={Clock} label="دقیقه زمان" value={fa(exam.durationMinutes)} />
                            <Stat icon={Target} label="حداقل پاسخ درست" value={fa(exam.requiredCorrect)} />
                        </div>

                        <Alert className="mb-6">
                            <Clock className="h-4 w-4" />
                            <AlertTitle>قبل از شروع</AlertTitle>
                            <AlertDescription>
                                با زدن «شروع آزمون» تایمر شروع می‌شود و متوقف نمی‌شود، حتی اگر صفحه را ببندید. اگر در زمان مقرر به تعداد
                                لازم پاسخ درست ندهید، {fa(EXAM_RETRY_LOCK_DAYS)} روز امکان شرکت دوباره و درخواست مدرک را ندارید.
                            </AlertDescription>
                        </Alert>

                        {resuming && (
                            <p className="mb-4 text-center text-sm font-medium text-amber-600">
                                آزمون شما هنوز در جریان است؛ با زدن دکمه از همان‌جا ادامه می‌دهید.
                            </p>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row-reverse">
                            <Button size="lg" className="flex-1" onClick={handleStart} disabled={loading}>
                                {loading ? 'در حال آماده‌سازی...' : resuming ? 'ادامه‌ی آزمون' : 'شروع آزمون'}
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href={backHref}>بازگشت</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </Shell>
        );
    }

    /* ------------------------------ result ------------------------------ */
    if (phase === 'result' && result) {
        return (
            <Shell>
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
                        {result.passed ? (
                            <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
                        ) : (
                            <XCircle className="mx-auto h-16 w-16 text-destructive" />
                        )}
                        <h1 className="mt-4 text-2xl font-extrabold text-foreground">
                            {result.passed ? 'تبریک! در آزمون قبول شدید' : result.timedOut ? 'زمان آزمون تمام شد' : 'متأسفانه قبول نشدید'}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {result.timedOut
                                ? 'پاسخ‌های شما در مهلت مقرر ثبت نشد.'
                                : `${fa(result.correctCount)} پاسخ درست از ${fa(result.totalQuestions)} سوال (حداقل لازم: ${fa(result.requiredCorrect)})`}
                        </p>

                        {result.passed ? (
                            <p className="mt-4 text-sm text-muted-foreground">اکنون می‌توانید درخواست دریافت مدرک را ثبت کنید.</p>
                        ) : (
                            <Alert variant="destructive" className="mt-5 text-start">
                                <Lock className="h-4 w-4" />
                                <AlertTitle>دسترسی به مدت {fa(EXAM_RETRY_LOCK_DAYS)} روز قفل شد</AlertTitle>
                                <AlertDescription>
                                    تا <b>{formatFaDate(result.lockedUntil)}</b> نمی‌توانید دوباره در آزمون شرکت کنید یا درخواست مدرک بدهید.
                                    در این مدت دوره را مرور کنید.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            size="lg"
                            className="mt-6 w-full"
                            onClick={() => {
                                router.push(backHref);
                                router.refresh();
                            }}
                        >
                            {result.passed ? 'ادامه و درخواست مدرک' : 'بازگشت'}
                        </Button>
                    </div>
                </div>
            </Shell>
        );
    }

    /* ------------------------------ running ------------------------------ */
    if (!current) return null;

    const isLast = index >= questions.length - 1;

    return (
        <Shell>
            <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">{courseTitle}</p>
                        <h1 className="truncate text-sm font-bold text-foreground sm:text-base">{exam.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <ExamTimer remaining={remaining} total={totalSeconds} size={84} />
                        <Button variant="ghost" size="icon" onClick={leave} title="خروج موقت از آزمون">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_260px]">
                {/* Question */}
                <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
                    <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            سوال {fa(index + 1)} از {fa(questions.length)}
                        </span>
                        <span>
                            {fa(answeredCount)} از {fa(questions.length)} پاسخ داده شده
                        </span>
                    </div>
                    <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                        />
                    </div>

                    <h2 className="mb-6 text-lg font-bold leading-9 text-foreground sm:text-xl">{current.text}</h2>

                    <div className="grid gap-3">
                        {current.options.map((option, optIndex) => {
                            const selected = answers[current.id] === optIndex;
                            return (
                                <button
                                    key={optIndex}
                                    type="button"
                                    onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: optIndex }))}
                                    className={cn(
                                        'flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-start text-sm transition-all sm:text-base',
                                        selected
                                            ? 'border-primary bg-primary/10 font-semibold shadow-sm'
                                            : 'border-border hover:border-primary/40 hover:bg-muted/60',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm',
                                            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
                                        )}
                                    >
                                        {EXAM_OPTION_LABELS[optIndex]}
                                    </span>
                                    <span className="leading-7">{option}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-3">
                        <Button variant="outline" size="lg" disabled={index === 0} onClick={() => setIndex((i) => i - 1)} className="gap-2">
                            <ArrowRight className="h-4 w-4" /> قبلی
                        </Button>

                        {isLast ? (
                            <Button
                                size="lg"
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
                                {submitting ? 'در حال ثبت...' : 'ثبت نهایی آزمون'}
                            </Button>
                        ) : (
                            <Button size="lg" onClick={() => setIndex((i) => i + 1)} className="gap-2">
                                بعدی <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </section>

                {/* Question map */}
                <aside className="h-fit rounded-3xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24">
                    <h3 className="mb-3 text-sm font-bold text-foreground">پیمایش سوال‌ها</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, i) => (
                            <button
                                key={q.id}
                                type="button"
                                onClick={() => setIndex(i)}
                                className={cn(
                                    'h-9 rounded-lg border text-xs font-medium transition-colors',
                                    i === index && 'ring-2 ring-primary ring-offset-1',
                                    answers[q.id] !== undefined ? 'border-success bg-success/15 text-foreground' : 'border-border text-muted-foreground hover:bg-muted',
                                )}
                            >
                                {fa(i + 1)}
                            </button>
                        ))}
                    </div>
                    <p className="mt-4 text-xs leading-6 text-muted-foreground">
                        می‌توانید با کلیدهای ۱ تا ۴ هم گزینه را انتخاب کنید. با پایان زمان، آزمون خودکار ثبت می‌شود.
                    </p>
                </aside>
            </div>
        </Shell>
    );
}
