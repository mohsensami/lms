'use client';
import React from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createZarinpalPayment } from '../app/actions/zarinpal';
// import { createCheckoutSession } from "@/app/actions/stripe";

const EnrollCourse = ({ asLink, courseId, isLoggedIn = true }) => {
    const formAction = async (data) => {
        const { url } = await createZarinpalPayment(data);
        // const { url } = await createCheckoutSession(data);
        window.location.assign(url);
    };

    // Not logged in yet — send them to login instead of letting the
    // payment action throw an unhandled "you must be logged in" error.
    if (!isLoggedIn) {
        const loginHref = `/login?callbackUrl=/courses/${courseId}`;
        return asLink ? (
            <Link
                href={loginHref}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-secondary px-3 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
            >
                ثبت نام
                <ArrowLeft className="w-3" />
            </Link>
        ) : (
            <Link
                href={loginHref}
                className={cn(
                    buttonVariants({ size: 'lg' }),
                    'w-full rounded-xl text-base font-bold shadow-lg shadow-primary/25',
                )}
            >
                ثبت نام در دوره
            </Link>
        );
    }

    return (
        <>
            <form action={formAction}>
                <input type="hidden" name="courseId" value={courseId} />
                {asLink ? (
                    <Button
                        type="submit"
                        variant="secondary"
                        className="h-8 gap-1 rounded-full text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                        ثبت نام
                        <ArrowLeft className="w-3" />
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        className={cn(
                            buttonVariants({ size: 'lg' }),
                            'w-full rounded-xl text-base font-bold shadow-lg shadow-primary/25',
                        )}
                    >
                        ثبت نام در دوره
                    </Button>
                )}
            </form>
        </>
    );
};

export default EnrollCourse;
