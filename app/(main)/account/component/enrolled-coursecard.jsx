import React from 'react';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import { getCategoryDetails } from '@/queries/categories';

const EnrolledCourseCard = async ({ enrollment }) => {
    const courseCategory = await getCategoryDetails(enrollment?.course?.category?._id);

    return (
        <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                <Image
                    src={`/assets/images/courses/${enrollment?.course?.thumbnail}`}
                    alt={enrollment?.course?.title}
                    className="object-cover"
                    fill
                />
            </div>
            <div className="flex flex-col pt-3">
                <div className="line-clamp-2 text-base font-bold text-foreground group-hover:text-primary md:text-sm">
                    {enrollment?.course?.title}
                </div>
                <span className="text-xs text-muted-foreground">{courseCategory?.title}</span>
                <div className="mt-3 flex items-center gap-x-1.5 text-sm text-muted-foreground md:text-xs">
                    <BookOpen className="w-4" />
                    <span>{enrollment?.course?.modules?.length} فصل</span>
                </div>
            </div>
        </div>
    );
};

export default EnrolledCourseCard;
