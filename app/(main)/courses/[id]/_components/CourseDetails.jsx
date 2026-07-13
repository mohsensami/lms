import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CourseOverview from './CourseOverview';
import CourseCurriculam from './CourseCurriculam';
import CourseInstructor from './CourseInstructor';

const CourseDetails = ({ course, isEnrolled }) => {
    return (
        <section className="py-8 md:py-12">
            <div className="container">
                <div dir="rtl" className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 text-right">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 gap-2 rounded-xl bg-muted p-1">
                            <TabsTrigger
                                className="rounded-lg text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
                                value="overview"
                            >
                                توضیحات دوره
                            </TabsTrigger>
                            <TabsTrigger
                                className="rounded-lg text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
                                value="curriculum"
                            >
                                سرفصل‌ها
                            </TabsTrigger>
                            <TabsTrigger
                                className="rounded-lg text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
                                value="instructor"
                            >
                                مدرس دوره
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6">
                            <CourseOverview course={course} />
                        </TabsContent>

                        <TabsContent value="curriculum" className="mt-6">
                            <CourseCurriculam course={course} isEnrolled={isEnrolled} />
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
