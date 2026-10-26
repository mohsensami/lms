import Link from 'next/link';
import { getSiteSettings } from '@/lib/site-settings';

// All texts, the button, the stats and the preview picture come from
// Settings -> home page.
export default async function HeroSection() {
    const { home } = await getSiteSettings();

    return (
        <section className="relative overflow-hidden bg-gray-950 text-white">
            {/* Background glow */}
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl"></div>
            <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl"></div>

            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2">
                {/* Left content */}
                <div>
                    {home.badge && (
                        <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm text-gray-300">
                            {home.badge}
                        </span>
                    )}

                    <h1 className="text-xl font-bold leading-tight md:text-3xl">
                        {home.title}
                        {home.highlight && <span className="text-primary"> {home.highlight}</span>}
                    </h1>

                    {home.subtitle && <p className="mt-5 text-gray-300 leading-relaxed">{home.subtitle}</p>}

                    {home.buttonText && (
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={home.buttonHref || '/courses'}
                                className="ui-btn rounded-[8px] bg-primary px-6 py-3 text-center font-medium text-primary-foreground transition hover:bg-primary/90"
                            >
                                {home.buttonText}
                            </Link>
                        </div>
                    )}

                    {/* stats */}
                    {home.showStats && home.stats.length > 0 && (
                        <div className="mt-10 flex gap-8 text-sm text-gray-400">
                            {home.stats.map((stat) => (
                                <div key={`${stat.label}-${stat.value}`}>
                                    <div className="text-white text-xl font-bold">{stat.value}</div>
                                    {stat.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right content (video preview) */}
                {home.previewImageUrl && (
                    <div className="relative">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
                            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={home.previewImageUrl}
                                    alt={home.previewCaption || 'پیش‌نمایش'}
                                    className="h-full w-full object-cover opacity-80"
                                />
                            </div>

                            {home.previewCaption && <div className="mt-3 text-sm text-gray-300">{home.previewCaption}</div>}
                        </div>

                        {(home.floatLabel || home.floatTitle) && (
                            <div className="absolute -bottom-6 -left-6 rounded-xl bg-white/10 px-4 py-3 backdrop-blur border border-white/10">
                                <div className="text-xs text-gray-300">{home.floatLabel}</div>
                                <div className="text-white font-semibold">{home.floatTitle}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
