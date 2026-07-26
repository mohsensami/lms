'use client';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import GoogleSignInButton from '@/components/google-signin-button';

export function SignupForm({ role }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(event.currentTarget);
            const firstName = formData.get('first-name');
            const lastName = formData.get('last-name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            if (password !== confirmPassword) {
                toast.error('رمزهای عبور با هم مطابقت ندارند.');
                setIsSubmitting(false);
                return;
            }

            if (!/^09\d{9}$/.test(phone)) {
                toast.error('شماره تلفن همراه معتبر نیست. شماره را به‌صورت 09xxxxxxxxx وارد کنید.');
                setIsSubmitting(false);
                return;
            }

            const userRole = role === 'student' || role === 'instructor' ? role : 'student';

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phone,
                    password,
                    userRole,
                }),
            });

            if (response.status === 201) {
                toast.success('حساب کاربری با موفقیت ساخته شد.');
                router.push('/login');
            } else {
                const payload = await response.json().catch(() => null);
                toast.error(payload?.message || 'ثبت‌نام ناموفق بود. دوباره امتحان کنید.');
            }
        } catch (e) {
            toast.error(e.message || 'ثبت‌نام ناموفق بود. دوباره امتحان کنید.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl">
                    <p className="mt-5 text-3xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-5xl lg:text-3xl lg:leading-tight font-pj">
                        <span className="relative inline-flex sm:inline">
                            <span className="bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-lg filter opacity-30 w-full h-full absolute inset-0"></span>
                            <span className="relative">ثبت نام</span>
                        </span>
                    </p>
                </CardTitle>
                <CardDescription>برای ایجاد حساب کاربری، اطلاعات خود را وارد کنید</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first-name">نام</Label>
                                <Input id="first-name" name="first-name" placeholder="علی" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last-name">نام خانوادگی</Label>
                                <Input id="last-name" name="last-name" placeholder="محمدی" required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">ایمیل</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">شماره تلفن همراه</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                dir="ltr"
                                placeholder="09xxxxxxxxx"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">رمز عبور</Label>
                            <Input id="password" name="password" type="password" required disabled={isSubmitting} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'در حال ارسال اطلاعات ...' : 'ثبت نام'}
                        </Button>
                    </div>

                    <div className="my-4 flex items-center gap-3">
                        <span className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">یا</span>
                        <span className="h-px flex-1 bg-border" />
                    </div>
                    <GoogleSignInButton label="ثبت‌نام با گوگل" />
                    <div className="mt-4 text-center text-sm">
                        قبلاً حساب کاربری دارید؟{' '}
                        <Link href="/login" className="underline">
                            ورود
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
