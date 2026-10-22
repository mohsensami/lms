import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PROGRESS_STATUS, PROGRESS_STATUS_LABEL } from '@/lib/progress';
import { PROGRESS_COLORS } from '@/components/progress-pie';

const VARIANT = {
    [PROGRESS_STATUS.COMPLETED]: 'success',
    [PROGRESS_STATUS.IN_PROGRESS]: 'secondary',
    [PROGRESS_STATUS.NOT_STARTED]: 'outline',
};

const toFa = (n) => Number(n).toLocaleString('fa-IR');

/** Per-course progress bars. `courseHref` lets the student page link to the course. */
export function CourseProgressList({ courses, linkToCourse = true }) {
    return (
        <ul className="divide-y divide-border">
            {courses.map((course) => (
                <li key={course.courseId} className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        {linkToCourse ? (
                            <Link
                                href={`/courses/${course.courseId}`}
                                className="font-semibold text-foreground hover:text-primary hover:underline"
                            >
                                {course.title}
                            </Link>
                        ) : (
                            <span className="font-semibold text-foreground">{course.title}</span>
                        )}
                        <Badge variant={VARIANT[course.status]}>{PROGRESS_STATUS_LABEL[course.status]}</Badge>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full"
                            style={{ width: `${course.percent}%`, backgroundColor: PROGRESS_COLORS[course.status] }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {toFa(course.percent)}٪ — {toFa(course.completedModules)} از {toFa(course.totalModules)} فصل
                        {course.completionDate &&
                            ` • تکمیل: ${new Date(course.completionDate).toLocaleDateString('fa-IR')}`}
                    </p>
                </li>
            ))}
        </ul>
    );
}
