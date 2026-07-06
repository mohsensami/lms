import Image from 'next/image';
import { Award, BookOpen, GraduationCap, Heart, Rocket, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';

const stats = [
    { icon: UsersRound, label: 'دانشجو', value: '۱۲,۰۰۰+' },
    { icon: BookOpen, label: 'دوره آموزشی', value: '۸۰+' },
    { icon: GraduationCap, label: 'مدرس متخصص', value: '۲۵+' },
    { icon: Award, label: 'سال تجربه', value: '۹+' },
];

const values = [
    {
        icon: Rocket,
        title: 'یادگیری عملی و پروژه‌محور',
        desc: 'دوره‌ها با تمرکز روی پروژه‌های واقعی طراحی شدن تا مهارت واقعی بگیرید، نه فقط تئوری.',
    },
    {
        icon: ShieldCheck,
        title: 'کیفیت تضمین‌شده',
        desc: 'محتوای هر دوره قبل از انتشار چندین بار بازبینی و به‌روزرسانی می‌شه.',
    },
    {
        icon: Heart,
        title: 'پشتیبانی همیشگی',
        desc: 'تیم پشتیبانی و مدرسین همیشه برای پاسخ به سوالات شما در دسترس هستن.',
    },
    {
        icon: Sparkles,
        title: 'مسیر شغلی مشخص',
        desc: 'هر دوره بخشی از یک مسیر یادگیری بزرگ‌تره که شما رو به یه هدف شغلی می‌رسونه.',
    },
];

const AboutPage = () => {
    return (
        <div className="bg-gradient-to-b from-primary/[0.06] to-transparent">
            {/* Hero */}
            <section className="container py-14 md:py-20">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                        درباره ما
                    </span>
                    <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        یادگیری رو ساده‌تر، عملی‌تر و لذت‌بخش‌تر می‌کنیم
                    </h1>
                    <p className="mt-4 leading-8 text-muted-foreground">
                        ما یه تیم کوچیک از برنامه‌نویس‌ها و مدرس‌هایی هستیم که باور داریم هرکسی می‌تونه با آموزش درست و
                        پشتیبانی مناسب، مهارت‌های حرفه‌ای یاد بگیره و مسیر شغلی خودش رو بسازه.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="container pb-14">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {stats.map(({ icon: Icon, label, value }) => (
                        <div key={label} className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                            <Icon className="mx-auto mb-3 h-6 w-6 text-primary" />
                            <p className="text-2xl font-extrabold text-foreground">{value}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Story */}
            <section className="container pb-16">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border shadow-sm">
                        <Image src="https://picsum.photos/600/400" alt="داستان ما" fill className="object-cover" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-foreground">داستان ما از کجا شروع شد</h2>
                        <p className="mt-4 leading-8 text-muted-foreground">
                            همه‌چیز از یه سوال ساده شروع شد: چرا خیلی‌ها بعد از گذروندن چندین دوره آموزشی هنوز نمی‌تونن
                            یه پروژه واقعی رو از صفر بسازن؟ ما تصمیم گرفتیم دوره‌هایی بسازیم که به‌جای حجم زیاد تئوری،
                            روی ساخت پروژه‌های واقعی و کاربردی تمرکز دارن.
                        </p>
                        <p className="mt-4 leading-8 text-muted-foreground">
                            امروز با کمک ده‌ها مدرس متخصص، هزاران دانشجو تونستن مهارت‌های جدید یاد بگیرن، وارد بازار کار
                            بشن یا کسب‌وکار خودشون رو راه بندازن.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="container pb-20">
                <div className="mb-10 text-center">
                    <h2 className="text-2xl font-extrabold text-foreground">چرا ما رو انتخاب کنید؟</h2>
                    <p className="mt-2 text-muted-foreground">اصولی که هیچ‌وقت ازشون عقب‌نشینی نمی‌کنیم</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                    {values.map(({ icon: Icon, title, desc }) => (
                        <div
                            key={title}
                            className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                        >
                            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">{title}</h3>
                                <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="container pb-20">
                <div className="flex flex-col items-center gap-5 rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground shadow-lg shadow-primary/25">
                    <h2 className="text-2xl font-extrabold sm:text-3xl">آماده‌ای شروع کنی؟</h2>
                    <p className="max-w-lg text-primary-foreground/80">
                        همین حالا سری به دوره‌های ما بزن و مسیر یادگیریت رو با انتخاب دوره مناسب شروع کن.
                    </p>
                    <a
                        href="/courses"
                        className="rounded-full bg-background px-6 py-3 text-sm font-bold text-primary shadow transition hover:opacity-90"
                    >
                        مشاهده دوره‌ها
                    </a>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
