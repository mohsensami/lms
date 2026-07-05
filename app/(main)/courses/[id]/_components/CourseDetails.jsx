import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CourseOverview from './CourseOverview';
import CourseCurriculam from './CourseCurriculam';
import CourseInstructor from './CourseInstructor';
import Image from 'next/image';
import { formatMyDate } from '@/lib/date';

const CourseDetails = ({ course }) => {
    const lastModifiedDate = formatMyDate(course.modifiedOn);

    return (
        <section className="py-8 md:py-12 lg:py-24">
            <div className="container">
                <div className="grid gap-10 lg:grid-cols-[1.4fr_0.85fr] items-start">
                    <div>
                        <span className="inline-flex rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                            {course?.category?.title}
                        </span>
                        <h3 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                            {course?.title}
                        </h3>
                        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{course?.subtitle}</p>
                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">Instructor</p>
                                <p className="mt-2 font-semibold text-slate-900">
                                    {course?.instructor?.firstName} {course?.instructor?.lastName}
                                </p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">Last updated</p>
                                <p className="mt-2 font-semibold text-slate-900">{lastModifiedDate}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Image
                                className="rounded-full object-cover"
                                src={course?.instructor?.profilePicture}
                                alt={course?.instructor?.firstName}
                                width={56}
                                height={56}
                            />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    {course?.instructor?.firstName} {course?.instructor?.lastName}
                                </p>
                                <p className="text-sm text-slate-600">{course?.instructor?.designation}</p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-3 text-sm text-slate-700">
                            <p>
                                <span className="font-semibold text-slate-900">Level:</span> Intermediate
                            </p>
                            <p>
                                <span className="font-semibold text-slate-900">Duration:</span>{' '}
                                {course?.modules?.length ?? 0} chapters
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-1">
                            <TabsTrigger
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-3xl"
                                value="overview"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-3xl"
                                value="curriculum"
                            >
                                Curriculum
                            </TabsTrigger>
                            <TabsTrigger
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-3xl"
                                value="instructor"
                            >
                                Instructor
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6">
                            <CourseOverview course={course} />
                        </TabsContent>

                        <TabsContent value="curriculum" className="mt-6">
                            <CourseCurriculam course={course} />
                        </TabsContent>
                        <TabsContent value="instructor" className="mt-6">
                            <CourseInstructor course={course} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </section>
    );
};

export default CourseDetails;
