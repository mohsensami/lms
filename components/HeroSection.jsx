'use client';

import { motion } from 'framer-motion';

export default function StartupHero() {
    return (
        <div className="relative overflow-hidden bg-[#070312] text-white">
            {/* 🌈 Purple Gradient Mesh Background */}
            <div className="absolute inset-0">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/40 blur-[140px]" />
                <div className="absolute top-40 right-[-100px] h-[500px] w-[500px] rounded-full bg-fuchsia-500/30 blur-[160px]" />
                <div className="absolute bottom-[-120px] left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[160px]" />
            </div>

            {/* subtle grid */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:30px_30px] opacity-30" />

            <div className="relative mx-auto max-w-6xl px-6 py-24">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur"
                >
                    ⚡ پلتفرم آموزش مدرن + پروژه واقعی + بازار کار
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center text-5xl font-bold leading-tight md:text-7xl"
                >
                    یاد بگیر، بساز،
                    <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                        رشد کن
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <p className="mx-auto mt-6 max-w-2xl text-center text-gray-400">
                    آموزش‌های ویدیویی مدرن برای ورود سریع به بازار کار. از مبتدی تا حرفه‌ای، با پروژه‌های واقعی و مسیر
                    یادگیری مشخص.
                </p>

                {/* SEARCH */}
                <div className="mx-auto mt-10 max-w-2xl">
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition hover:border-purple-400/30">
                        <input
                            className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-gray-500"
                            placeholder="چی می‌خوای یاد بگیری؟ React، UI، Python..."
                        />
                        <button className="rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-6 py-3 text-sm font-medium hover:opacity-90 transition">
                            جستجو
                        </button>
                    </div>

                    {/* quick tags */}
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {['React', 'Next.js', 'UI Design', 'Node.js', 'Python'].map((t) => (
                            <span
                                key={t}
                                className="cursor-pointer rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300 hover:bg-white/10 transition"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-10 flex justify-center gap-4">
                    <button className="rounded-xl bg-white px-6 py-3 font-medium text-black hover:bg-gray-200 transition">
                        شروع رایگان
                    </button>
                    <button className="rounded-xl border border-white/15 px-6 py-3 text-white hover:bg-white/10 transition">
                        دیدن مسیر یادگیری
                    </button>
                </div>
            </div>
        </div>
    );
}
