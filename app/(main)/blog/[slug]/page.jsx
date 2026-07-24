import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Clock, ArrowRight, Newspaper } from 'lucide-react';
import { getPostBySlug } from '@/queries/posts';
import { buildPostMetadata, buildPostJsonLd } from '@/lib/seo';

function getReadTime(content) {
    if (!content) return '۱ دقیقه';
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} دقیقه`;
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    return buildPostMetadata(post);
}

const BlogPostPage = async ({ params }) => {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const dateLabel = post.createdAt ? new Date(post.createdAt).toLocaleDateString('fa-IR') : '';
    const jsonLd = buildPostJsonLd(post);

    return (
        <div className="bg-gradient-to-b from-primary/[0.06] to-transparent">
            {/* eslint-disable-next-line react/no-danger */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <article className="container max-w-3xl py-14 md:py-20">
                <Link
                    href="/blog"
                    className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
                >
                    <ArrowRight className="h-4 w-4" />
                    بازگشت به وبلاگ
                </Link>

                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{post.title}</h1>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {dateLabel}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {getReadTime(post.content)}
                    </span>
                </div>

                <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                    {post.thumbnail ? (
                        <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Newspaper className="h-10 w-10" />
                        </div>
                    )}
                </div>

                <div className="mt-8 whitespace-pre-line leading-8 text-foreground/90">{post.content}</div>
            </article>
        </div>
    );
};

export default BlogPostPage;
