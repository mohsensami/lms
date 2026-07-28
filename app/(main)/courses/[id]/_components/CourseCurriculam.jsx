import React from 'react';
import { BookCheck, Clock10 } from 'lucide-react';
import { Accordion } from '@/components/ui/accordion';

import CourseModuleList from './module/CourseModuleList';
import { getLoggedInUser } from '@/lib/loggedin-user';
import { getModulesWithWatchState } from '@/lib/course-progress';

const CourseCurriculam = async ({ course, isEnrolled, activeLessonSlug }) => {
    const totalDuration = course?.modules
        .map((item) => {
            return item.lessonIds.reduce(function (acc, obj) {
                return acc + obj.duration;
            }, 0);
        })
        .reduce(function (acc, obj) {
            return acc + obj;
        }, 0);

    const loggedInUser = isEnrolled ? await getLoggedInUser() : null;
    const modules = loggedInUser
        ? await getModulesWithWatchState(course, loggedInUser.id)
        : (course?.modules ?? []);

    const expandedModule = activeLessonSlug
        ? modules.findIndex((module) => module.lessonIds?.some((lesson) => lesson.slug === activeLessonSlug))
        : -1;
    const defaultOpen = expandedModule >= 0 ? [`item-${expandedModule + 1}`] : [];

    return (
        <div>
            <h3 className="text-xl font-bold text-foreground">سرفصل‌های دوره</h3>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                    <BookCheck className="h-3.5 w-3.5 text-primary" />
                    {course?.modules?.length} سرفصل
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                    <Clock10 className="h-3.5 w-3.5 text-primary" />
                    {(totalDuration / 3660).toPrecision(2)}+ ساعت
                </span>
            </div>

            <Accordion defaultValue={defaultOpen} type="multiple" className="mt-6 w-full space-y-3">
                {modules.map((module, index) => (
                    <CourseModuleList
                        key={module.id || module._id || index}
                        courseId={course?.id}
                        module={module}
                        index={index}
                        isEnrolled={isEnrolled}
                        activeLessonSlug={activeLessonSlug}
                    />
                ))}
            </Accordion>
        </div>
    );
};

export default CourseCurriculam;
