import Link from 'next/link';

import { Button, buttonVariants } from '@/components/ui/button';
import { PriceDisplay } from '@/components/price-display';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    ArrowLeftIcon,
    BookOpen,
    CalendarDays,
    Clock,
    ListChecks,
    PlayCircle,
    UserCheck,
} from 'lucide-react';
import { ArrowRightIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import EnrollCourse from '@/components/enroll-course';

function FullWidthCourseCard({ course, key }) {
    return (
        <Link
            href={`/courses/${course.id}`}
            key={key}
            className="group mb-10 grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 md:grid-cols-2"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-muted md:aspect-auto">
                <Image
                    src={`/assets/images/courses/${course?.thumbnail}`}
                    alt={course?.title || 'course'}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    fill
                />
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
                <Badge className="w-fit border-none bg-primary/10 text-primary">{course.category.title}</Badge>
                <h2 className="text-xl font-extrabold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                    {course.title}
                </h2>
                <p className="leading-7 text-muted-foreground">{course.subtitle}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{course?.modules?.length ?? 0} فصل</span>
                    </div>
                    <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>
                            {course?.instructor?.firstName ?? ''} {course?.instructor?.lastName ?? ''}
                        </span>
                    </div>
                    {/* <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                        <PlayCircle className="h-3.5 w-3.5" />
                        <span>{course?.modules.length ?? 0} جلسه</span>
                    </div> */}
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
                    <PriceDisplay course={course} priceClassName="text-sm" />
                    {/* <EnrollCourse asLink={true} courseId={course?.id} /> */}
                    <Button
                        type="submit"
                        variant="secondary"
                        className="h-8 gap-1 rounded-full text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                        مشاهده
                        <ArrowLeft className="w-3" />
                    </Button>
                </div>
            </div>
        </Link>
    );
}

export default FullWidthCourseCard;
