import Image from 'next/image';
import { getCourseDetails } from '@/queries/courses';
import { getCertificateRequest } from '@/queries/certificateRequests';
import { getExamStateForStudent } from '@/lib/exam';
import { ExamPanel } from './exam-panel';

async function CourseCertificateCard({ enrollment, userId }) {
    const courseId = enrollment?.course?._id;
    if (!courseId) return null;

    const [course, certificateRequest, examState] = await Promise.all([
        getCourseDetails(courseId),
        getCertificateRequest(courseId, userId),
        getExamStateForStudent(courseId, userId),
    ]);

    return (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {course?.thumbnail && (
                        <Image
                            src={`/assets/images/courses/${course.thumbnail}`}
                            alt={course?.title || ''}
                            fill
                            className="object-cover"
                        />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h6 className="truncate font-semibold text-foreground">{course?.title}</h6>
                </div>
            </div>

            <div className="mt-4 border-t border-border pt-4">
                <ExamPanel courseId={courseId} examState={examState} certificateStatus={certificateRequest?.status} />
            </div>
        </div>
    );
}

export default CourseCertificateCard;
