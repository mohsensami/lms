import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { Video } from 'lucide-react';
import CourseLessonList from './CourseLessonList';

const CourseModuleList = ({ courseId, module, index, isEnrolled, activeLessonSlug }) => {
    const totalDuration = module?.lessonIds.reduce(function (acc, obj) {
        return acc + obj.duration;
    }, 0);

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/40">
            <AccordionItem className="border-none" value={`item-${index + 1}`}>
                <AccordionTrigger className="gap-3 px-5 py-4 text-sm font-bold text-foreground hover:bg-muted/70 hover:no-underline [&[data-state=open]]:bg-primary/5 [&[data-state=open]]:text-primary">
                    <span className="flex items-center gap-3">
                        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                            {index + 1}
                        </span>
                        {module?.title}
                    </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1">
                    <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5 text-primary" />
                            {(totalDuration / 3660).toPrecision(2)} ساعت
                        </span>
                    </div>

                    <div className="mt-4 space-y-1">
                        {module.lessonIds &&
                            module.lessonIds.map((lesson) => (
                                <CourseLessonList
                                    key={lesson.id || lesson._id}
                                    courseId={courseId}
                                    moduleSlug={module.slug}
                                    lesson={lesson}
                                    isEnrolled={isEnrolled}
                                    autoOpen={activeLessonSlug && lesson.slug === activeLessonSlug}
                                />
                            ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </div>
    );
};

export default CourseModuleList;
