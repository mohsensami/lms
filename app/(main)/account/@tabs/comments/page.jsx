import { requireRole } from '@/lib/require-role';
import { getAllTestimonials } from '@/queries/testimonials';
import { getAllPostComments } from '@/queries/postComments';
import { replyToComment } from '@/app/actions/review';
import { replyToPostComment } from '@/app/actions/post-comment';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StarRating from '@/components/start-rating';
import CommentModerationActions from '../../component/comment-moderation-actions';
import PostCommentModerationActions from '../../component/post-comment-moderation-actions';
import CommentReplyBox from '../../component/comment-reply-box';

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

async function CommentsPage() {
    // Instructors and admins both land here; instructors can reply to any
    // student comment sitewide, admins additionally get moderation controls
    // (approve/reject/delete).
    const user = await requireRole('instructor');
    const isAdmin = user.role === 'admin';

    const [courseComments, postComments] = await Promise.all([getAllTestimonials(), getAllPostComments()]);

    return (
        <Tabs defaultValue="courses" className="w-full">
            <TabsList>
                <TabsTrigger value="courses">دیدگاه‌های دوره‌ها ({courseComments.length})</TabsTrigger>
                <TabsTrigger value="posts">دیدگاه‌های مقالات ({postComments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="mt-4">
                <div className="flex flex-col gap-4">
                    {courseComments && courseComments.length > 0 ? (
                        courseComments.map((comment) => (
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

                                {isAdmin && (
                                    <div className="mt-4">
                                        <CommentModerationActions testimonialId={comment.id} status={comment.status} />
                                    </div>
                                )}

                                <CommentReplyBox
                                    commentId={comment.id}
                                    initialReply={comment.reply}
                                    onReply={replyToComment}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="font-bold bg-red-400 text-white p-2 w-100">هیچ دیدگاهی ثبت نشده است!</div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="posts" className="mt-4">
                <div className="flex flex-col gap-4">
                    {postComments && postComments.length > 0 ? (
                        postComments.map((comment) => (
                            <div key={comment.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <h6 className="font-semibold text-foreground">
                                            {comment?.post?.title || 'مقاله حذف شده'}
                                        </h6>
                                        <span className="text-xs text-muted-foreground">
                                            {comment?.user?.firstName} {comment?.user?.lastName} ({comment?.user?.email})
                                        </span>
                                    </div>
                                    <Badge variant={STATUS_VARIANT[comment.status] || 'secondary'}>
                                        {STATUS_LABEL[comment.status] || comment.status}
                                    </Badge>
                                </div>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">{comment.content}</p>

                                {isAdmin && (
                                    <div className="mt-4">
                                        <PostCommentModerationActions commentId={comment.id} status={comment.status} />
                                    </div>
                                )}

                                <CommentReplyBox
                                    commentId={comment.id}
                                    initialReply={comment.reply}
                                    onReply={replyToPostComment}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="font-bold bg-red-400 text-white p-2 w-100">هیچ دیدگاهی ثبت نشده است!</div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    );
}

export default CommentsPage;
