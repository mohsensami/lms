import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone, Send, Instagram, MessageCircle } from 'lucide-react';

const contactDetails = [
    {
        icon: Phone,
        title: 'شماره تماس',
        value: '۰۲۱-۱۲۳۴۵۶۷۸',
        href: 'tel:02112345678',
    },
    {
        icon: Mail,
        title: 'ایمیل',
        value: 'support@example.com',
        href: 'mailto:support@example.com',
    },
    {
        icon: MapPin,
        title: 'آدرس',
        value: 'تهران، خیابان ولیعصر، پلاک ۱۲۰',
        href: '#',
    },
];

const ContactPage = () => {
    return (
        <div className="bg-gradient-to-b from-primary/[0.06] to-transparent">
            <section className="container py-14 md:py-20">
                {/* Header */}
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                        در تماس باشید
                    </span>
                    <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        چطور می‌تونیم کمکتون کنیم؟
                    </h1>
                    <p className="mt-4 leading-8 text-muted-foreground">
                        سوالی دارید، پیشنهادی دارید یا نیاز به پشتیبانی دارید؟ فرم زیر رو پر کنید یا از راه‌های زیر
                        مستقیم با ما در ارتباط باشید. معمولاً کمتر از ۲۴ ساعت پاسخ می‌دیم.
                    </p>
                </div>

                {/* Contact info cards */}
                <div className="mx-auto mb-12 grid max-w-4xl gap-5 sm:grid-cols-3">
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
                            <form className="grid gap-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">نام و نام خانوادگی</Label>
                                        <Input id="name" name="name" placeholder="مثلاً علی محمدی" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">ایمیل</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="subject">موضوع</Label>
                                    <Input id="subject" name="subject" placeholder="موضوع پیام شما" required />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="message">پیام</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="پیام خودتون رو اینجا بنویسید..."
                                        className="min-h-[140px]"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="mt-2 w-full gap-2 rounded-xl font-bold shadow-lg shadow-primary/25"
                                >
                                    ارسال پیام
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-6">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-foreground">ساعات پاسخگویی</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center justify-between border-b border-border pb-3">
                                    <span>شنبه تا چهارشنبه</span>
                                    <span className="font-semibold text-foreground">۹ الی ۱۸</span>
                                </li>
                                <li className="flex items-center justify-between border-b border-border pb-3">
                                    <span>پنجشنبه</span>
                                    <span className="font-semibold text-foreground">۹ الی ۱۳</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>جمعه و تعطیلات</span>
                                    <span className="font-semibold text-foreground">تعطیل</span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/25">
                            <MessageCircle className="mb-3 h-6 w-6" />
                            <h3 className="mb-2 text-lg font-bold">چت آنلاین</h3>
                            <p className="mb-5 text-sm text-primary-foreground/80">
                                برای پاسخ سریع‌تر می‌تونید از طریق پیج اینستاگرام هم پیام بدید.
                            </p>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-background/25"
                            >
                                <Instagram className="h-4 w-4" />
                                پیج اینستاگرام ما
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
