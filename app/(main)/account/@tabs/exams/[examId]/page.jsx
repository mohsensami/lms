import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/require-role';
import { getCoursesForExamSelect, getExamForEdit } from '@/queries/exams';
import { ExamForm } from '../_components/exam-form';

const EditExamPage = async ({ params }) => {
    await requireRole('admin');
    const { examId } = await params;
    const exam = await getExamForEdit(examId);
    if (!exam) notFound();
    const courseOptions = await getCoursesForExamSelect(exam.courseId);

    return (
        <div className="p-6">
            <h1 className="mb-6 text-xl font-bold">ویرایش آزمون</h1>
            <ExamForm exam={exam} courseOptions={courseOptions} />
        </div>
    );
};

export default EditExamPage;
