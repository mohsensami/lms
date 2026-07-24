'use client';

import * as z from 'zod';
import { useState } from 'react';
import { SectionTitle } from '@/components/section-title';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { createReview } from '@/app/actions/review';

const formSchema = z.object({
    rating: z.coerce
        .number()
        .min(1, { message: 'امتیاز می‌تواند از ۱ تا ۵ باشد' })
        .max(5, { message: 'امتیاز می‌تواند از ۱ تا ۵ باشد' }),
    review: z.string().min(1, { message: 'متن دیدگاه الزامی است' }),
});

function CourseCommentForm({ courseId, loggedInUser }) {
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rating: '',
            review: '',
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = async (values) => {
        try {
            await createReview(values, loggedInUser?.id, courseId);
            toast.success('دیدگاه شما ثبت شد و پس از تایید ادمین نمایش داده می‌شود');
            form.reset({ rating: '', review: '' });
            setSubmitted(true);
            router.refresh();
        } catch (error) {
            toast.error('مشکلی در ثبت دیدگاه پیش آمد');
        }
    };

    return (
        <section className="pb-8 md:pb-12">
            <div className="container">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <SectionTitle className="mb-4">ثبت دیدگاه</SectionTitle>

                    {!loggedInUser ? (
                        <p className="text-sm text-muted-foreground">
                            برای ثبت دیدگاه ابتدا{' '}
                            <Link href="/login" className="font-semibold text-primary underline">
                                وارد حساب کاربری خود
                            </Link>{' '}
                            شوید.
                        </p>
                    ) : submitted ? (
                        <p className="text-sm text-muted-foreground">
                            دیدگاه شما ثبت شد و در وضعیت «در حال بررسی» قرار دارد. پس از تایید ادمین، در همین صفحه
                            نمایش داده می‌شود. می‌توانید وضعیت آن را از بخش{' '}
                            <Link href="/account/my-comments" className="font-semibold text-primary underline">
                                دیدگاه‌های من
                            </Link>{' '}
                            پیگیری کنید.
                        </p>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>امتیاز شما به دوره</FormLabel>
                                            <Select
                                                disabled={isSubmitting}
                                                onValueChange={field.onChange}
                                                value={field.value ? String(field.value) : ''}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="max-w-[160px]">
                                                        <SelectValue placeholder="انتخاب امتیاز" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {[1, 2, 3, 4, 5].map((value) => (
                                                        <SelectItem key={value} value={String(value)}>
                                                            {value} ستاره
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="review"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>دیدگاه شما</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    disabled={isSubmitting}
                                                    placeholder="نظر خود را درباره این دوره بنویسید"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                دیدگاه شما پس از تایید ادمین برای عموم نمایش داده می‌شود.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isSubmitting}>
                                    ثبت دیدگاه
                                </Button>
                            </form>
                        </Form>
                    )}
                </div>
            </div>
        </section>
    );
}

export default CourseCommentForm;
