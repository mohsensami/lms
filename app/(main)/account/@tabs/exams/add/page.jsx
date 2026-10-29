import { requireRole } from '@/lib/require-role';
import { getCoursesForExamSelect } from '@/queries/exams';
import { ExamForm } from '../_components/exam-form';

const AddExamPage = async () => {
    await requireRole('admin');
    const courseOptions = await getCoursesForExamSelect();

    return (
        <div className="p-6">
            <h1 className="mb-6 text-xl font-bold">ساخت آزمون جدید</h1>
            {courseOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">همه‌ی دوره‌ها آزمون دارند (یا هنوز دوره‌ای ساخته نشده است).</p>
            ) : (
                <ExamForm courseOptions={courseOptions} />
            )}
        </div>
    );
};

export default AddExamPage;
