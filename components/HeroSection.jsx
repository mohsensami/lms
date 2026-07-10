export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gray-950 text-white">
            {/* Background glow */}
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl"></div>
            <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"></div>

            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2">
                {/* Left content */}
                <div>
                    <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm text-gray-300">
                        🎓 یادگیری حرفه‌ای آنلاین
                    </span>

                    <h1 className="text-xl font-bold leading-tight md:text-3xl">
                        مهارت‌های جدید یاد بگیر،
                        <span className="text-purple-400"> آینده‌تو بساز</span>
                    </h1>

                    <p className="mt-5 text-gray-300 leading-relaxed">
                        به بهترین دوره ویدیویی دسترسی داشته باش و از سطح مبتدی تا پیشرفته رشد کن. مناسب برنامه‌نویسی،
                        طراحی، بیزینس و بیشتر.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button className="rounded-xl bg-purple-500 px-6 py-3 font-medium hover:bg-purple-600 transition">
                            شروع یادگیری
                        </button>
                        {/* <button className="rounded-xl border border-white/20 px-6 py-3 text-gray-200 hover:bg-white/10 transition">
                            مشاهده دوره‌ها
                        </button> */}
                    </div>

                    {/* stats */}
                    <div className="mt-10 flex gap-8 text-sm text-gray-400">
                        <div>
                            <div className="text-white text-xl font-bold">1200</div>
                            دیدگاه
                        </div>
                        <div>
                            <div className="text-white text-xl font-bold">85</div>
                            دانشجو
                        </div>
                        <div>
                            <div className="text-white text-xl font-bold">4.5</div>
                            رضایت
                        </div>
                    </div>
                </div>

                {/* Right content (video preview) */}
                <div className="relative">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
                        {/* fake video player */}
                        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                            <img
                                src="https://oompg81ca6.ufs.sh/f/a9eZat1sZEl6sGdvMwCnWRf4OPYloe6JZST3m81z2ihtVrwk"
                                alt="video preview"
                                className="h-full w-full object-cover opacity-80"
                            />

                            {/* play button */}
                            {/* <div className="absolute inset-0 flex items-center justify-center">
                                <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition">
                                    <div className="ml-1 h-0 w-0 border-y-8 border-y-transparent border-l-12 border-l-white"></div>
                                </button>
                            </div> */}
                        </div>

                        {/* caption */}
                        <div className="mt-3 text-sm text-gray-300">پیش‌نمایش دوره: آموزش متلب از صفر تا پیشرفته</div>
                    </div>

                    {/* floating card */}
                    <div className="absolute -bottom-6 -left-6 rounded-xl bg-white/10 px-4 py-3 backdrop-blur border border-white/10">
                        <div className="text-xs text-gray-300">🔥 محبوب‌ترین دوره</div>
                        <div className="text-white font-semibold">آموزش متلب</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
