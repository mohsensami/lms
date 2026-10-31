import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Lock, SearchX } from 'lucide-react';
import { getLoggedInUser } from '@/lib/loggedin-user';
import { hasEnrollmentForCourse } from '@/queries/enrollments';
import { getCourseDetails } from '@/queries/courses';
import { getExamStateForStudent } from '@/lib/exam';
import { formatFaDate } from '@/lib/date';
import { Button } from '@/components/ui/button';
import ExamRunner from './_components/exam-runner';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'آزمون' };

const BACK_HREF = '/account/certificates';

function Notice({ icon: Icon, title, children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
            <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-7 w-7 text-muted-foreground" />
                </div>
                <h1 className="mb-2 text-lg font-bold text-foreground">{title}</h1>
                <div className="mb-6 text-sm leading-7 text-muted-foreground">{children}</div>
                <Button asChild>
                    <Link href={BACK_HREF}>بازگشت به آزمون‌ها و مدارک</Link>
                </Button>
            </div>
        </div>
    );
}

const ExamPage = async ({ params }) => {
    const { courseId } = await params;

    const user = await getLoggedInUser();
    if (!user) redirect('/login');

    const enrolled = await hasEnrollmentForCourse(courseId, user.id);
    if (!enrolled) {
        return (
            <Notice icon={SearchX} title="دسترسی به آزمون ممکن نیست">
                شما در این دوره ثبت‌نام نکرده‌اید.
            </Notice>
        );
    }

    const examState = await getExamStateForStudent(courseId, user.id);

    if (examState.state === 'no_exam') {
        return (
            <Notice icon={SearchX} title="آزمونی وجود ندارد">
                برای این دوره هنوز آزمونی منتشر نشده است.
            </Notice>
        );
    }

    if (examState.state === 'passed') redirect(BACK_HREF);

    if (examState.state === 'locked') {
        return (
            <Notice icon={Lock} title={examState.attempt?.timedOut ? 'زمان آزمون تمام شد' : 'در آزمون قبول نشدید'}>
                شرکت دوباره در آزمون و درخواست مدرک تا <b className="text-foreground">{formatFaDate(examState.lockedUntil)}</b> قفل است.
            </Notice>
        );
    }

    const course = await getCourseDetails(courseId);

    return (
        <ExamRunner
            courseId={courseId}
            courseTitle={course?.title || ''}
            exam={examState.exam}
            resuming={examState.state === 'in_progress'}
            backHref={BACK_HREF}
        />
    );
};

export default ExamPage;
