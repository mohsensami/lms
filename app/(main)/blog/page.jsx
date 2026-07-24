import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clock, Newspaper } from 'lucide-react';
import BlogCard from '@/components/blog-card';
import { getPostList } from '@/queries/posts';

function getExcerpt(content, maxLength = 160) {
    if (!content) return '';
    const plain = content.replace(/\s+/g, ' ').trim();
    if (plain.length <= maxLength) return plain;
    return `${plain.slice(0, maxLength).trim()}…`;
}

function getReadTime(content) {
    if (!content) return '۱ دقیقه';
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} دقیقه`;
}

const BlogPage = async () => {
    const posts = await getPostList();
    const [featuredPost, ...restPosts] = posts;

    return (
        <div className="bg-gradient-to-b from-primary/[0.06] to-transparent">
            <section className="container py-14 md:py-20">
                {/* Header */}
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                        وبلاگ
                    </span>
                    <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        آخرین مقالات و آموزش‌ها
                    </h1>
                    <p className="mt-4 leading-8 text-muted-foreground">
                        نکته‌ها، آموزش‌ها و تجربه‌هایی که به رشد شما در دنیای برنامه‌نویسی و طراحی کمک می‌کنه.
                    </p>
                </div>

                {!featuredPost ? (
                    <p className="text-center text-muted-foreground">هنوز مقاله‌ای منتشر نشده است.</p>
                ) : (
                    <>
                        {/* Featured post */}
                        <Link
                            href={`/blog/${featuredPost.slug || featuredPost.id}`}
                            className="group mb-10 grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 md:grid-cols-2"
                        >
                            <div className="relative aspect-video w-full overflow-hidden bg-muted md:aspect-auto">
                                {featuredPost.thumbnail ? (
                                    <Image
                                        src={featuredPost.thumbnail}
                                        alt={featuredPost.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <Newspaper className="h-10 w-10" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
                                <h2 className="text-xl font-extrabold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                                    {featuredPost.title}
                                </h2>
                                <p className="leading-7 text-muted-foreground">{getExcerpt(featuredPost.content)}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {featuredPost.createdAt
                                            ? new Date(featuredPost.createdAt).toLocaleDateString('fa-IR')
                                            : ''}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        {getReadTime(featuredPost.content)}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Posts grid */}
                        {restPosts.length > 0 && (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {restPosts.map((post) => (
                                    <BlogCard key={post.id} post={post} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default BlogPage;
