import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clock, Newspaper } from 'lucide-react';

import { getPostExcerpt, getPostReadTime } from '@/lib/post-content';

function BlogCard({ post }) {
    if (!post) return null;

    const href = `/blog/${post.slug || post.id}`;
    const dateLabel = (post.publishedAt || post.createdAt) ? new Date(post.publishedAt || post.createdAt).toLocaleDateString('fa-IR') : '';

    return (
        <Link
            href={href}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {post.thumbnail ? (
                    <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Newspaper className="h-8 w-8" />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="line-clamp-2 text-base font-bold leading-7 text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                </h3>
                <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">{getPostExcerpt(post.content, 120)}</p>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3 w-3" />
                        {dateLabel}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {getPostReadTime(post.content)}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default BlogCard;
