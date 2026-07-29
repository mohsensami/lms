import { requireRole } from '@/lib/require-role';
import { getStudentsOverview } from '@/queries/studentOverview';
import StudentOverviewCard from '../../component/student-overview-card';

export const dynamic = 'force-dynamic';

const StudentsPage = async () => {
    const user = await requireRole('instructor');
    const students = await getStudentsOverview(user);

    return (
        <div className="p-6">
            <div className="flex flex-col gap-4">
                {students.length > 0 ? (
                    students.map((overview) => <StudentOverviewCard key={overview.student.id} overview={overview} />)
                ) : (
                    <div className="font-bold bg-red-400 text-white p-2 w-100">هنوز هیچ دانشجویی در دوره‌های شما ثبت‌نام نکرده است!</div>
                )}
            </div>
        </div>
    );
};

export default StudentsPage;
