import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { requireRole } from '@/lib/require-role';
import { getUserActivity } from '@/queries/userActivity';
import { formatPrice } from '@/lib/formatPrice';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserAvatar from '@/components/user-avatar';

export const dynamic = 'force-dynamic';

const toFa = (n) => Number(n).toLocaleString('fa-IR');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fa-IR') : '-');

const ORDER_LABEL = { paid: 'پرداخت موفق', pending: 'در انتظار پرداخت', failed: 'پرداخت ناموفق' };
const ORDER_VARIANT = { paid: 'success', pending: 'secondary', failed: 'destructive' };
const COMMENT_LABEL = { pending: 'در انتظار تایید', approved: 'تایید شده', rejected: 'رد شده' };
const COMMENT_VARIANT = { pending: 'secondary', approved: 'success', rejected: 'destructive' };
const CERT_LABEL = { pending: 'در انتظار تایید', approved: 'تایید شده', rejected: 'رد شده' };

function Stat({ title, value }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

function Section({ title, count, children }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">
                    {title}
                    {count != null && <span className="mr-2 text-sm font-normal text-muted-foreground">({toFa(count)})</span>}
                </CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

const Empty = ({ children }) => <p className="text-sm text-muted-foreground">{children}</p>;

const UserDetailsPage = async ({ params }) => {
    await requireRole('admin');
    const { userId } = await params;
    const activity = await getUserActivity(userId);
    if (!activity) notFound();

    const { user, enrollments, orders, courseComments, postComments, certificateRequests } = activity;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'کاربر';
    const enrolledCourseIds = new Set(
        enrollments.map((e) => e?.course?.id || e?.course?._id?.toString?.()).filter(Boolean),
    );

    // Purchases = every invoice, plus enrollments that have no invoice at all
    // (free / manually granted access), so nothing the user owns is missed.
    const orderCourseIds = new Set(orders.map((o) => o.courseId).filter(Boolean));
    const purchases = [
        ...orders.map((o) => ({
            key: `order-${o.id}`,
            title: o.course?.title || 'دوره‌ی حذف‌شده',
            amount: o.amount,
            status: o.status,
            method: o.method,
            date: o.paidAt || o.createdAt,
            hasAccess: o.courseId ? enrolledCourseIds.has(o.courseId) : false,
        })),
        ...enrollments
            .filter((e) => e.course && !orderCourseIds.has(e.courseId))
            .map((e) => ({
                key: `enrollment-${e.id}`,
                title: e.course.title,
                amount: null,
                status: 'enrolled',
                method: e.method,
                date: e.enrollment_date,
                hasAccess: true,
            })),
    ];
    const totalPaid = orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalComments = courseComments.length + postComments.length;

    return (
        <div className="space-y-6 p-6">
            <Link
                href="/account/users"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
            >
                <ArrowRight className="h-4 w-4" />
                بازگشت به کاربران
            </Link>

            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <UserAvatar src={user.profilePicture} alt={fullName} className="h-14 w-14" />
                <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold text-foreground">{fullName}</h1>
                    <p className="truncate text-sm text-muted-foreground" dir="ltr">
                        {user.email}
                    </p>
                    {user.phone && (
                        <p className="text-sm text-muted-foreground" dir="ltr">
                            {user.phone}
                        </p>
                    )}
                </div>
                <div className="mr-auto flex items-center gap-2">
                    <Badge variant="secondary">{user.role === 'admin' ? 'مدیر' : 'دانشجو'}</Badge>
                    <Badge variant={user.isActive === false ? 'destructive' : 'success'}>
                        {user.isActive === false ? 'غیرفعال' : 'فعال'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">عضویت: {fmtDate(user.createdAt)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <Stat title="دوره‌های ثبت‌نامی" value={toFa(enrolledCourseIds.size)} />
                <Stat title="مجموع پرداخت موفق" value={formatPrice(totalPaid)} />
                <Stat title="دیدگاه‌ها" value={toFa(totalComments)} />
            </div>

            {/* Purchases */}
            <Section title="دوره‌های خریداری‌شده / فاکتورها" count={purchases.length}>
                {purchases.length === 0 ? (
                    <Empty>هیچ خرید یا فاکتوری ثبت نشده است.</Empty>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-sm">
                            <thead>
                                <tr className="border-b text-right text-xs text-muted-foreground">
                                    <th className="py-2 font-medium">دوره</th>
                                    <th className="py-2 font-medium">مبلغ</th>
                                    <th className="py-2 font-medium">وضعیت</th>
                                    <th className="py-2 font-medium">دسترسی</th>
                                    <th className="py-2 font-medium">تاریخ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map((p) => (
                                    <tr key={p.key} className="border-b last:border-0">
                                        <td className="py-3 font-semibold">{p.title}</td>
                                        <td className="py-3">{p.amount != null ? formatPrice(p.amount) : '-'}</td>
                                        <td className="py-3">
                                            {p.status === 'enrolled' ? (
                                                <Badge variant="outline">
                                                    {p.method === 'manual-admin-grant' ? 'دسترسی دستی (مدیر)' : 'ثبت‌نام بدون فاکتور'}
                                                </Badge>
                                            ) : (
                                                <Badge variant={ORDER_VARIANT[p.status] || 'secondary'}>
                                                    {ORDER_LABEL[p.status] || p.status}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <Badge variant={p.hasAccess ? 'success' : 'destructive'}>
                                                {p.hasAccess ? 'فعال' : 'غیرفعال'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-muted-foreground">{fmtDate(p.date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>

            {/* Comments */}
            <Section title="دیدگاه‌های دوره‌ها" count={courseComments.length}>
                {courseComments.length === 0 ? (
                    <Empty>دیدگاهی برای دوره‌ها ثبت نکرده است.</Empty>
                ) : (
                    <ul className="space-y-3">
                        {courseComments.map((c) => (
                            <li key={c.id} className="rounded-xl border border-border bg-muted/30 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-semibold">{c.course?.title || 'دوره‌ی حذف‌شده'}</span>
                                    <span className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">امتیاز {toFa(c.rating)} از ۵</span>
                                        <Badge variant={COMMENT_VARIANT[c.status] || 'secondary'}>
                                            {COMMENT_LABEL[c.status] || c.status}
                                        </Badge>
                                    </span>
                                </div>
                                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground/90">{c.content}</p>
                                {c.reply && (
                                    <p className="mt-2 rounded-lg bg-muted/60 p-2 text-xs">
                                        <span className="font-semibold text-primary">پاسخ: </span>
                                        {c.reply}
                                    </p>
                                )}
                                <p className="mt-2 text-xs text-muted-foreground">{fmtDate(c.createdAt)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>

            <Section title="دیدگاه‌های مقالات" count={postComments.length}>
                {postComments.length === 0 ? (
                    <Empty>دیدگاهی برای مقالات ثبت نکرده است.</Empty>
                ) : (
                    <ul className="space-y-3">
                        {postComments.map((c) => (
                            <li key={c.id} className="rounded-xl border border-border bg-muted/30 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    {c.post?.slug ? (
                                        <Link href={`/blog/${c.post.slug}`} className="font-semibold hover:text-primary hover:underline">
                                            {c.post.title}
                                        </Link>
                                    ) : (
                                        <span className="font-semibold">مقاله‌ی حذف‌شده</span>
                                    )}
                                    <Badge variant={COMMENT_VARIANT[c.status] || 'secondary'}>
                                        {COMMENT_LABEL[c.status] || c.status}
                                    </Badge>
                                </div>
                                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground/90">{c.content}</p>
                                {c.reply && (
                                    <p className="mt-2 rounded-lg bg-muted/60 p-2 text-xs">
                                        <span className="font-semibold text-primary">پاسخ: </span>
                                        {c.reply}
                                    </p>
                                )}
                                <p className="mt-2 text-xs text-muted-foreground">{fmtDate(c.createdAt)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>

            {/* Certificates */}
            {certificateRequests.length > 0 && (
                <Section title="درخواست‌های مدرک" count={certificateRequests.length}>
                    <ul className="space-y-2 text-sm">
                        {certificateRequests.map((r) => (
                            <li key={r.id} className="flex items-center justify-between gap-2">
                                <span>{r.course?.title || 'دوره‌ی حذف‌شده'}</span>
                                <Badge variant={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'destructive' : 'secondary'}>
                                    {CERT_LABEL[r.status] || r.status}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}
        </div>
    );
};

export default UserDetailsPage;
