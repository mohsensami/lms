import Image from 'next/image';
import React from 'react';

const Support = () => {
    return (
        <div className="bg-muted/40 px-4 py-12 md:px-16">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 md:flex-row">
                <div className="flex-1">
                    <p className="mt-5 text-3xl font-bold leading-tight text-foreground sm:text-5xl sm:leading-tight">
                        <span className="relative inline-flex sm:inline">
                            <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-primary via-fuchsia-400 to-primary blur-lg filter opacity-30"></span>
                            <span className="relative">برای پشتیبانی با ما در تماس باشید</span>
                        </span>
                    </p>

<<<<<<< HEAD
                    <p className="mb-8 mt-8 leading-relaxed text-muted-foreground">
                        من بنیان‌گذار آکادمی آموزش آنلاین و مدرسی با فروش موفق در سطح جهانی هستم. مأموریت من کمک به
                        برنامه‌نویسان مبتدی و حرفه‌ای برای افزایش مهارت، درآمد بیشتر و در نهایت تغییر زندگی‌شان است.
                    </p>
=======
          <p className="text-black leading-relaxed mb-8 mt-8">
            من بنیانگذار آکادمی یادگیری آسان و مدرس پرفروش آنلاین در سراسر جهان هستم. ماموریت زندگی من کمک به مهندسان نرم‌افزار تازه‌کار و حرفه‌ای است تا مهارت‌های خود را افزایش دهند، پول بیشتری به دست آورند و در نهایت زندگی خود را به سمت بهتر شدن تغییر دهند.
          </p>
>>>>>>> farsi

                    <div className="flex flex-wrap gap-4">
                        <a
                            href="/contact-us"
                            className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
                        >
                            تماس با ما
                        </a>

                        <a
                            href="#"
                            className="rounded-lg bg-foreground px-6 py-3 font-semibold text-background shadow transition hover:opacity-90"
                        >
                            تماس با پشتیبانی
                        </a>
                    </div>
                </div>

                <div className="flex flex-1 justify-center">
                    <Image
                        src="/assets/images/support1.png"
                        alt="پشتیبانی"
                        width={500}
                        height={400}
                        className="rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
};

export default Support;
