import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock } from 'lucide-react';

const posts = [
    {
        id: 1,
        title: 'چطور اولین پروژه ری‌اکت خودتون رو بسازید',
        excerpt: 'یه راهنمای قدم‌به‌قدم برای شروع کار با ری‌اکت و ساخت اولین اپلیکیشن واقعی‌تون، بدون سردرگمی.',
        category: 'ری‌اکت',
        date: '۱۴۰۴/۰۳/۱۲',
        readTime: '۶ دقیقه',
        image: 'https://picsum.photos/id/133/600/400',
        author: { name: 'علی رضایی', avatar: '/assets/images/authors/ali.jpg' },
    },
    {
        id: 2,
        title: 'تفاوت Next.js و React چیست؟',
        excerpt: 'بررسی کامل تفاوت‌های این دو تکنولوژی و اینکه برای پروژه بعدی‌تون کدوم گزینه مناسب‌تره.',
        category: 'Next.js',
        date: '۱۴۰۴/۰۲/۲۸',
        readTime: '۸ دقیقه',
        image: 'https://picsum.photos/id/230/600/400',
        author: { name: 'سارا احمدی', avatar: 'https://i.pravatar.cc/100' },
    },
    {
        id: 3,
        title: 'مسیر یادگیری برنامه‌نویسی فرانت‌اند در سال جدید',
        excerpt: 'یه نقشه راه کامل برای یادگیری فرانت‌اند از صفر تا حرفه‌ای شدن.',
        category: 'مسیر یادگیری',
        date: '۱۴۰۴/۰۲/۱۵',
        readTime: '۱۰ دقیقه',
        image: 'https://picsum.photos/id/53/600/400',
        author: { name: 'امیر حسینی', avatar: 'https://i.pravatar.cc/100' },
    },
    {
        id: 4,
        title: 'معرفی بهترین ابزارهای طراحی رابط کاربری در ۲۰۲۶',
        excerpt: 'لیستی از بهترین ابزارهایی که هر طراح UI/UX باید باهاشون آشنا باشه.',
        category: 'طراحی',
        date: '۱۴۰۴/۰۱/۳۰',
        readTime: '۵ دقیقه',
        image: 'https://picsum.photos/id/64/600/400',
        author: { name: 'نیلوفر کریمی', avatar: 'https://i.pravatar.cc/100' },
    },
    {
        id: 5,
        title: 'چگونه در مصاحبه شغلی برنامه‌نویسی موفق باشیم',
        excerpt: 'نکات کاربردی برای آماده شدن برای مصاحبه‌های فنی و افزایش شانس قبولی.',
        category: 'مسیر شغلی',
        date: '۱۴۰۴/۰۱/۱۰',
        readTime: '۷ دقیقه',
        image: 'https://picsum.photos/id/201/600/400',
        author: { name: 'علی رضایی', avatar: 'https://i.pravatar.cc/100' },
    },
    {
        id: 6,
        title: 'آشنایی با TypeScript برای برنامه‌نویس‌های جاوااسکریپت',
        excerpt: 'چرا و چطور باید TypeScript رو یاد بگیرید و به پروژه‌هاتون اضافه کنید.',
        category: 'TypeScript',
        date: '۱۴۰۳/۱۲/۲۰',
        readTime: '۹ دقیقه',
        image: 'https://picsum.photos/id/237/600/400',
        author: { name: 'سارا احمدی', avatar: 'https://i.pravatar.cc/100' },
    },
];

const BlogPage = () => {
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

                {/* Featured post */}
                <Link
                    href="#"
                    className="group mb-10 grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 md:grid-cols-2"
                >
                    <div className="relative aspect-video w-full overflow-hidden bg-muted md:aspect-auto">
                        <Image
                            src={posts[0].image}
                            alt={posts[0].title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                    <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
                        <Badge className="w-fit border-none bg-primary/10 text-primary">{posts[0].category}</Badge>
                        <h2 className="text-xl font-extrabold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                            {posts[0].title}
                        </h2>
                        <p className="leading-7 text-muted-foreground">{posts[0].excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {posts[0].date}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {posts[0].readTime}
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Posts grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.slice(1).map((post) => (
                        <Link
                            key={post.id}
                            href="#"
                            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                        >
                            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <Badge className="absolute right-3 top-3 border-none bg-background/90 text-foreground shadow backdrop-blur">
                                    {post.category}
                                </Badge>
                            </div>

                            <div className="flex flex-1 flex-col gap-3 p-5">
                                <h3 className="line-clamp-2 text-base font-bold leading-7 text-foreground transition-colors group-hover:text-primary">
                                    {post.title}
                                </h3>
                                <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>

                                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="relative h-7 w-7 flex-none overflow-hidden rounded-full bg-muted">
                                            <Image
                                                src={post.author.avatar}
                                                alt={post.author.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-foreground/80">
                                            {post.author.name}
                                        </span>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {post.readTime}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default BlogPage;
