import React from 'react';
import Link from 'next/link';
import Logo from './logo';
import { Instagram, Send, Youtube } from 'lucide-react';

const footerLinks = [
    { title: 'صفحه نخست', href: '/' },
    { title: 'دوره‌ها', href: '/courses' },
    { title: 'درباره ما', href: '/pricing' },
    { title: 'وبلاگ', href: '/blog' },
    { title: 'تماس با ما', href: '/documentation' },
];

const SiteFooter = () => {
    return (
        <footer className="border-t border-border bg-muted/40">
            <div className="container flex flex-col gap-10 py-12 md:flex-row md:justify-between">
                <div className="max-w-sm space-y-4">
                    <Logo />
                    <p className="text-sm leading-7 text-muted-foreground">
                        پلتفرم آموزش آنلاین برای یادگیری مهارت‌های واقعی برنامه‌نویسی و ورود سریع‌تر به بازار کار.
                    </p>
                    <div className="flex items-center gap-2">
                        {[Instagram, Send, Youtube].map((Icon, index) => (
                            <a
                                key={index}
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                            >
                                <Icon className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                    <div>
                        <h4 className="mb-4 text-sm font-bold text-foreground">دسترسی سریع</h4>
                        <ul className="space-y-3">
                            {footerLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-muted-foreground transition hover:text-primary">
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-border">
                <div className="container flex flex-col items-center gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
                    <p>© {new Date().getFullYear()} تمامی حقوق محفوظ است.</p>
                    <p>ساخته شده با ❤ توسط Easy Learning</p>
                </div>
            </div>
        </footer>
    );
};

export default SiteFooter;
