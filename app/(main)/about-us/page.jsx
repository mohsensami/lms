import Image from 'next/image';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/site-settings';
import { Award, BookOpen, GraduationCap, Heart, Rocket, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';

const STAT_ICONS = [UsersRound, BookOpen, GraduationCap, Award];
const VALUE_ICONS = [Rocket, ShieldCheck, Heart, Sparkles];

const AboutPage = async () => {
    const { about } = await getSiteSettings();
    const stats = about.stats.map((stat, index) => ({ ...stat, icon: STAT_ICONS[index % STAT_ICONS.length] }));
    const values = about.values.map((value, index) => ({ ...value, icon: VALUE_ICONS[index % VALUE_ICONS.length] }));

    return (
        <div className="bg-gradient-to-b from-primary/[0.06] to-transparent">
            {/* Hero */}
            <section className="container py-14 md:py-20">
                <div className="mx-auto max-w-2xl text-center">
                    {about.badge && (
                        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                            {about.badge}
                        </span>
                    )}
                    <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        {about.title}
                    </h1>
                    <p className="mt-4 leading-8 text-muted-foreground">{about.intro}</p>
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
                        {about.storyImageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={about.storyImageUrl} alt={about.storyTitle} className="absolute inset-0 h-full w-full object-cover" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-foreground">{about.storyTitle}</h2>
                        {about.storyP1 && <p className="mt-4 leading-8 text-muted-foreground">{about.storyP1}</p>}
                        {about.storyP2 && <p className="mt-4 leading-8 text-muted-foreground">{about.storyP2}</p>}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="container pb-20">
                <div className="mb-10 text-center">
                    <h2 className="text-2xl font-extrabold text-foreground">{about.valuesTitle}</h2>
                    {about.valuesSubtitle && <p className="mt-2 text-muted-foreground">{about.valuesSubtitle}</p>}
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
                    <h2 className="text-2xl font-extrabold sm:text-3xl">{about.ctaTitle}</h2>
                    <p className="max-w-lg text-primary-foreground/80">{about.ctaText}</p>
                    {about.ctaButton && (
                        <Link
                            href="/courses"
                            className="ui-btn rounded-[8px] bg-background px-6 py-3 text-sm font-bold text-primary shadow transition hover:opacity-90"
                        >
                            {about.ctaButton}
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
