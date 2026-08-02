import React from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, GraduationCap, ListChecks, PlayCircle } from 'lucide-react';
import EnrollCourse from '@/components/enroll-course';
import { auth } from '@/auth';
import { getUserByEmail } from '@/queries/users';
import { hasEnrollmentForCourse } from '@/queries/enrollments';
import { PriceDisplay } from '@/components/price-display';
import { CourseProgress } from '@/components/course-progress';
import { getCourseProgressPercent } from '@/lib/course-progress';

const CourseDetailsIntro = async ({ course }) => {
    const session = await auth();
    const loggedInUser = session?.user?.email ? await getUserByEmail(session.user.email) : null;
    const isLoggedIn = Boolean(loggedInUser);
    const hasEnrollment =
        loggedInUser?.id && course?.id ? await hasEnrollmentForCourse(course.id, loggedInUser.id) : false;
    const isFullAccessUser =
        loggedInUser?.role === 'admin' || (loggedInUser?.role === 'instructor' && course?.instructorId === loggedInUser?.id);
    const totalProgress = hasEnrollment ? await getCourseProgressPercent(course, loggedInUser.id) : 0;
    const instructorName = course?.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : 'مدرس';
    const lessonCount = course?.modules?.reduce((sum, module) => sum + (module.lessonIds?.length ?? 0), 0) ?? 0;
    const quizCount = course?.quizSet?.quizIds?.length ?? 0;
    const chapterCount = course?.modules?.length ?? 0;

    return (
        <div className="overflow-x-hidden bg-gradient-to-b from-primary/[0.06] to-transparent">
            <section className="pt-10 pb-4 sm:pt-14">
                <div className="container">
                    {/* breadcrumb */}
                    <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Link href="/" className="hover:text-primary">
                            خانه
                        </Link>
                        <span>/</span>
                        <span href="/courses" className="hover:text-primary">
                            دوره‌ها
                        </span>
                        {course?.title && (
                            <>
                                <span>/</span>
                                <span className="text-foreground">{course?.title}</span>
                            </>
                        )}
                    </div>

                    <div className="grid gap-8 grid-cols-1 xl:grid-cols-12 items-start">
                        {/* main info */}
                        <div className="border border-border bg-card shadow-sm rounded-2xl md:p-6 p-2 col-span-1 xl:col-span-8 space-y-6">
                            {course?.category?.title && (
                                <Badge className="rounded-full border-none bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
                                    {course.category.title}
                                </Badge>
                            )}
                            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                                {course?.title}
                            </h1>
                            {course?.subtitle && (
                                <p className="max-w-2xl text-base leading-8 text-muted-foreground">{course.subtitle}</p>
                            )}
                            <div className="relative aspect-video w-full bg-muted">
                                <Image
                                    className="object-cover"
                                    fill
                                    src={`/assets/images/courses/${course?.thumbnail}`}
                                    alt={course?.title || 'Course image'}
                                />
                            </div>

                            {course?.learning?.length > 0 && (
                                <div className="rounded-2xl border border-border bg-card p-6">
                                    <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                                        <GraduationCap className="h-5 w-5 text-primary" />
                                        آنچه در این دوره یاد می‌گیرید
                                    </h2>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        {course.learning.slice(0, 6).map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-foreground/90"
                                            >
                                                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* sticky purchase box */}
                        <div className="col-span-1 xl:col-span-4 lg:sticky lg:top-24">
                            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                                <div className="space-y-5 p-6">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xs text-muted-foreground">قیمت دوره</span>
                                        <PriceDisplay course={course} priceClassName="text-2xl font-extrabold" originalClassName="text-base" />
                                    </div>

                                    {isFullAccessUser ? (
                                        <div className="space-y-3">
                                            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center text-sm font-semibold text-primary">
                                                شما دسترسی کامل به این دوره دارید
                                            </div>
                                            <Link
                                                href={`/courses/${course?.id}/lesson`}
                                                className={cn(
                                                    buttonVariants({ size: 'lg' }),
                                                    'w-full rounded-xl text-base font-bold shadow-lg shadow-primary/25',
                                                )}
                                            >
                                                ورود به دوره
                                            </Link>
                                        </div>
                                    ) : hasEnrollment ? (
                                        <div className="space-y-3">
                                            <div className="rounded-xl border border-success/30 bg-success/10 p-3 text-center text-sm font-semibold text-success">
                                                این دوره قبلاً خریداری شده است
                                            </div>
                                            <div className="rounded-xl border border-border bg-muted/40 p-3">
                                                <CourseProgress variant="success" value={totalProgress} />
                                            </div>
                                            <Link
                                                href={`/courses/${course?.id}/lesson`}
                                                className={cn(
                                                    buttonVariants({ size: 'lg' }),
                                                    'w-full rounded-xl text-base font-bold shadow-lg shadow-primary/25',
                                                )}
                                            >
                                                ورود به دوره
                                            </Link>
                                        </div>
                                    ) : (
                                        <EnrollCourse courseId={course?.id} isLoggedIn={isLoggedIn} />
                                    )}
                                    <div className="grid grid-cols-3 gap-3 sm:max-w-md">
                                        <div className="rounded-2xl border border-border bg-card p-4 text-center">
                                            <BookOpen className="mx-auto mb-2 h-5 w-5 text-primary" />
                                            <p className="text-sm font-bold text-foreground">{chapterCount}</p>
                                            <p className="text-[11px] text-muted-foreground">سرفصل</p>
                                        </div>
                                        <div className="rounded-2xl border border-border bg-card p-4 text-center">
                                            <PlayCircle className="mx-auto mb-2 h-5 w-5 text-primary" />
                                            <p className="text-sm font-bold text-foreground">{lessonCount}</p>
                                            <p className="text-[11px] text-muted-foreground">جلسه</p>
                                        </div>
                                        <div className="rounded-2xl border border-border bg-card p-4 text-center">
                                            <ListChecks className="mx-auto mb-2 h-5 w-5 text-primary" />
                                            <p className="text-sm font-bold text-foreground">{quizCount}</p>
                                            <p className="text-[11px] text-muted-foreground">آزمون</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 sm:w-fit">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                            {course?.instructor?.firstName?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">مدرس دوره</p>
                                            <p className="text-sm font-bold text-foreground">{instructorName}</p>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 border-t border-border pt-4 text-sm text-muted-foreground">
                                        <li className="flex items-center justify-between">
                                            <span>سرفصل‌ها</span>
                                            <span className="font-semibold text-foreground">{chapterCount}</span>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span>تعداد جلسات</span>
                                            <span className="font-semibold text-foreground">{lessonCount}</span>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span>آزمون‌ها</span>
                                            <span className="font-semibold text-foreground">{quizCount}</span>
                                        </li>
                                    </ul>
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
