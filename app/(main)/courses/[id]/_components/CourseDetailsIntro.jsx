import React from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import EnrollCourse from '@/components/enroll-course';
import { auth } from '@/auth';
import { getUserByEmail } from '@/queries/users';
import { hasEnrollmentForCourse } from '@/queries/enrollments';

const CourseDetailsIntro = async ({ course }) => {
    const session = await auth();
    const loggedInUser = session?.user?.email ? await getUserByEmail(session.user.email) : null;
    const hasEnrollment =
        loggedInUser?.id && course?.id ? await hasEnrollmentForCourse(course.id, loggedInUser.id) : false;
    const instructorName = course?.instructor
        ? `${course.instructor.firstName} ${course.instructor.lastName}`
        : 'Instructor';
    const lessonCount = course?.modules?.reduce((sum, module) => sum + (module.lessonIds?.length ?? 0), 0) ?? 0;
    const quizCount = course?.quizSet?.quizIds?.length ?? 0;

    return (
        <div className="overflow-x-hidden grainy">
            <section className="pt-12 sm:pt-16">
                <div className="container">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.9fr] items-center">
                            <div className="space-y-6">
                                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{course?.subtitle}</p>
                                <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                    {course?.title}
                                </h1>
                                <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-600">
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-slate-500">Instructor</p>
                                        <p className="mt-2 font-semibold text-slate-900">{instructorName}</p>
                                    </div>
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-slate-500">Lessons</p>
                                        <p className="mt-2 font-semibold text-slate-900">{lessonCount}</p>
                                    </div>
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-slate-500">Quizzes</p>
                                        <p className="mt-2 font-semibold text-slate-900">{quizCount}</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                                    {hasEnrollment ? (
                                        <Link
                                            href={`/courses/${course?.id}/lesson`}
                                            className={cn(buttonVariants({ size: 'lg' }))}
                                        >
                                            Access Course
                                        </Link>
                                    ) : (
                                        <EnrollCourse courseId={course?.id} />
                                    )}
                                    <Link href="" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
                                        نمایش پیشنمایش
                                    </Link>
                                    <Link
                                        href=""
                                        className={cn(buttonVariants({ variant: 'destructive', size: 'lg' }))}
                                    >
                                        قیمت دوره : ${course?.price}
                                    </Link>
                                </div>
                                {course?.learning?.length > 0 && (
                                    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            آنچه در این دوره یاد می‌گیرید
                                        </h2>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            {course.learning.slice(0, 4).map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm"
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <div className="aspect-[4/3] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-sm">
                                    <Image
                                        className="object-cover"
                                        fill
                                        src={`/assets/images/courses/${course?.thumbnail}`}
                                        alt={course?.title || 'Course image'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CourseDetailsIntro;
