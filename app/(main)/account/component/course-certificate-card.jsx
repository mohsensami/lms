import Image from 'next/image';
import { CourseProgress } from '@/components/course-progress';
import { getCourseDetails } from '@/queries/courses';
import { getReport } from '@/queries/reports';
import { getCertificateRequest } from '@/queries/certificateRequests';
import { getExamStateForStudent } from '@/lib/exam';
import { ExamPanel } from './exam-panel';

async function CourseCertificateCard({ enrollment, userId }) {
    const courseId = enrollment?.course?._id;
    if (!courseId) return null;

    const [course, report, certificateRequest, examState] = await Promise.all([
        getCourseDetails(courseId),
        getReport({ course: courseId, student: userId }),
        getCertificateRequest(courseId, userId),
        getExamStateForStudent(courseId, userId),
    ]);

    // Progress is shown for information only: the certificate no longer depends on watching every clip.
    const totalModuleCount = course?.modules?.length ?? 0;
    const totalCompletedModules = report?.totalCompletedModeules ? report.totalCompletedModeules.length : 0;
    const totalProgress = totalModuleCount > 0 ? (totalCompletedModules / totalModuleCount) * 100 : 0;

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
                    <div className="mt-2 max-w-xs">
                        <CourseProgress size="sm" value={totalProgress} variant={totalProgress === 100 ? 'success' : ''} />
                    </div>
                </div>
            </div>

            <div className="mt-4 border-t border-border pt-4">
                <ExamPanel courseId={courseId} examState={examState} certificateStatus={certificateRequest?.status} />
            </div>
        </div>
    );
}

export default CourseCertificateCard;
