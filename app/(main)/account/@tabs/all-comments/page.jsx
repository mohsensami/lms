import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/queries/users';
import { getAllTestimonials } from '@/queries/testimonials';
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/start-rating';
import CommentModerationActions from '../../component/comment-moderation-actions';

const STATUS_LABEL = {
    pending: 'در حال بررسی',
    approved: 'تایید شده',
    rejected: 'رد شده',
};

const STATUS_VARIANT = {
    pending: 'secondary',
    approved: 'success',
    rejected: 'destructive',
};

async function AllComments() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const loggedInUser = await getUserByEmail(session?.user?.email);
    if (loggedInUser?.role !== 'admin') {
        redirect('/account');
    }

    const comments = await getAllTestimonials();

    return (
        <div className="flex flex-col gap-4">
            {comments && comments.length > 0 ? (
                comments.map((comment) => (
                    <div key={comment.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h6 className="font-semibold text-foreground">
                                    {comment?.course?.title || 'دوره حذف شده'}
                                </h6>
                                <span className="text-xs text-muted-foreground">
                                    {comment?.user?.firstName} {comment?.user?.lastName} ({comment?.user?.email})
                                </span>
                            </div>
                            <Badge variant={STATUS_VARIANT[comment.status] || 'secondary'}>
                                {STATUS_LABEL[comment.status] || comment.status}
                            </Badge>
                        </div>
                        <div className="mt-1 flex gap-0.5">
                            <StarRating rating={comment.rating} />
                        </div>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{comment.content}</p>

                        <div className="mt-4">
                            <CommentModerationActions testimonialId={comment.id} status={comment.status} />
                        </div>
                    </div>
                ))
            ) : (
                <div className="font-bold bg-red-400 text-white p-2 w-100">هیچ دیدگاهی ثبت نشده است!</div>
            )}
        </div>
    );
}

export default AllComments;
