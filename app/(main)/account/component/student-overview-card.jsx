import Link from 'next/link';
import UserAvatar from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { CourseProgress } from '@/components/course-progress';
import GrantAccessButton from './grant-access-button';

const ORDER_LABEL = {
    paid: 'پرداخت موفق',
    pending: 'در انتظار پرداخت',
    failed: 'پرداخت ناموفق',
};
const ORDER_VARIANT = {
    paid: 'success',
    pending: 'secondary',
    failed: 'destructive',
};

const CERT_LABEL = {
    none: 'درخواست نداده',
    pending: 'در انتظار تایید مدرک',
    approved: 'مدرک تایید شده',
    rejected: 'درخواست مدرک رد شده',
};
const CERT_VARIANT = {
    none: 'secondary',
    pending: 'secondary',
    approved: 'success',
    rejected: 'destructive',
};

function StudentOverviewCard({ overview, hideHeader, canGrantAccess }) {
    const { student, courses } = overview;
    const fullName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'کاربر';

    return (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            {!hideHeader && (
                <div className="flex items-center gap-3">
                    <UserAvatar src={student?.profilePicture} alt={fullName} className="h-11 w-11" />
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                            {fullName}
                            {student?.isActive === false && (
                                <Badge variant="destructive" className="mr-2 align-middle text-[10px]">
                                    غیرفعال
                                </Badge>
                            )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground" dir="ltr">
                            {student?.email}
                        </p>
                    </div>
                </div>
            )}

            <div className={hideHeader ? 'flex flex-col gap-3' : 'mt-4 flex flex-col gap-3'}>
                {courses.map((c) => (
                    <div key={c.courseId} className="rounded-xl border border-border bg-muted/30 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Link
                                href={`/account/courses/${c.courseId}`}
                                className="font-semibold text-foreground hover:text-primary hover:underline"
                            >
                                {c.courseTitle}
                            </Link>
                            <div className="flex items-center gap-2">
                                {!c.isEnrolled && (
                                    <>
                                        <Badge variant="destructive">دسترسی به دوره فعال نیست!</Badge>
                                        {canGrantAccess && (
                                            <GrantAccessButton courseId={c.courseId} studentId={student.id} />
                                        )}
                                    </>
                                )}
                                <Badge variant={ORDER_VARIANT[c.orderStatus] || 'secondary'}>
                                    {ORDER_LABEL[c.orderStatus] || 'بدون فاکتور ثبت‌شده'}
                                </Badge>
                            </div>
                        </div>

                        <div className="mt-3">
                            <CourseProgress value={c.progressPercent} variant={c.progressPercent === 100 ? 'success' : ''} />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                            <Badge variant={c.quizTaken ? (c.quizScore?.percentage >= 60 ? 'success' : 'destructive') : 'secondary'}>
                                {c.quizTaken ? `آزمون: ${c.quizScore.correct}/${c.quizScore.total} (${c.quizScore.percentage}٪)` : 'آزمون نداده'}
                            </Badge>

                            <Link href="/account/certificate-requests">
                                <Badge variant={CERT_VARIANT[c.certificateStatus]} className="cursor-pointer hover:opacity-80">
                                    {CERT_LABEL[c.certificateStatus]}
                                </Badge>
                            </Link>

                            <Link href={`/account/courses/${c.courseId}/reviews`}>
                                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                                    {c.commentCount} دیدگاه
                                </Badge>
                            </Link>

                            <Link href={`/account/courses/${c.courseId}/enrollments`}>
                                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                                    مشاهده ثبت‌نام‌ها
                                </Badge>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StudentOverviewCard;
