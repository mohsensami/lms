import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Clock, ArrowRight, Newspaper, MessageCircle } from 'lucide-react';
import { getPostBySlug } from '@/queries/posts';
import { getApprovedCommentsForPost, getApprovedCommentCountForPost } from '@/queries/postComments';
import { buildPostMetadata, buildPostJsonLd } from '@/lib/seo';
import { getSiteName } from '@/lib/site-settings';
import { getPostReadTime } from '@/lib/post-content';
import { isPostLive, getPostState, POST_STATE_LABEL } from '@/lib/post-status';
import { renderPostContent } from '@/lib/sanitize-post-html';
import { PostBody } from '@/components/post-html';
import { getLoggedInUser } from '@/lib/loggedin-user';
import UserAvatar from '@/components/user-avatar';
import PostCommentForm from '../_components/PostCommentForm';
import CommentReplyBox from '@/app/(main)/account/component/comment-reply-box';
import { replyToPostComment } from '@/app/actions/post-comment';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    // Drafts / scheduled posts aren't public: don't leak their title or
    // content through <head> metadata, and keep them out of search engines.
    if (post && !isPostLive(post)) {
        return { title: 'پیش‌نمایش مقاله', robots: { index: false, follow: false } };
    }
    return buildPostMetadata(post, await getSiteName());
}

const BlogPostPage = async ({ params }) => {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const [comments, commentCount, loggedInUser] = await Promise.all([
        getApprovedCommentsForPost(post.id),
        getApprovedCommentCountForPost(post.id),
        getLoggedInUser(),
    ]);

    // Not live yet (draft or scheduled): only admins and the post's own
    // author may open it, as a preview. Everyone else gets a 404.
    const isLive = isPostLive(post);
    const canPreview = loggedInUser?.role === 'admin' || (!!loggedInUser && post.authorId === loggedInUser.id);
    if (!isLive && !canPreview) {
        notFound();
    }

    const rendered = renderPostContent(post.content);
    const dateLabel = (post.publishedAt || post.createdAt)
        ? new Date(post.publishedAt || post.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';
    const authorName = post?.author ? `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() : null;
    const jsonLd = buildPostJsonLd(post, await getSiteName());
    const canReply = loggedInUser?.role === 'admin';

    return (
        <div className="bg-gradient-to-b from-primary/[0.06] to-transparent">
            {/* eslint-disable-next-line react/no-danger */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <article className="container max-w-3xl py-10 md:py-16">
                {!isLive && (
                    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        این مقاله هنوز عمومی نیست ({POST_STATE_LABEL[getPostState(post)]}
                        {getPostState(post) === 'scheduled' && post.publishedAt
                            ? ` — انتشار: ${new Date(post.publishedAt).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })}`
                            : ''}
                        ) و فقط شما به‌عنوان پیش‌نمایش آن را می‌بینید.
                    </div>
                )}
                <Link
                    href="/blog"
                    className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
                >
                    <ArrowRight className="h-4 w-4" />
                    بازگشت به وبلاگ
                </Link>

                {post.category?.name && (
                    <Link
                        href={`/blog?category=${encodeURIComponent(post.category.slug)}`}
                        className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
                    >
                        {post.category.name}
                    </Link>
                )}

                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
                    {post.title}
                </h1>

                {/* Meta row: author, date, read time, comment count */}
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border pb-6">
                    <div className="flex items-center gap-2.5">
                        <UserAvatar src={post?.author?.profilePicture} alt={authorName || 'نویسنده'} className="h-9 w-9" />
                        <span className="text-sm font-semibold text-foreground">{authorName || 'تیم تحریریه'}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {dateLabel}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {getPostReadTime(post.content)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {commentCount} دیدگاه
                    </span>
                </div>

                {/* Cover image */}
                <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-sm">
                    {post.thumbnail ? (
                        <Image src={post.thumbnail} alt={post.title} fill priority className="object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Newspaper className="h-10 w-10" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <PostBody rendered={rendered} className="mt-10 text-[17px] leading-9 text-foreground/90" />

                {/* Author box */}
                {authorName && (
                    <div className="mt-12 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                        <UserAvatar src={post?.author?.profilePicture} alt={authorName} className="h-14 w-14" />
                        <div>
                            <p className="text-xs text-muted-foreground">نویسنده‌ی مقاله</p>
                            <p className="mt-0.5 font-bold text-foreground">{authorName}</p>
                        </div>
                    </div>
                )}

                {/* Comments */}
                <section className="mt-14">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        دیدگاه‌ها
                        <span className="text-muted-foreground">({commentCount})</span>
                    </h2>

                    <div className="mt-6 flex flex-col gap-4">
                        {comments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">هنوز دیدگاهی برای این مقاله تایید نشده است.</p>
                        ) : (
                            comments.map((comment) => {
                                const commenterName =
                                    `${comment?.user?.firstName || ''} ${comment?.user?.lastName || ''}`.trim() ||
                                    'کاربر';
                                const commentDate = comment.createdAt
                                    ? new Date(comment.createdAt).toLocaleDateString('fa-IR')
                                    : '';

                                return (
                                    <div key={comment.id} className="rounded-2xl border border-border bg-card p-5">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar
                                                src={comment?.user?.profilePicture}
                                                alt={commenterName}
                                                className="h-10 w-10"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{commenterName}</p>
                                                <p className="text-xs text-muted-foreground">{commentDate}</p>
                                            </div>
                                        </div>
                                        <p className="mt-3 leading-7 text-muted-foreground">{comment.content}</p>
                                        {canReply ? (
                                            <CommentReplyBox
                                                commentId={comment.id}
                                                initialReply={comment.reply}
                                                onReply={replyToPostComment}
                                            />
                                        ) : (
                                            comment.reply && (
                                                <div className="mt-3 rounded-xl bg-muted/60 p-3 text-sm">
                                                    <span className="font-semibold text-primary">
                                                        پاسخ نویسنده/پشتیبانی:{' '}
                                                    </span>
                                                    <span className="text-foreground/90">{comment.reply}</span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="mt-8 rounded-2xl border border-border bg-card p-5">
                        <h3 className="mb-4 text-sm font-bold text-foreground">دیدگاه خود را ثبت کنید</h3>
                        <PostCommentForm postId={post.id} loggedInUser={loggedInUser} />
                    </div>
                </section>
            </article>
        </div>
    );
};

export default BlogPostPage;
