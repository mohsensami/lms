import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clock, Newspaper } from 'lucide-react';
import BlogCard from '@/components/blog-card';
import { getPublishedPostList } from '@/queries/posts';
import { getPublicPostCategories } from '@/queries/post-categories';
import { cn } from '@/lib/utils';
import { getPostExcerpt, getPostReadTime } from '@/lib/post-content';
import { getSiteName } from '@/lib/site-settings';

export async function generateMetadata() {
    const siteName = await getSiteName();
    return {
        title: 'وبلاگ',
        description: `آخرین مقالات و آموزش‌های ${siteName}.`,
    };
}

// Re-check every minute so scheduled posts show up once their time arrives.
export const revalidate = 60;

const BlogPage = async ({ searchParams }) => {
    const { category: categorySlug } = (await searchParams) || {};
    const [allPosts, categories] = await Promise.all([getPublishedPostList(), getPublicPostCategories()]);

    const activeCategory = categories.find((category) => category.slug === categorySlug) || null;
    const posts = activeCategory ? allPosts.filter((post) => post.categoryId === activeCategory.id) : allPosts;
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

                {/* Category filter */}
                {categories.length > 0 && (
                    <nav aria-label="دسته‌بندی مقالات" className="mb-10 flex flex-wrap items-center justify-center gap-2">
                        {[{ id: 'all', name: 'همه', slug: null, publicCount: allPosts.length }, ...categories].map((category) => {
                            const active = (category.slug || null) === (activeCategory?.slug || null);
                            return (
                                <Link
                                    key={category.id}
                                    href={category.slug ? `/blog?category=${encodeURIComponent(category.slug)}` : '/blog'}
                                    className={cn(
                                        'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
                                        active
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-primary',
                                    )}
                                >
                                    {category.name}
                                    <span className="mr-1.5 text-xs opacity-70">{category.publicCount}</span>
                                </Link>
                            );
                        })}
                    </nav>
                )}

                {activeCategory?.description && (
                    <p className="-mt-4 mb-10 text-center text-sm text-muted-foreground">{activeCategory.description}</p>
                )}

                {!featuredPost ? (
                    <p className="text-center text-muted-foreground">
                        {activeCategory ? 'هنوز مقاله‌ای در این دسته‌بندی منتشر نشده است.' : 'هنوز مقاله‌ای منتشر نشده است.'}
                    </p>
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
                                {featuredPost.category?.name && (
                                    <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        {featuredPost.category.name}
                                    </span>
                                )}
                                <h2 className="text-xl font-extrabold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                                    {featuredPost.title}
                                </h2>
                                <p className="leading-7 text-muted-foreground">{getPostExcerpt(featuredPost.content)}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {featuredPost.publishedAt || featuredPost.createdAt
                                            ? new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString('fa-IR')
                                            : ''}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        {getPostReadTime(featuredPost.content)}
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
