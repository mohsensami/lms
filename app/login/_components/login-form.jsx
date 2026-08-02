'use client';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ceredntialLogin } from '@/app/actions';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import GoogleSignInButton from '@/components/google-signin-button';

export function LoginForm() {
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    async function onSubmit(event) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const formData = new FormData(event.currentTarget);
            const response = await ceredntialLogin(formData);

            if (!!response?.error) {
                setError(response.error);
                toast.error(response.error);
            } else {
                toast.success('با موفقیت وارد شدید');
                router.push(callbackUrl);
            }
        } catch (e) {
            const message = e.message || 'ورود ناموفق بود. دوباره امتحان کنید.';
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
                <CardTitle className="text-2xl">
                    <p className="mt-5 text-3xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-5xl lg:text-3xl lg:leading-tight font-pj">
                        <span className="relative inline-flex sm:inline">
                            <span className="bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-lg filter opacity-30 w-full h-full absolute inset-0"></span>
                            <span className="relative">ورود</span>
                        </span>
                    </p>
                </CardTitle>
                <CardDescription>برای ورود به حساب کاربری، ایمیل خود را در زیر وارد کنید</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">ایمیل</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">رمز عبور</Label>
                                {/* <Link href="#" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link> */}
                            </div>
                            <Input id="password" name="password" type="password" required disabled={isSubmitting} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    در حال ورود ...
                                </span>
                            ) : (
                                'ورود'
                            )}
                        </Button>
                    </div>
                    {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

                    <div className="my-4 flex items-center gap-3">
                        <span className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">یا</span>
                        <span className="h-px flex-1 bg-border" />
                    </div>
                    <GoogleSignInButton />

                    <div className="mt-4 text-center text-sm">
                        حساب کاربری ندارید؟{' '}
                        <Link href="/register/student" className="underline">
                            ثبت نام کنید
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
