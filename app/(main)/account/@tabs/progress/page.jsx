import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/require-role';
import { getEnrollmentsForUser } from '@/queries/enrollments';
import { getReportsForUser } from '@/queries/reports';
import { summarizeCourseProgress } from '@/lib/progress';
import { ProgressPie } from '@/components/progress-pie';
import { CourseProgressList } from '@/components/course-progress-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

const toFa = (n) => Number(n).toLocaleString('fa-IR');

// "پیشرفت من": a pie chart of the courses the student has passed (vs. in
// progress / not started), plus a bar per course. Student-only menu item.
const ProgressPage = async () => {
    const user = await requireRole('student');
    // Student-only page: admins manage everyone's progress from /account/users.
    if (user.role === 'admin') redirect('/account/users');
    const [enrollments, reports] = await Promise.all([getEnrollmentsForUser(user.id), getReportsForUser(user.id)]);
    const { courses, counts, total, averagePercent } = summarizeCourseProgress(enrollments, reports);

    if (total === 0) {
        return (
            <div className="p-6">
                <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                    <p className="font-semibold text-foreground">هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        بعد از ثبت‌نام در یک دوره، پیشرفت شما اینجا نمایش داده می‌شود.
                    </p>
                    <Link href="/courses" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
                        مشاهده‌ی دوره‌ها
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">دوره‌هایی که گذرانده‌ام</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-2">
                        <ProgressPie counts={counts} total={total} />
                    </div>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        میانگین پیشرفت در همه‌ی دوره‌ها: <span className="font-bold text-foreground">{toFa(averagePercent)}٪</span>
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">پیشرفت در هر دوره</CardTitle>
                </CardHeader>
                <CardContent>
                    <CourseProgressList courses={courses} />
                </CardContent>
            </Card>
        </div>
    );
};

export default ProgressPage;
