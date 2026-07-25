import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/queries/users';
import { getTestimonialsForUser } from '@/queries/testimonials';
import { getPostCommentsForUser } from '@/queries/postComments';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StarRating from '@/components/start-rating';

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

async function MyComments() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const loggedInUser = await getUserByEmail(session?.user?.email);
    const [courseComments, postComments] = await Promise.all([
        getTestimonialsForUser(loggedInUser?.id),
        getPostCommentsForUser(loggedInUser?.id),
    ]);

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
                                    <h6 className="font-semibold text-foreground">
                                        {comment?.course?.title || 'دوره حذف شده'}
                                    </h6>
                                    <Badge variant={STATUS_VARIANT[comment.status] || 'secondary'}>
                                        {STATUS_LABEL[comment.status] || comment.status}
                                    </Badge>
                                </div>
                                <div className="mt-1 flex gap-0.5">
                                    <StarRating rating={comment.rating} />
                                </div>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">{comment.content}</p>
                            </div>
                        ))
                    ) : (
                        <div className="font-bold bg-red-400 text-white p-2 w-100">هنوز هیچ دیدگاهی روی دوره‌ای ثبت نکرده‌اید!</div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="posts" className="mt-4">
                <div className="flex flex-col gap-4">
                    {postComments && postComments.length > 0 ? (
                        postComments.map((comment) => (
                            <div key={comment.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h6 className="font-semibold text-foreground">
                                        {comment?.post?.title || 'مقاله حذف شده'}
                                    </h6>
                                    <Badge variant={STATUS_VARIANT[comment.status] || 'secondary'}>
                                        {STATUS_LABEL[comment.status] || comment.status}
                                    </Badge>
                                </div>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">{comment.content}</p>
                            </div>
                        ))
                    ) : (
                        <div className="font-bold bg-red-400 text-white p-2 w-100">هنوز هیچ دیدگاهی روی مقاله‌ای ثبت نکرده‌اید!</div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    );
}

export default MyComments;
