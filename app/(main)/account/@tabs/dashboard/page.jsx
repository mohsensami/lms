import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/formatPrice';
import { getCourseDetailsByInstructor, getAllCoursesDashboardData } from '@/queries/courses';
import { requireRole } from '@/lib/require-role';
formatPrice;

const DashboardPage = async () => {
    const user = await requireRole('instructor');

    const courseStatus =
        user?.role === 'admin' ? await getAllCoursesDashboardData() : await getCourseDetailsByInstructor(user?.id);
    // console.log(courseStatus);

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* total courses */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">کل دوره ها</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courseStatus?.courses}</div>
                    </CardContent>
                </Card>
                {/* total enrollments */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">کل ثبت‌نام‌ها</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courseStatus?.enrollments}</div>
                    </CardContent>
                </Card>
                {/* total revinue */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">کل درآمد</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(courseStatus?.revenue)}</div>
                    </CardContent>
                </Card>
            </div>
            {/*  */}
        </div>
    );
};

export default DashboardPage;
