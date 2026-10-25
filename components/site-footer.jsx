import React from 'react';
import Link from 'next/link';
import Logo from './logo';
import { Instagram, Linkedin, MessageCircle, PlayCircle, Send, Youtube } from 'lucide-react';
import { getSiteSettings } from '@/lib/site-settings';

// Only the networks the admin filled in are shown.
const SOCIALS = [
    { key: 'instagram', label: 'اینستاگرام', Icon: Instagram },
    { key: 'telegram', label: 'تلگرام', Icon: Send },
    { key: 'youtube', label: 'یوتیوب', Icon: Youtube },
    { key: 'aparat', label: 'آپارات', Icon: PlayCircle },
    { key: 'bale', label: 'بله', Icon: MessageCircle },
    { key: 'eitaa', label: 'ایتا', Icon: MessageCircle },
    { key: 'whatsapp', label: 'واتساپ', Icon: MessageCircle },
    { key: 'linkedin', label: 'لینکدین', Icon: Linkedin },
];

const SiteFooter = async () => {
    const { general, footer, social } = await getSiteSettings();
    const socials = SOCIALS.filter(({ key }) => social[key]);

    return (
        <footer className="border-t border-border bg-muted/40">
            <div className="container flex flex-col gap-10 py-12 md:flex-row md:justify-between">
                <div className="max-w-sm space-y-4">
                    <Logo logoUrl={general.logoUrl} siteName={general.name} />
                    {footer.about && <p className="text-sm leading-7 text-muted-foreground">{footer.about}</p>}
                    {socials.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {socials.map(({ key, label, Icon }) => (
                                <a
                                    key={key}
                                    href={social[key]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    title={label}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                                >
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {footer.links.length > 0 && (
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                        <div>
                            <h4 className="mb-4 text-sm font-bold text-foreground">دسترسی سریع</h4>
                            <ul className="space-y-3">
                                {footer.links.map((link) => (
                                    <li key={`${link.href}-${link.title}`}>
                                        <Link
                                            href={link.href || '#'}
                                            className="text-sm text-muted-foreground transition hover:text-primary"
                                        >
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-border">
                <div className="container flex flex-col items-center gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
                    <p>
                        © {new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date())} {footer.copyright}
                    </p>
                    {footer.showCredit && (
                        <div>
                            {footer.creditLabelUrl ? (
                                <a href={footer.creditLabelUrl} target="_blank" rel="noopener" className="hover:text-primary">
                                    {footer.creditLabel}
                                </a>
                            ) : (
                                footer.creditLabel
                            )}
                            {footer.creditLabel && footer.creditName ? ':' : ''}{' '}
                            {footer.creditNameUrl ? (
                                <a href={footer.creditNameUrl} target="_blank" rel="noopener" className="hover:text-primary">
                                    {footer.creditName}
                                </a>
                            ) : (
                                footer.creditName
                            )}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
};
export default SiteFooter;
