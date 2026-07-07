import VideoDescription from './_components/video-description';
import { getCourseDetails } from '@/queries/courses';
import { replaceMongoIdInArray, replaceMongoIdInObject } from '@/lib/convertData';
import { getLessonBySlug } from '@/queries/lessons';
import { LessonVideo } from './_components/lesson-video';

const Course = async ({ params, searchParams }) => {
    const { id } = await params;
    const { name, module } = await searchParams;

    const course = await getCourseDetails(id);
    const allModules = replaceMongoIdInArray(course.modules).toSorted((a, b) => a.order - b.order);

    const defaultLesson = replaceMongoIdInObject(allModules[0]?.lessonIds?.toSorted((a, b) => a.order - b.order)[0]);

    const lessonToPay = name ? await getLessonBySlug(name) : defaultLesson;

    const defaultModule = module ?? allModules[0].slug;
    const totalLessons = allModules.reduce((sum, item) => sum + (item.lessonIds?.length ?? 0), 0);
    const quizCount = course?.quizSet?.quizIds?.length ?? 0;
    const instructorName = course?.instructor
        ? `${course.instructor.firstName} ${course.instructor.lastName}`
        : 'Instructor';
    const categoryName = course?.category?.title ?? 'Course';
    const learningOutcomes = Array.isArray(course?.learning) ? course.learning.slice(0, 4) : [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="">
                <section className="space-y-6">
                    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm">
                        <div className="flex flex-col gap-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                                {categoryName}
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{course.title}</h1>
                                <p className="max-w-3xl text-sm leading-7 text-slate-600">{course.subtitle}</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                    <p className="font-semibold text-slate-900">مدرس</p>
                                    <p className="mt-2 text-sm text-slate-600">{instructorName}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                    <p className="font-semibold text-slate-900">دروس</p>
                                    <p className="mt-2 text-sm text-slate-600">{totalLessons}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                    <p className="font-semibold text-slate-900">آزمون</p>
                                    <p className="mt-2 text-sm text-slate-600">{quizCount}</p>
                                </div>
                            </div>
                            {learningOutcomes.length > 0 && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {learningOutcomes.map((item, index) => (
                                        <div
                                            key={index}
                                            className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm"
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                                    این درس
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{lessonToPay.title}</h2>
                            </div>
                        </div>
                        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-900/5 p-1">
                            <div className="overflow-hidden rounded-3xl bg-slate-950">
                                <LessonVideo courseId={id} lesson={lessonToPay} module={defaultModule} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">توضیحات درس</h3>
                                <p className="mt-2 text-sm text-slate-600">
                                    هر آنچه که باید در مورد این سخنرانی بدانید.
                                </p>
                            </div>
                        </div>
                        <VideoDescription description={lessonToPay.description} />
                    </div>
                </section>
            </div>
        </div>
    );
};
export default Course;
