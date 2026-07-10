import { CourseProgress } from '@/components/course-progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ReviewModal } from './review-modal';
import { DownloadCertificate } from './download-certificate';
import { GiveReview } from './give-review';
import { SidebarModules } from './sidebar-modules';
import { getCourseDetails } from '@/queries/courses';
import { getLoggedInUser } from '@/lib/loggedin-user';
import { prisma } from '@/lib/prisma';
import { getReport } from '@/queries/reports';
import Quiz from './quiz';

export const CourseSidebar = async ({ courseId }) => {
    const course = await getCourseDetails(courseId);
    const loggedinUser = await getLoggedInUser();

    const report = await getReport({
        course: courseId,
        student: loggedinUser.id,
    });

    const totalCompletedModules = report?.totalCompletedModeules ? report?.totalCompletedModeules.length : 0;
    const totalModules = course?.modules ? course.modules.length : 0;
    const totalProgress = totalModules > 0 ? (totalCompletedModules / totalModules) * 100 : 0;
    const totalLessons = course?.modules?.reduce((sum, module) => sum + (module.lessonIds?.length ?? 0), 0);
    const quizCount = course?.quizSet?.quizIds?.length ?? 0;

    const updatedModules = await Promise.all(
        course?.modules.map(async (module) => {
            const moduleId = module._id.toString();
            const lessons = module?.lessonIds;

            const updatedLessons = await Promise.all(
                lessons.map(async (lesson) => {
                    const lessonId = lesson._id.toString();
                    const watch = await prisma.watch.findFirst({
                        where: {
                            lessonId: lessonId,
                            moduleId: moduleId,
                            userId: loggedinUser.id,
                        },
                    });
                    if (watch?.state === 'completed') {
                        lesson.state = 'completed';
                    }
                    return lesson;
                }),
            );
            return module;
        }),
    );

    const updatedallModules = sanitizeData(updatedModules);

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

    const quizSetall = course?.quizSet;
    const isQuizComplete = report?.quizAssessment ? true : false;
    const quizSet = sanitizeData(quizSetall);

    return (
        <div className="flex flex-col gap-6">
            <div className="sticky top-[calc(100px)] space-y-6">
                <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {course?.category?.title ?? 'Course'}
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold text-slate-900">{course.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{course.subtitle}</p>
                    <div className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                        <div className="rounded-3xl bg-slate-50 p-4">
                            <p className="text-slate-500">Lessons</p>
                            <p className="mt-2 font-semibold text-slate-900">{totalLessons}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-50 p-4">
                            <p className="text-slate-500">Quizzes</p>
                            <p className="mt-2 font-semibold text-slate-900">{quizCount}</p>
                        </div>
                    </div>
                    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <CourseProgress variant="success" value={totalProgress} />
                    </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                    <SidebarModules courseId={courseId} modules={updatedallModules} />
                </div>

                {quizSet && (
                    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                        <Quiz courseId={courseId} quizSet={quizSet} isTaken={isQuizComplete} />
                    </div>
                )}

                <div className="space-y-4">
                    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                        <GiveReview courseId={courseId} loginid={loggedinUser.id} />
                    </div>
                    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                        <DownloadCertificate courseId={courseId} totalProgress={totalProgress} />
                    </div>
                </div>
            </div>
        </div>
    );
};
