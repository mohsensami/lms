import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/formatPrice';
import { getAllCoursesDashboardData } from '@/queries/courses';
import { getEnrollmentsForUser } from '@/queries/enrollments';
import { getTestimonialsForUser } from '@/queries/testimonials';
import { getPostCommentsForUser } from '@/queries/postComments';
import { getReportsForUser } from '@/queries/reports';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';

function StatCard({ title, value }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

async function StudentDashboard({ user }) {
    const [enrollments, courseComments, postComments, reports] = await Promise.all([
        getEnrollmentsForUser(user.id),
        getTestimonialsForUser(user.id),
        getPostCommentsForUser(user.id),
        getReportsForUser(user.id),
    ]);

    const passedExamCount = (
        await prisma.examAttempt.findMany({ where: { studentId: user.id, status: 'passed' }, select: { examId: true } })
    ).length;
    const completedCourseCount = reports.filter((r) => r.completion_date).length;
    const totalComments = courseComments.length + postComments.length;

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="دوره‌های ثبت‌نامی" value={enrollments.length} />
            <StatCard title="آزمون‌های قبول‌شده" value={passedExamCount} />
            <StatCard title="دیدگاه‌های ثبت‌شده" value={totalComments} />
            <StatCard title="دوره‌های تکمیل‌شده" value={completedCourseCount} />
        </div>
    );
}

async function AdminDashboard() {
    const courseStatus = await getAllCoursesDashboardData();

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="کل دوره‌های سایت" value={courseStatus?.courses} />
            <StatCard title="کل ثبت‌نام‌ها" value={courseStatus?.enrollments} />
            <StatCard title="کل درآمد" value={formatPrice(courseStatus?.revenue)} />
        </div>
    );
}

const DashboardPage = async () => {
    // Both roles have a dashboard — the guard just ensures the person is
    // logged in. Only an explicit admin gets the admin view; anything else
    // is treated as a student.
    const user = await requireRole('student');

    return (
        <div className="p-6">
            {user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard user={user} />}
        </div>
    );
};

export default DashboardPage;
