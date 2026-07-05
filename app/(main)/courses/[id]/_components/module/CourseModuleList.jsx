import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { Radio } from 'lucide-react';

import { Video } from 'lucide-react';
import { NotepadText } from 'lucide-react';
import { FileQuestion } from 'lucide-react';
import CourseLessonList from './CourseLessonList';

const CourseModuleList = ({ module, index }) => {
    const totalDuration = module?.lessonIds.reduce(function (acc, obj) {
        return acc + obj.duration;
    }, 0);

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
            <AccordionItem className="border-none" value={`item-${index + 1}`}>
                <AccordionTrigger className="flex items-center justify-between gap-3 px-5 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-100">
                    {module?.title}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-3">
                    <div className="flex flex-wrap gap-5 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5">
                            <Video className="w-4 h-4" />
                            {(totalDuration / 3660).toPrecision(2)} Hours
                        </span>
                        <span className="flex items-center gap-1.5">
                            <FileQuestion className="w-4 h-4" />
                            10 Quiz
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Radio className="w-4 h-4" />1 Live Class
                        </span>
                    </div>

                    <div className="mt-5 space-y-3">
                        {module.lessonIds &&
                            module.lessonIds.map((lessonId) => <CourseLessonList key={lessonId} lessonId={lessonId} />)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </div>
    );
};

export default CourseModuleList;
