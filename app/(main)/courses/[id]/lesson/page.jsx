import Link from 'next/link';
import { getCourseDetails } from '@/queries/courses';
import CourseCurriculam from '../_components/CourseCurriculam';
import { GiveReview } from './_components/give-review';
import { getLoggedInUser } from '@/lib/loggedin-user';

const LessonPage = async ({ params, searchParams }) => {
    const { id } = await params;
    const { name: activeLessonSlug } = await searchParams;

    const course = await getCourseDetails(id);
    const loggedinUser = await getLoggedInUser();

    const totalLessons = course?.modules?.reduce((sum, module) => sum + (module.lessonIds?.length ?? 0), 0);
    const quizCount = course?.quizSet?.quizIds?.length ?? 0;
    const instructorName = course?.instructor
        ? `${course.instructor.firstName} ${course.instructor.lastName}`
        : 'مدرس';
    const categoryName = course?.category?.title ?? 'دوره';

    return (
        <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                        {categoryName}
                    </div>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{course.title}</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{course.subtitle}</p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
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
                </div>

                {/* Curriculum accordion — click any lesson to watch it in a modal */}
                <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                    <CourseCurriculam course={course} isEnrolled activeLessonSlug={activeLessonSlug} />
                </div>

                {/* Quiz / certificate pointer */}
                <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm text-sm text-slate-600">
                    برای شرکت در آزمون پایانی و دریافت مدرک این دوره، به بخش{' '}
                    <Link href="/account/certificates" className="font-semibold text-primary underline">
                        آزمون‌ها و مدارک من
                    </Link>{' '}
                    در پروفایل خود مراجعه کنید.
                </div>

                {/* Review */}
                <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                    <GiveReview courseId={id} loginid={loggedinUser.id} />
                </div>
            </div>
        </div>
    );
};

export default LessonPage;
