import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone, Send, Instagram, MessageCircle } from 'lucide-react';
import { getSiteSettings } from '@/lib/site-settings';
import ContactForm from './contact-form';
import { toTelHref } from '@/lib/site-defaults';

const ContactPage = async () => {
    const { contact, social } = await getSiteSettings();

    // Only the contact methods the admin filled in are shown.
    const contactDetails = [
        contact.phone && { icon: Phone, title: 'شماره تماس', value: contact.phone, href: toTelHref(contact.phone) || '#' },
        contact.email && { icon: Mail, title: 'ایمیل', value: contact.email, href: `mailto:${contact.email}` },
        contact.address && { icon: MapPin, title: 'آدرس', value: contact.address, href: contact.mapUrl || '#' },
    ].filter(Boolean);
    const chatUrl = contact.chatUrl || social.instagram;

    return (
        <div className="bg-gradient-to-b from-primary/[0.06] to-transparent">
            <section className="container py-14 md:py-20">
                {/* Header */}
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    {contact.badge && (
                        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                            {contact.badge}
                        </span>
                    )}
                    <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        {contact.title}
                    </h1>
                    <p className="mt-4 leading-8 text-muted-foreground">{contact.intro}</p>
                </div>

                {/* Contact info cards */}
                <div className="mx-auto mb-12 grid max-w-4xl gap-5 sm:grid-cols-3 empty:hidden">
                    {contactDetails.map(({ icon: Icon, title, value, href }) => (
                        <a
                            key={title}
                            href={href}
                            className="group rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                        >
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <Icon className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-bold text-foreground">{title}</p>
                            <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                                {value}
                            </p>
                        </a>
                    ))}
                </div>

                {/* Form + side panel */}
                <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_1fr]">
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="p-6 sm:p-8">
                            <h2 className="mb-6 text-xl font-bold text-foreground">ارسال پیام</h2>
                            <ContactForm />
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-6">
                        {contact.hours.length > 0 && (
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-bold text-foreground">{contact.hoursTitle}</h3>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    {contact.hours.map((row, index) => (
                                        <li
                                            key={`${row.label}-${index}`}
                                            className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                                        >
                                            <span>{row.label}</span>
                                            <span className="font-semibold text-foreground">{row.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/25">
                            <MessageCircle className="mb-3 h-6 w-6" />
                            <h3 className="mb-2 text-lg font-bold">{contact.chatTitle}</h3>
                            <p className="mb-5 text-sm text-primary-foreground/80">{contact.chatText}</p>
                            {chatUrl && (
                                <a
                                    href={chatUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-background/25"
                                >
                                    <Instagram className="h-4 w-4" />
                                    {contact.chatButton}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
