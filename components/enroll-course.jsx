'use client';
import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createZarinpalPayment } from '../app/actions/zarinpal';
// import { createCheckoutSession } from "@/app/actions/stripe";

const EnrollCourse = ({ asLink, courseId }) => {
    const formAction = async (data) => {
        const { url } = await createZarinpalPayment(data);
        // const { url } = await createCheckoutSession(data);
        window.location.assign(url);
    };

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
