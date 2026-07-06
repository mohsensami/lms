import React from 'react';
import { BookCheck, Clock10, Radio } from 'lucide-react';
import { Accordion } from '@/components/ui/accordion';

import CourseModuleList from './module/CourseModuleList';

const CourseCurriculam = ({ course }) => {
    const totalDuration = course?.modules
        .map((item) => {
            return item.lessonIds.reduce(function (acc, obj) {
                return acc + obj.duration;
            }, 0);
        })
        .reduce(function (acc, obj) {
            return acc + obj;
        }, 0);

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
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                    <Radio className="h-3.5 w-3.5 text-primary" />4 کلاس زنده
                </span>
            </div>

            <Accordion
                defaultValue={course?.modules?.map((module, index) => `item-${index + 1}`)}
                type="multiple"
                collapsible
                className="mt-6 w-full space-y-3"
            >
                {course?.modules &&
                    course.modules.map((module, index) => (
                        <CourseModuleList key={module.id || index} module={module} index={index} />
                    ))}
            </Accordion>
        </div>
    );
};

export default CourseCurriculam;
