import React from 'react';
import { CheckCheck } from 'lucide-react';

const CourseOverview = ({ course }) => {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-foreground">توضیحات دوره</h3>
                <p className="mt-4 leading-8 text-muted-foreground">{course?.description}</p>
            </div>

            {course?.learning?.length > 0 && (
                <div className="rounded-2xl bg-muted/60 p-6 sm:p-8">
                    <h4 className="text-lg font-bold text-foreground">چه چیزی یاد خواهید گرفت؟</h4>
                    <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {course.learning.map((learn, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <CheckCheck className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex-1 text-sm leading-7 text-foreground/90">{learn}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CourseOverview;
