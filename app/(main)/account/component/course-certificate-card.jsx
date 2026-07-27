import Image from 'next/image';
import { CourseProgress } from '@/components/course-progress';
import { getCourseDetails } from '@/queries/courses';
import { getReport } from '@/queries/reports';
import { getCertificateRequest } from '@/queries/certificateRequests';
import { getQuizScore } from '@/lib/quiz-score';
import Quiz from './quiz';
import { DownloadCertificate } from './download-certificate';

function sanitizeData(data) {
    if (data == null) return data;

    return JSON.parse(
        JSON.stringify(data, (key, value) => {
            if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
                return value.toString('base64');
            }
            return value;
        }),
    );
}

async function CourseCertificateCard({ enrollment, userId }) {
    const courseId = enrollment?.course?._id;
    if (!courseId) return null;

    const course = await getCourseDetails(courseId);
    const report = await getReport({ course: courseId, student: userId });

    const totalModuleCount = course?.modules?.length ?? 0;
    const totalCompletedModules = report?.totalCompletedModeules ? report.totalCompletedModeules.length : 0;
    const totalProgress = totalModuleCount > 0 ? (totalCompletedModules / totalModuleCount) * 100 : 0;

    const isQuizComplete = Boolean(report?.quizAssessment);
    const quizScore = report?.quizAssessment ? getQuizScore(report.quizAssessment) : null;
    const quizSet = course?.quizSet ? sanitizeData(course.quizSet) : null;
    const certificateRequest = await getCertificateRequest(courseId, userId);

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
                <div className="shrink-0">
                    <DownloadCertificate
                        courseId={courseId}
                        totalProgress={totalProgress}
                        requestStatus={certificateRequest?.status}
                    />
                </div>
            </div>

            {quizSet && (
                <div className="mt-4 border-t border-border pt-4">
                    <Quiz courseId={courseId} quizSet={quizSet} isTaken={isQuizComplete} score={quizScore} />
                </div>
            )}
        </div>
    );
}

export default CourseCertificateCard;
